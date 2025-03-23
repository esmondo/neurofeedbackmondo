import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import museService from '../../services/MuseService';
import { channelNames, bandColors, frequencyBands } from '../../utils/constants';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

const FrequencyBandsTitle = styled.h2`
  margin: 0;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ViewSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  
  button {
    background-color: ${props => props.active ? 'var(--primary)' : 'white'};
    color: ${props => props.active ? 'white' : 'var(--dark)'};
    border: 1px solid ${props => props.active ? 'var(--primary)' : 'var(--gray-light)'};
    
    &:hover {
      background-color: ${props => props.active ? 'var(--primary-dark)' : 'var(--gray-light)'};
    }
  }
`;

const ChartContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: ${props => props.height || '300px'};
`;

const BandInfoContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const BandCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-width: 200px;
  border-top: 4px solid ${props => props.color};
`;

const BandName = styled.h3`
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: ${props => props.color};
`;

const BandDescription = styled.p`
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--gray);
`;

const BandValue = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
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
`;

// Band descriptions
const bandDescriptions = {
  delta: 'Associated with deep sleep and unconsciousness. High levels when awake may indicate brain injuries or learning problems.',
  theta: 'Present during deep relaxation and meditation. Associated with creativity, intuition, and daydreaming.',
  alpha: 'Dominant during relaxed wakefulness with closed eyes. Indicates relaxation and reduced anxiety.',
  beta: 'Associated with active, busy thinking and active concentration. Dominant during normal waking consciousness.',
  gamma: 'Related to simultaneous processing of information from different brain areas. Associated with higher cognitive functioning.'
};

const FrequencyBands = () => {
  // View mode: 'bar', 'spectrum', 'time'
  const [viewMode, setViewMode] = useState('bar');
  
  // Connection status
  const [connected, setConnected] = useState(false);
  
  // Current power values by frequency band
  const [powerValues, setPowerValues] = useState({
    delta: 0,
    theta: 0,
    alpha: 0,
    beta: 0,
    gamma: 0
  });
  
  // Channel to display for spectrum and time views
  const [selectedChannel, setSelectedChannel] = useState('average');
  
  // Bar chart data
  const [barData, setBarData] = useState({
    labels: Object.keys(frequencyBands),
    datasets: [
      {
        label: 'Power',
        data: [0, 0, 0, 0, 0],
        backgroundColor: Object.values(bandColors),
        borderWidth: 1,
      },
    ],
  });
  
  // Spectrum data (power by frequency)
  const [spectrumData, setSpectrumData] = useState({
    labels: Array.from({length: 50}, (_, i) => i + 1), // 1-50 Hz
    datasets: [
      {
        label: 'Power Spectrum',
        data: Array(50).fill(0),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  });
  
  // Time series data for each band
  const [timeSeriesData, setTimeSeriesData] = useState({
    labels: Array(60).fill(''),
    datasets: Object.keys(frequencyBands).map(band => ({
      label: band.charAt(0).toUpperCase() + band.slice(1),
      data: Array(60).fill(0),
      borderColor: bandColors[band],
      backgroundColor: `${bandColors[band]}20`,
      fill: false,
      tension: 0.4,
    })),
  });
  
  useEffect(() => {
    // Subscribe to connection status
    const connectionSubscription = museService.connectionStatus.subscribe(status => {
      setConnected(status);
    });
    
    // Subscribe to EEG power data
    const powerSubscription = museService.eegPower.subscribe(power => {
      // Calculate average power across channels for each band
      const avgPower = {
        delta: power.delta.reduce((a, b) => a + b, 0) / power.delta.length,
        theta: power.theta.reduce((a, b) => a + b, 0) / power.theta.length,
        alpha: power.alpha.reduce((a, b) => a + b, 0) / power.alpha.length,
        beta: power.beta.reduce((a, b) => a + b, 0) / power.beta.length,
        gamma: power.gamma.reduce((a, b) => a + b, 0) / power.gamma.length
      };
      
      // Update current power values
      setPowerValues(avgPower);
      
      // Update bar chart data
      setBarData({
        labels: Object.keys(frequencyBands).map(band => band.charAt(0).toUpperCase() + band.slice(1)),
        datasets: [
          {
            label: 'Power',
            data: Object.values(avgPower),
            backgroundColor: Object.values(bandColors),
            borderWidth: 1,
          },
        ],
      });
      
      // Update time series data
      setTimeSeriesData(prev => {
        const newData = {};
        Object.keys(frequencyBands).forEach((band, i) => {
          newData[i] = {
            ...prev.datasets[i],
            data: [...prev.datasets[i].data.slice(1), avgPower[band]]
          };
        });
        
        return {
          labels: [...prev.labels.slice(1), ''],
          datasets: Object.values(newData)
        };
      });
      
      // Generate mock spectrum data
      // In a real app, this would come from a proper FFT
      // of the raw EEG signal
      const mockSpectrum = Array.from({length: 50}, (_, i) => {
        // Create a semi-realistic looking spectrum based on the bands
        let value = 0;
        
        // Delta (1-4 Hz)
        if (i < 4) {
          value = avgPower.delta * (0.7 + Math.random() * 0.6) * (4 - i) / 4;
        }
        // Theta (4-8 Hz)
        else if (i < 8) {
          value = avgPower.theta * (0.7 + Math.random() * 0.6) * (8 - i) / 4;
        }
        // Alpha (8-13 Hz)
        else if (i < 13) {
          value = avgPower.alpha * (0.7 + Math.random() * 0.6) * (13 - i) / 5;
        }
        // Beta (13-30 Hz)
        else if (i < 30) {
          value = avgPower.beta * (0.7 + Math.random() * 0.6) * (30 - i) / 17;
        }
        // Gamma (30-50 Hz)
        else {
          value = avgPower.gamma * (0.7 + Math.random() * 0.6) * (50 - i) / 20;
        }
        
        return value;
      });
      
      setSpectrumData({
        labels: Array.from({length: 50}, (_, i) => i + 1),
        datasets: [
          {
            label: 'Power Spectrum',
            data: mockSpectrum,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    });
    
    return () => {
      connectionSubscription.unsubscribe();
      powerSubscription.unsubscribe();
    };
  }, []);
  
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Power (μV²)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Frequency Bands'
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };
  
  const spectrumOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Power (μV²)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Frequency (Hz)'
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };
  
  const timeSeriesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Power (μV²)'
        }
      },
      x: {
        display: false,
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
  };
  
  return (
    <Container>
      <Header>
        <FrequencyBandsTitle>Frequency Band Power</FrequencyBandsTitle>
        
        <ControlsContainer>
          <ViewSelector>
            <button 
              active={viewMode === 'bar'} 
              onClick={() => setViewMode('bar')}
              style={{
                backgroundColor: viewMode === 'bar' ? 'var(--primary)' : 'white',
                color: viewMode === 'bar' ? 'white' : 'var(--dark)'
              }}
            >
              Bar Chart
            </button>
            <button 
              active={viewMode === 'spectrum'} 
              onClick={() => setViewMode('spectrum')}
              style={{
                backgroundColor: viewMode === 'spectrum' ? 'var(--primary)' : 'white',
                color: viewMode === 'spectrum' ? 'white' : 'var(--dark)'
              }}
            >
              Spectrum
            </button>
            <button 
              active={viewMode === 'time'} 
              onClick={() => setViewMode('time')}
              style={{
                backgroundColor: viewMode === 'time' ? 'var(--primary)' : 'white',
                color: viewMode === 'time' ? 'white' : 'var(--dark)'
              }}
            >
              Time Series
            </button>
          </ViewSelector>
          
          {(viewMode === 'spectrum' || viewMode === 'time') && (
            <div>
              <label style={{ marginRight: '0.5rem' }}>Channel:</label>
              <select 
                value={selectedChannel} 
                onChange={e => setSelectedChannel(e.target.value)}
              >
                <option value="average">Average</option>
                {channelNames.map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>
          )}
        </ControlsContainer>
      </Header>
      
      {connected ? (
        <>
          <ChartContainer height="400px">
            {viewMode === 'bar' && (
              <Bar data={barData} options={barOptions} />
            )}
            
            {viewMode === 'spectrum' && (
              <Line data={spectrumData} options={spectrumOptions} />
            )}
            
            {viewMode === 'time' && (
              <Line data={timeSeriesData} options={timeSeriesOptions} />
            )}
          </ChartContainer>
          
          <BandInfoContainer>
            {Object.keys(frequencyBands).map(band => (
              <BandCard key={band} color={bandColors[band]}>
                <BandName color={bandColors[band]}>
                  {band.charAt(0).toUpperCase() + band.slice(1)}
                </BandName>
                <div>
                  {frequencyBands[band].min}-{frequencyBands[band].max} Hz
                </div>
                <BandDescription>
                  {bandDescriptions[band]}
                </BandDescription>
                <BandValue>
                  {powerValues[band].toFixed(1)} μV²
                </BandValue>
              </BandCard>
            ))}
          </BandInfoContainer>
        </>
      ) : (
        <NotConnectedMessage>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#9CA3AF"/>
            <path d="M7 10.5L11 16.5L12.5 13.5L15.5 16.5L17 10.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Not Connected to Muse</h3>
          <p>Please connect to your Muse headset from the dashboard to view frequency band data.</p>
          <button onClick={() => window.location.href = '/'}>
            Go to Dashboard
          </button>
        </NotConnectedMessage>
      )}
    </Container>
  );
};

export default FrequencyBands; 