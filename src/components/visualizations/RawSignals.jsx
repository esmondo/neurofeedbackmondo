import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import museService from '../../services/MuseService';
import { channelNames, channelColors } from '../../utils/constants';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Constants
const samplingRate = 256; // Hz
const rawDisplaySeconds = 5; // Show 5 seconds of data

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RawSignalsTitle = styled.h2`
  margin: 0;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ChannelContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ChannelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ChannelTitle = styled.h3`
  margin: 0;
  color: ${props => props.color};
`;

const FilterControls = styled.div`
  display: flex;
  gap: 1rem;
`;

const FilterButton = styled.button`
  background-color: ${props => props.active ? '#2563eb' : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  border: 1px solid ${props => props.active ? '#2563eb' : '#e5e7eb'};
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? '#1d4ed8' : '#f9fafb'};
  }
`;

const ScaleControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  select {
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    background-color: white;
    font-size: 0.875rem;
  }
`;

const NotConnectedMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 8px;
  padding: 3rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-top: 2rem;

  h3 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
  }
`;

const RawSignals = () => {
  // Connection status
  const [connected, setConnected] = useState(false);
  
  // Filter options
  const [filter, setFilter] = useState('none'); // 'none', 'lowpass', 'highpass', 'bandpass'
  
  // Scale factor for visualization
  const [scale, setScale] = useState(1.0);
  
  // Store raw data for each channel
  const [channelData, setChannelData] = useState(() => {
    const initialData = {};
    channelNames.forEach(channel => {
      initialData[channel] = {
        labels: Array(samplingRate * rawDisplaySeconds).fill(''),
        datasets: [
          {
            label: channel,
            data: Array(samplingRate * rawDisplaySeconds).fill(0),
            borderColor: channelColors[channel],
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.2,
          }
        ]
      };
    });
    return initialData;
  });
  
  // Keep track of subscriptions
  const subscriptionsRef = useRef([]);
  
  useEffect(() => {
    // Subscribe to connection status
    const connectionSubscription = museService.connectionStatus.subscribe(status => {
      setConnected(status);
    });
    
    subscriptionsRef.current.push(connectionSubscription);
    
    return () => {
      // Clean up all subscriptions
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, []);
  
  // Set up data subscriptions when connection status changes
  useEffect(() => {
    if (connected) {
      // Clear any existing data subscriptions
      subscriptionsRef.current.forEach(sub => {
        if (sub.name !== 'connectionStatus') {
          sub.unsubscribe();
        }
      });
      
      // Subscribe to each channel's data
      channelNames.forEach(channel => {
        const subscription = museService.eegData[channel].subscribe(reading => {
          if (reading && reading.samples) {
            updateChannelData(channel, reading.samples);
          }
        });
        
        subscription.name = channel;
        subscriptionsRef.current.push(subscription);
      });
    }
  }, [connected]);
  
  // Update channel data with new samples
  const updateChannelData = (channel, newSamples) => {
    setChannelData(prevData => {
      // Apply filtering if needed
      const processedSamples = applyFilter(newSamples, filter);
      
      // Scale the samples
      const scaledSamples = processedSamples.map(sample => sample * scale);
      
      // Get previous data and labels
      const prevDataset = prevData[channel].datasets[0];
      const prevSamples = prevDataset.data;
      
      // Create new data array by removing oldest samples and adding new ones
      const newData = [...prevSamples.slice(newSamples.length), ...scaledSamples];
      
      return {
        ...prevData,
        [channel]: {
          ...prevData[channel],
          datasets: [
            {
              ...prevDataset,
              data: newData
            }
          ]
        }
      };
    });
  };
  
  // Apply different filters to the EEG data
  const applyFilter = (samples, filterType) => {
    // Simple filtering implementation - in a real app you'd use more sophisticated methods
    switch (filterType) {
      case 'lowpass':
        // Simple moving average filter (low-pass)
        return samples.map((sample, i, arr) => {
          if (i < 2) return sample;
          return (arr[i] + arr[i-1] + arr[i-2]) / 3;
        });
        
      case 'highpass':
        // Simple high-pass filter (difference)
        return samples.map((sample, i, arr) => {
          if (i < 1) return sample;
          return sample - arr[i-1];
        });
        
      case 'bandpass':
        // Combine low and high pass
        const lowPassed = samples.map((sample, i, arr) => {
          if (i < 2) return sample;
          return (arr[i] + arr[i-1] + arr[i-2]) / 3;
        });
        
        return lowPassed.map((sample, i, arr) => {
          if (i < 1) return sample;
          return sample - arr[i-1];
        });
        
      case 'none':
      default:
        return samples;
    }
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Amplitude (μV)'
        },
        min: -500 * scale,
        max: 500 * scale
      },
      x: {
        display: false
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    animation: false,
    elements: {
      line: {
        tension: 0.4
      }
    }
  };
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  const handleScaleChange = (e) => {
    setScale(parseFloat(e.target.value));
  };
  
  const navigateHome = () => {
    window.location.href = '/';
  };
  
  return (
    <Container>
      <Header>
        <RawSignalsTitle>Raw EEG Signals</RawSignalsTitle>
        
        <ControlsContainer>
          <FilterControls>
            <FilterButton 
              active={filter === 'none'} 
              onClick={() => handleFilterChange('none')}
            >
              Raw
            </FilterButton>
            <FilterButton 
              active={filter === 'lowpass'} 
              onClick={() => handleFilterChange('lowpass')}
            >
              Low Pass
            </FilterButton>
            <FilterButton 
              active={filter === 'highpass'} 
              onClick={() => handleFilterChange('highpass')}
            >
              High Pass
            </FilterButton>
            <FilterButton 
              active={filter === 'bandpass'} 
              onClick={() => handleFilterChange('bandpass')}
            >
              Band Pass
            </FilterButton>
          </FilterControls>
          
          <ScaleControls>
            <label>Scale:</label>
            <select value={scale} onChange={handleScaleChange}>
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="5">5x</option>
              <option value="10">10x</option>
            </select>
          </ScaleControls>
        </ControlsContainer>
      </Header>
      
      {connected ? (
        channelNames.map(channel => (
          <ChannelContainer key={channel}>
            <ChannelHeader>
              <ChannelTitle color={channelColors[channel]}>{channel}</ChannelTitle>
            </ChannelHeader>
            <div style={{ height: '150px' }}>
              <Line 
                data={channelData[channel]} 
                options={chartOptions} 
              />
            </div>
          </ChannelContainer>
        ))
      ) : (
        <NotConnectedMessage>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#9CA3AF"/>
            <path d="M7 10.5L11 16.5L12.5 13.5L15.5 16.5L17 10.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Not Connected to Muse</h3>
          <p>Please connect to your Muse headset from the dashboard to view raw EEG signals.</p>
          <button onClick={navigateHome}>
            Go to Dashboard
          </button>
        </NotConnectedMessage>
      )}
    </Container>
  );
};

export default RawSignals; 