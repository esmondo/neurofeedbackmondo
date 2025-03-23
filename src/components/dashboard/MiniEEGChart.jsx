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

const PreviewContainer = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #2563eb;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Constants for the chart
const dataPoints = 100;
const displaySeconds = 2;

const MiniEEGChart = ({ connected }) => {
  // Store EEG data for the chart
  const [chartData, setChartData] = useState({
    labels: Array(dataPoints).fill(''),
    datasets: channelNames.map(channel => ({
      label: channel,
      data: Array(dataPoints).fill(0),
      borderColor: channelColors[channel],
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.2,
    }))
  });
  
  // Keep track of subscriptions
  const subscriptionsRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        enabled: false
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: true,
        min: -100,
        max: 100,
        ticks: {
          display: false
        },
        grid: {
          display: false
        }
      }
    }
  };
  
  useEffect(() => {
    if (connected) {
      setIsLoading(true);
      
      // Clear any existing data subscriptions
      subscriptionsRef.current.forEach(sub => {
        if (sub) {
          sub.unsubscribe();
        }
      });
      
      // Create data buffer for each channel
      const dataBuffers = {};
      channelNames.forEach(channel => {
        dataBuffers[channel] = Array(dataPoints).fill(0);
      });
      
      // Subscribe to each channel's data
      const newSubscriptions = channelNames.map(channel => 
        museService.eegData[channel].subscribe(reading => {
          if (reading && reading.samples) {
            // Update the buffer with new data
            const newSamples = reading.samples;
            dataBuffers[channel] = [...dataBuffers[channel].slice(newSamples.length), ...newSamples];
            
            // Update the chart data
            setChartData(prevData => {
              const updatedDatasets = [...prevData.datasets];
              const channelIndex = channelNames.indexOf(channel);
              
              if (channelIndex !== -1) {
                updatedDatasets[channelIndex] = {
                  ...updatedDatasets[channelIndex],
                  data: dataBuffers[channel]
                };
              }
              
              return {
                ...prevData,
                datasets: updatedDatasets
              };
            });
            
            // After initial data comes in, remove loading state
            setIsLoading(false);
          }
        })
      );
      
      subscriptionsRef.current = newSubscriptions;
      
      return () => {
        // Clean up subscriptions
        newSubscriptions.forEach(sub => {
          if (sub) {
            sub.unsubscribe();
          }
        });
      };
    } else {
      // When disconnected, simulate some data
      setIsLoading(true);
      
      // Generate random data for demonstration when not connected
      const simulateData = () => {
        const simulatedBuffers = {};
        
        channelNames.forEach(channel => {
          const buffer = Array(dataPoints).fill(0).map(() => (Math.random() * 50) - 25);
          simulatedBuffers[channel] = buffer;
        });
        
        setChartData({
          labels: Array(dataPoints).fill(''),
          datasets: channelNames.map((channel, index) => ({
            label: channel,
            data: simulatedBuffers[channel],
            borderColor: channelColors[channel],
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.2,
          }))
        });
        
        setIsLoading(false);
      };
      
      // Simulate data after a delay
      const timer = setTimeout(simulateData, 500);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [connected]);
  
  return (
    <PreviewContainer>
      {isLoading && (
        <LoadingOverlay>
          <Spinner />
          <div>Loading EEG data...</div>
        </LoadingOverlay>
      )}
      <Line data={chartData} options={chartOptions} />
    </PreviewContainer>
  );
};

export default MiniEEGChart; 