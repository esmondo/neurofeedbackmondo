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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ChartTitle = styled.h2`
  margin: 0;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const ChartContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: ${props => props.height || '500px'};
`;

const SeparatedChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

const TimeScaleSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  .label {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .buttons {
    display: flex;
    gap: 0.5rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  .label {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .toggle {
    display: flex;
    gap: 0.5rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
`;

const ChannelToggleContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ChannelToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => props.active ? props.color + '30' : 'white'};
  color: ${props => props.active ? props.color : '#374151'};
  border: 1px solid ${props => props.active ? props.color : '#e5e7eb'};
  
  &:hover {
    background-color: ${props => props.active ? props.color + '40' : '#f9fafb'};
  }
  
  .color-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.color};
  }
`;

const AmplitudeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  input {
    width: 150px;
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
  height: 500px;
  
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
    
    &:hover {
      background-color: #1d4ed8;
    }
  }
`;

const RawSignals = () => {
  // Connection status
  const [connected, setConnected] = useState(false);
  
  // Time scale in seconds (default 5s)
  const [timeScale, setTimeScale] = useState(5);
  
  // View mode: 'overlapped' or 'separated'
  const [viewMode, setViewMode] = useState('overlapped');
  
  // Number of data points to display based on time scale and sampling rate
  const [dataPointCount, setDataPointCount] = useState(5 * 256); // 5 seconds * 256 Hz
  
  // Amplitude scale factor (for vertical zoom)
  const [amplitudeScale, setAmplitudeScale] = useState(1.0);
  
  // Visible channels
  const [visibleChannels, setVisibleChannels] = useState(
    Object.fromEntries(channelNames.map(channel => [channel, true]))
  );
  
  // EEG data buffers for each channel
  const eegDataRef = useRef(
    Object.fromEntries(channelNames.map(channel => [channel, []]))
  );
  
  // Chart data
  const [chartData, setChartData] = useState({
    labels: Array(dataPointCount).fill(''),
    datasets: channelNames.map((channel, index) => ({
      label: channel,
      data: Array(dataPointCount).fill(0),
      borderColor: channelColors[channel],
      backgroundColor: 'transparent',
      pointRadius: 0,
      borderWidth: 1.5,
      tension: 0.2,
      hidden: !visibleChannels[channel],
    })),
  });
  
  // Update data point count when time scale changes
  useEffect(() => {
    const samplingRate = 256; // Hz
    const newDataPointCount = timeScale * samplingRate;
    setDataPointCount(newDataPointCount);
    
    // Resize existing data buffers
    Object.keys(eegDataRef.current).forEach(channel => {
      const currentData = eegDataRef.current[channel];
      if (currentData.length > newDataPointCount) {
        // Truncate if buffer is larger than needed
        eegDataRef.current[channel] = currentData.slice(-newDataPointCount);
      } else {
        // Pad with zeros if buffer is smaller than needed
        eegDataRef.current[channel] = [
          ...Array(newDataPointCount - currentData.length).fill(0),
          ...currentData
        ];
      }
    });
    
    // Update chart data
    updateChartData();
  }, [timeScale]);
  
  // Helper function to update chart data from buffers
  const updateChartData = () => {
    setChartData({
      labels: Array(dataPointCount).fill(''),
      datasets: channelNames.map(channel => ({
        label: channel,
        data: eegDataRef.current[channel].slice(-dataPointCount),
        borderColor: channelColors[channel],
        backgroundColor: 'transparent',
        pointRadius: 0,
        borderWidth: 1.5,
        tension: 0.2,
        hidden: !visibleChannels[channel],
      })),
    });
  };
  
  // Toggle channel visibility
  const toggleChannel = (channel) => {
    setVisibleChannels(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));
  };
  
  // Subscribe to EEG data and connection status
  useEffect(() => {
    // Subscribe to connection status
    const connectionSubscription = museService.connectionStatus.subscribe(status => {
      setConnected(status);
    });
    
    // Subscribe to EEG data for each channel
    const channelSubscriptions = channelNames.map(channel => {
      return museService.eegData[channel].subscribe(data => {
        if (!data) return;
        
        // Update data buffer for this channel only
        // Add new data points to the buffer
        const samples = data.samples || [];
        samples.forEach(sample => {
          eegDataRef.current[channel].push(sample * amplitudeScale);
          
          // Keep buffer size limited to dataPointCount
          if (eegDataRef.current[channel].length > dataPointCount) {
            eegDataRef.current[channel].shift();
          }
        });
      });
    });
    
    // Update chart data at regular intervals
    const updateInterval = setInterval(() => {
      updateChartData();
    }, 100); // Update 10 times per second
    
    return () => {
      connectionSubscription.unsubscribe();
      channelSubscriptions.forEach(subscription => subscription.unsubscribe());
      clearInterval(updateInterval);
    };
  }, [dataPointCount, amplitudeScale]);
  
  // Chart options for overlapped view
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Disable animation for better performance
    scales: {
      x: {
        display: false,
      },
      y: {
        title: {
          display: true,
          text: 'Amplitude (μV)'
        },
        min: -amplitudeScale * 100, // Adjust y-axis based on amplitude scale
        max: amplitudeScale * 100,
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false, // Disable tooltips for better performance
      }
    },
  };
  
  // Chart options for separated view (individual per channel)
  const getChannelChartOptions = (channel) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      x: {
        display: false,
      },
      y: {
        title: {
          display: true,
          text: `${channel} (μV)`
        },
        min: -amplitudeScale * 100,
        max: amplitudeScale * 100,
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      }
    },
  });
  
  // Get chart data for a single channel
  const getSingleChannelData = (channel) => ({
    labels: Array(dataPointCount).fill(''),
    datasets: [{
      label: channel,
      data: eegDataRef.current[channel].slice(-dataPointCount),
      borderColor: channelColors[channel],
      backgroundColor: 'transparent',
      pointRadius: 0,
      borderWidth: 1.5,
      tension: 0.2,
    }],
  });
  
  return (
    <Container>
      <Header>
        <ChartTitle>Raw EEG Signals</ChartTitle>
        
        <ControlsContainer>
          <TimeScaleSelector>
            <div className="label">Time Window:</div>
            <div className="buttons">
              {[1, 2, 5, 10].map(scale => (
                <button
                  key={scale}
                  onClick={() => setTimeScale(scale)}
                  style={{
                    backgroundColor: timeScale === scale ? '#2563eb' : 'white',
                    color: timeScale === scale ? 'white' : '#374151',
                    border: `1px solid ${timeScale === scale ? '#2563eb' : '#e5e7eb'}`
                  }}
                >
                  {scale}s
                </button>
              ))}
            </div>
          </TimeScaleSelector>
          
          <ViewToggle>
            <div className="label">View Mode:</div>
            <div className="toggle">
              <button
                onClick={() => setViewMode('overlapped')}
                style={{
                  backgroundColor: viewMode === 'overlapped' ? '#2563eb' : 'white',
                  color: viewMode === 'overlapped' ? 'white' : '#374151',
                  border: `1px solid ${viewMode === 'overlapped' ? '#2563eb' : '#e5e7eb'}`
                }}
              >
                Overlapped
              </button>
              <button
                onClick={() => setViewMode('separated')}
                style={{
                  backgroundColor: viewMode === 'separated' ? '#2563eb' : 'white',
                  color: viewMode === 'separated' ? 'white' : '#374151',
                  border: `1px solid ${viewMode === 'separated' ? '#2563eb' : '#e5e7eb'}`
                }}
              >
                Separated
              </button>
            </div>
          </ViewToggle>
          
          <AmplitudeControl>
            <label>Amplitude:</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={amplitudeScale}
              onChange={(e) => setAmplitudeScale(parseFloat(e.target.value))}
            />
            <span>{amplitudeScale.toFixed(1)}x</span>
          </AmplitudeControl>
        </ControlsContainer>
      </Header>
      
      {connected ? (
        <>
          {viewMode === 'overlapped' ? (
            <ChartContainer>
              <Line data={chartData} options={chartOptions} />
            </ChartContainer>
          ) : (
            <SeparatedChartsContainer>
              {channelNames.map(channel => (
                visibleChannels[channel] && (
                  <ChartContainer key={channel} height="200px">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ color: channelColors[channel] }}>{channel}</strong>
                    </div>
                    <Line 
                      data={getSingleChannelData(channel)} 
                      options={getChannelChartOptions(channel)} 
                    />
                  </ChartContainer>
                )
              ))}
            </SeparatedChartsContainer>
          )}
          
          <ChannelToggleContainer>
            {channelNames.map(channel => (
              <ChannelToggle
                key={channel}
                color={channelColors[channel]}
                active={visibleChannels[channel]}
                onClick={() => toggleChannel(channel)}
              >
                <div className="color-indicator" />
                {channel}
              </ChannelToggle>
            ))}
          </ChannelToggleContainer>
        </>
      ) : (
        <NotConnectedMessage>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#9CA3AF"/>
            <path d="M7 10.5L11 16.5L12.5 13.5L15.5 16.5L17 10.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Not Connected to Muse</h3>
          <p>Please connect to your Muse headset from the dashboard to view raw EEG signals.</p>
          <button onClick={() => window.location.href = '/'}>
            Go to Dashboard
          </button>
        </NotConnectedMessage>
      )}
    </Container>
  );
};

export default RawSignals; 