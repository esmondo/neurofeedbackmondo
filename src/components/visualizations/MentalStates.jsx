import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Line, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  RadialLinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import museService from '../../services/MuseService';

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  RadialLinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);

// Styled components
const Container = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ViewSelector = styled.div`
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const ViewButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  background-color: ${props => props.active ? '#4299e1' : '#f7fafc'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? '#4299e1' : '#edf2f7'};
  }
`;

const ChartContainer = styled.div`
  height: 400px;
  margin-bottom: 1rem;
  position: relative;
`;

const StateCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const StateCard = styled.div`
  background-color: ${props => props.backgroundColor || '#f7fafc'};
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const StateTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
`;

const StateValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.color || '#4a5568'};
  text-align: center;
  margin: 0.5rem 0;
`;

const StateDescription = styled.p`
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.4;
  margin-top: auto;
`;

const NotConnectedMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #a0aec0;
  font-size: 1.25rem;
  text-align: center;
  line-height: 1.6;
`;

function MentalStates() {
  const [isConnected, setIsConnected] = useState(false);
  const [viewMode, setViewMode] = useState('radar'); // 'radar', 'time', or 'cards'
  const [mentalStates, setMentalStates] = useState({
    focus: 0,
    relaxation: 0,
    stress: 0,
    fatigue: 0,
    engagement: 0
  });
  const [timeSeriesData, setTimeSeriesData] = useState({
    labels: [],
    datasets: []
  });
  
  // Reference for timeseries data
  const timeSeriesRef = useRef([]);
  
  useEffect(() => {
    // Subscribe to connection status
    const connectionSub = museService.connectionStatus$.subscribe(status => {
      setIsConnected(status);
    });
    
    // Subscribe to EEG power data to derive mental states
    const powerSub = museService.eegPower$.subscribe(powerData => {
      if (powerData) {
        // Simple calculation of mental states based on band powers
        // These are simplified formulas and should be replaced with more accurate models
        const alpha = powerData.alpha;
        const beta = powerData.beta;
        const theta = powerData.theta;
        const delta = powerData.delta;
        const gamma = powerData.gamma;
        
        // Calculate states based on band power ratios and values
        // Note: These are simplified approximations for demonstration
        const focus = Math.min(100, Math.max(0, (beta / (theta + alpha)) * 100)); // Beta/(Theta+Alpha) ratio
        const relaxation = Math.min(100, Math.max(0, (alpha / beta) * 50)); // Alpha/Beta ratio
        const stress = Math.min(100, Math.max(0, ((beta + gamma) / (alpha + theta)) * 50)); // (Beta+Gamma)/(Alpha+Theta) ratio
        const fatigue = Math.min(100, Math.max(0, (theta / beta) * 60)); // Theta/Beta ratio
        const engagement = Math.min(100, Math.max(0, ((beta + gamma) / (delta + theta)) * 50)); // (Beta+Gamma)/(Delta+Theta) ratio
        
        const newStates = {
          focus: Math.round(focus),
          relaxation: Math.round(relaxation),
          stress: Math.round(stress),
          fatigue: Math.round(fatigue),
          engagement: Math.round(engagement)
        };
        
        setMentalStates(newStates);
        
        // Update time series data
        const now = new Date();
        
        // Limit the number of points in the time series
        if (timeSeriesRef.current.length > 100) {
          timeSeriesRef.current.shift();
        }
        
        timeSeriesRef.current.push({
          time: now,
          ...newStates
        });
        
        // Update chart data
        updateTimeSeriesData();
      }
    });
    
    // Initialize time series data
    updateTimeSeriesData();
    
    return () => {
      connectionSub.unsubscribe();
      powerSub.unsubscribe();
    };
  }, []);
  
  // Function to update the time series chart data
  const updateTimeSeriesData = () => {
    const labels = timeSeriesRef.current.map(point => point.time);
    
    const datasets = [
      {
        label: 'Focus',
        data: timeSeriesRef.current.map(point => point.focus),
        fill: false,
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        borderColor: 'rgba(66, 153, 225, 1)',
        tension: 0.3,
      },
      {
        label: 'Relaxation',
        data: timeSeriesRef.current.map(point => point.relaxation),
        fill: false,
        backgroundColor: 'rgba(72, 187, 120, 0.2)',
        borderColor: 'rgba(72, 187, 120, 1)',
        tension: 0.3,
      },
      {
        label: 'Stress',
        data: timeSeriesRef.current.map(point => point.stress),
        fill: false,
        backgroundColor: 'rgba(237, 100, 166, 0.2)',
        borderColor: 'rgba(237, 100, 166, 1)',
        tension: 0.3,
      },
      {
        label: 'Fatigue',
        data: timeSeriesRef.current.map(point => point.fatigue),
        fill: false,
        backgroundColor: 'rgba(160, 174, 192, 0.2)',
        borderColor: 'rgba(160, 174, 192, 1)',
        tension: 0.3,
      },
      {
        label: 'Engagement',
        data: timeSeriesRef.current.map(point => point.engagement),
        fill: false,
        backgroundColor: 'rgba(246, 173, 85, 0.2)',
        borderColor: 'rgba(246, 173, 85, 1)',
        tension: 0.3,
      }
    ];
    
    setTimeSeriesData({
      labels,
      datasets
    });
  };
  
  // Radar chart data
  const radarData = {
    labels: ['Focus', 'Relaxation', 'Stress', 'Fatigue', 'Engagement'],
    datasets: [
      {
        label: 'Current State',
        data: [
          mentalStates.focus,
          mentalStates.relaxation,
          mentalStates.stress,
          mentalStates.fatigue,
          mentalStates.engagement
        ],
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        borderColor: 'rgba(66, 153, 225, 1)',
        pointBackgroundColor: 'rgba(66, 153, 225, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(66, 153, 225, 1)'
      }
    ]
  };
  
  // Chart options
  const timeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'second',
          tooltipFormat: 'HH:mm:ss',
          displayFormats: {
            second: 'HH:mm:ss'
          }
        },
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Value'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    animation: false
  };
  
  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    }
  };
  
  // Functions to get card colors based on values
  const getFocusColor = value => {
    if (value >= 70) return '#4299e1'; // High focus - blue
    if (value >= 40) return '#f6ad55'; // Medium focus - orange
    return '#a0aec0'; // Low focus - gray
  };
  
  const getRelaxationColor = value => {
    if (value >= 70) return '#48bb78'; // High relaxation - green
    if (value >= 40) return '#f6ad55'; // Medium relaxation - orange
    return '#a0aec0'; // Low relaxation - gray
  };
  
  const getStressColor = value => {
    if (value >= 70) return '#ed64a6'; // High stress - pink
    if (value >= 40) return '#f6ad55'; // Medium stress - orange
    return '#a0aec0'; // Low stress - gray
  };
  
  const getFatigueColor = value => {
    if (value >= 70) return '#ed64a6'; // High fatigue - pink
    if (value >= 40) return '#f6ad55'; // Medium fatigue - orange
    return '#a0aec0'; // Low fatigue - gray
  };
  
  const getEngagementColor = value => {
    if (value >= 70) return '#f6ad55'; // High engagement - orange
    if (value >= 40) return '#4299e1'; // Medium engagement - blue
    return '#a0aec0'; // Low engagement - gray
  };
  
  return (
    <Container>
      <Header>
        <Title>Mental States</Title>
        <ControlsContainer>
          <ViewSelector>
            <ViewButton 
              active={viewMode === 'radar'} 
              onClick={() => setViewMode('radar')}>
              Radar View
            </ViewButton>
            <ViewButton 
              active={viewMode === 'time'} 
              onClick={() => setViewMode('time')}>
              Time Series
            </ViewButton>
            <ViewButton 
              active={viewMode === 'cards'} 
              onClick={() => setViewMode('cards')}>
              Cards View
            </ViewButton>
          </ViewSelector>
        </ControlsContainer>
      </Header>
      
      {isConnected ? (
        <>
          {viewMode === 'radar' && (
            <ChartContainer>
              <Radar data={radarData} options={radarChartOptions} />
            </ChartContainer>
          )}
          
          {viewMode === 'time' && (
            <ChartContainer>
              <Line data={timeSeriesData} options={timeChartOptions} />
            </ChartContainer>
          )}
          
          {viewMode === 'cards' && (
            <StateCards>
              <StateCard backgroundColor="#ebf8ff">
                <StateTitle>Focus</StateTitle>
                <StateValue color={getFocusColor(mentalStates.focus)}>
                  {mentalStates.focus}%
                </StateValue>
                <StateDescription>
                  Your attention level and mental concentration. High values indicate strong focus on task.
                </StateDescription>
              </StateCard>
              
              <StateCard backgroundColor="#f0fff4">
                <StateTitle>Relaxation</StateTitle>
                <StateValue color={getRelaxationColor(mentalStates.relaxation)}>
                  {mentalStates.relaxation}%
                </StateValue>
                <StateDescription>
                  Your calmness and mental tranquility. High values suggest a relaxed, stress-free state.
                </StateDescription>
              </StateCard>
              
              <StateCard backgroundColor="#fff5f7">
                <StateTitle>Stress</StateTitle>
                <StateValue color={getStressColor(mentalStates.stress)}>
                  {mentalStates.stress}%
                </StateValue>
                <StateDescription>
                  Your mental tension and pressure. High values may indicate anxiety or mental strain.
                </StateDescription>
              </StateCard>
              
              <StateCard backgroundColor="#f7fafc">
                <StateTitle>Fatigue</StateTitle>
                <StateValue color={getFatigueColor(mentalStates.fatigue)}>
                  {mentalStates.fatigue}%
                </StateValue>
                <StateDescription>
                  Your mental tiredness. High values suggest mental exhaustion or decreased alertness.
                </StateDescription>
              </StateCard>
              
              <StateCard backgroundColor="#fffaf0">
                <StateTitle>Engagement</StateTitle>
                <StateValue color={getEngagementColor(mentalStates.engagement)}>
                  {mentalStates.engagement}%
                </StateValue>
                <StateDescription>
                  Your mental involvement and interest. High values indicate active mental participation.
                </StateDescription>
              </StateCard>
            </StateCards>
          )}
        </>
      ) : (
        <NotConnectedMessage>
          <p>Muse headset is not connected</p>
          <p>Connect your Muse headset to see your mental states in real-time</p>
        </NotConnectedMessage>
      )}
    </Container>
  );
}

export default MentalStates; 