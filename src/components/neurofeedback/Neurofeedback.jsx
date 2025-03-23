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
  Filler,
} from 'chart.js';
import museService from '../../services/MuseService';
import databaseService from '../../services/DatabaseService';
import { channelNames, bandColors, defaultNeurofeedbackSettings } from '../../utils/constants';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

const NeurofeedbackTitle = styled.h2`
  margin: 0;
`;

const SessionControls = styled.div`
  display: flex;
  gap: 1rem;
`;

const SessionButton = styled.button`
  background-color: ${props => props.active ? 'var(--danger)' : 'var(--primary)'};
  
  &:hover {
    background-color: ${props => props.active ? 'var(--danger-dark)' : 'var(--primary-dark)'};
  }
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeedbackContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FeedbackVisualizer = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
`;

const FeedbackCircle = styled.div`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background-color: ${props => props.isOverThreshold ? 'var(--success)' : 'var(--primary)'};
  opacity: ${props => 0.3 + props.value * 0.7};
  transition: all 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ThresholdLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: rgba(0, 0, 0, 0.2);
  top: ${props => 100 - props.threshold * 100}%;
`;

const MetricValue = styled.div`
  position: absolute;
  right: 1rem;
  top: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.isOverThreshold ? 'var(--success)' : 'var(--primary)'};
`;

const SettingsContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SettingsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-weight: 500;
  }
  
  select, input {
    padding: 0.5rem;
    border: 1px solid var(--gray-light);
    border-radius: 4px;
  }
`;

const ChartContainer = styled.div`
  height: 200px;
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

const Instructions = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  
  h4 {
    margin-top: 0;
  }
  
  ul {
    margin-bottom: 0;
    padding-left: 1.5rem;
  }
`;

const CalibrationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const CalibrationDialog = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  
  h3 {
    margin-top: 0;
  }
  
  .progress {
    margin: 2rem 0;
    height: 8px;
    background-color: var(--gray-light);
    border-radius: 4px;
    overflow: hidden;
    
    .bar {
      height: 100%;
      background-color: var(--primary);
      width: ${props => props.progress || 0}%;
      transition: width 0.5s linear;
    }
  }
`;

const Neurofeedback = () => {
  // Connection status
  const [connected, setConnected] = useState(false);
  
  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  
  // Current neurofeedback settings
  const [settings, setSettings] = useState(defaultNeurofeedbackSettings);
  
  // Current band power values
  const [powerValues, setPowerValues] = useState({
    delta: 0,
    theta: 0,
    alpha: 0,
    beta: 0,
    gamma: 0
  });
  
  // Current metric value (what we're displaying feedback for)
  const [metricValue, setMetricValue] = useState(0);
  
  // Is the value over threshold?
  const [isOverThreshold, setIsOverThreshold] = useState(false);
  
  // Baseline values from calibration
  const [baseline, setBaseline] = useState({
    delta: 0,
    theta: 0,
    alpha: 0,
    beta: 0,
    gamma: 0
  });
  
  // Calibration state
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  
  // Audio feedback
  const audioRef = useRef(null);
  
  // History data for charting
  const [historyData, setHistoryData] = useState({
    labels: Array(60).fill(''),
    datasets: [
      {
        label: 'Current',
        data: Array(60).fill(0),
        borderColor: bandColors.alpha,
        backgroundColor: `${bandColors.alpha}20`,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Threshold',
        data: Array(60).fill(defaultNeurofeedbackSettings.threshold),
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderDash: [5, 5],
        fill: false,
        tension: 0,
      }
    ],
  });
  
  useEffect(() => {
    // Subscribe to connection status
    const connectionSubscription = museService.connectionStatus.subscribe(status => {
      setConnected(status);
    });
    
    // Subscribe to EEG power
    const powerSubscription = museService.eegPower.subscribe(power => {
      // Calculate average power across channels for each band
      const avgPower = {
        delta: power.delta.reduce((a, b) => a + b, 0) / power.delta.length,
        theta: power.theta.reduce((a, b) => a + b, 0) / power.theta.length,
        alpha: power.alpha.reduce((a, b) => a + b, 0) / power.alpha.length,
        beta: power.beta.reduce((a, b) => a + b, 0) / power.beta.length,
        gamma: power.gamma.reduce((a, b) => a + b, 0) / power.gamma.length
      };
      
      setPowerValues(avgPower);
      
      // Calculate the metric value based on selected band and normalization
      const rawValue = avgPower[settings.metric];
      const baselineValue = baseline[settings.metric] || 1;
      const normalizedValue = Math.min(1, rawValue / (baselineValue * 2));
      
      setMetricValue(normalizedValue);
      setIsOverThreshold(normalizedValue > settings.threshold);
      
      // Update history data
      updateHistoryData(normalizedValue);
      
      // Provide audio feedback if enabled
      provideFeedback(normalizedValue > settings.threshold);
    });
    
    // Load the latest calibration if available
    const loadCalibration = async () => {
      const latestCalibration = await databaseService.getLatestCalibration();
      if (latestCalibration && latestCalibration.baselineData) {
        setBaseline(latestCalibration.baselineData);
      }
    };
    
    loadCalibration();
    
    // Set up audio for feedback
    audioRef.current = new Audio('/feedback-tone.mp3');
    audioRef.current.loop = true;
    
    return () => {
      connectionSubscription.unsubscribe();
      powerSubscription.unsubscribe();
      
      // Stop audio when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  
  // Update settings when they change
  useEffect(() => {
    // Update threshold line in history data
    setHistoryData(prev => ({
      ...prev,
      datasets: [
        prev.datasets[0],
        {
          ...prev.datasets[1],
          data: Array(60).fill(settings.threshold)
        }
      ]
    }));
  }, [settings]);
  
  // Start/stop session when sessionActive changes
  useEffect(() => {
    if (sessionActive) {
      // Reset history data
      setHistoryData({
        labels: Array(60).fill(''),
        datasets: [
          {
            label: 'Current',
            data: Array(60).fill(0),
            borderColor: bandColors[settings.metric],
            backgroundColor: `${bandColors[settings.metric]}20`,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Threshold',
            data: Array(60).fill(settings.threshold),
            borderColor: 'rgba(0, 0, 0, 0.2)',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
          }
        ],
      });
      
      // Insert a marker for session start
      museService.injectMarker('neurofeedback_start');
    } else {
      // Insert a marker for session end
      museService.injectMarker('neurofeedback_end');
      
      // Stop audio feedback
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [sessionActive]);
  
  const updateHistoryData = (value) => {
    if (!sessionActive) return;
    
    setHistoryData(prev => ({
      labels: [...prev.labels.slice(1), ''],
      datasets: [
        {
          ...prev.datasets[0],
          data: [...prev.datasets[0].data.slice(1), value]
        },
        prev.datasets[1]
      ]
    }));
  };
  
  const provideFeedback = (isOverThreshold) => {
    if (!sessionActive || settings.feedbackType !== 'audio') return;
    
    if (isOverThreshold) {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(err => console.error("Could not play audio:", err));
      }
    } else {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
  };
  
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: name === 'threshold' ? parseFloat(value) : value
    });
  };
  
  const toggleSession = () => {
    setSessionActive(!sessionActive);
  };
  
  const startCalibration = () => {
    setIsCalibrating(true);
    setCalibrationProgress(0);
    
    // Start a timer to simulate calibration progress
    const startTime = Date.now();
    const calibrationDuration = 10000; // 10 seconds
    const powerSamples = {
      delta: [],
      theta: [],
      alpha: [],
      beta: [],
      gamma: []
    };
    
    // Collect samples during calibration
    const calibrationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / calibrationDuration) * 100);
      setCalibrationProgress(progress);
      
      // Save current power values
      Object.keys(powerValues).forEach(band => {
        powerSamples[band].push(powerValues[band]);
      });
      
      if (progress >= 100) {
        // Calibration complete
        clearInterval(calibrationInterval);
        
        // Calculate average for each band
        const newBaseline = {};
        Object.keys(powerSamples).forEach(band => {
          newBaseline[band] = powerSamples[band].reduce((a, b) => a + b, 0) / powerSamples[band].length;
        });
        
        // Save to state and database
        setBaseline(newBaseline);
        databaseService.saveCalibration(newBaseline);
        
        setIsCalibrating(false);
      }
    }, 100);
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: 'Normalized Power'
        }
      },
      x: {
        display: false
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
    animation: {
      duration: 0
    }
  };
  
  const getBandDescription = () => {
    switch (settings.metric) {
      case 'alpha':
        return "Alpha waves (8-13 Hz) are associated with relaxation and reduced anxiety. Focus on calm, relaxed breathing and clear your mind.";
      case 'beta':
        return "Beta waves (13-30 Hz) are associated with active thinking and focus. Concentrate on a specific task or problem to increase beta power.";
      case 'theta':
        return "Theta waves (4-8 Hz) are associated with deep relaxation and meditation. Try to enter a drowsy, deeply relaxed state without falling asleep.";
      case 'delta':
        return "Delta waves (1-4 Hz) are primarily associated with deep sleep. These are difficult to consciously control while awake.";
      case 'gamma':
        return "Gamma waves (30-50 Hz) are associated with higher cognitive functioning and simultaneous processing. Focus on integrating multiple ideas at once.";
      default:
        return "";
    }
  };
  
  return (
    <Container>
      <Header>
        <NeurofeedbackTitle>Neurofeedback Training</NeurofeedbackTitle>
        
        <SessionControls>
          <button onClick={startCalibration} disabled={isCalibrating || !connected || sessionActive}>
            Calibrate
          </button>
          
          <SessionButton 
            active={sessionActive} 
            onClick={toggleSession}
            disabled={!connected}
          >
            {sessionActive ? 'Stop Session' : 'Start Session'}
          </SessionButton>
        </SessionControls>
      </Header>
      
      {connected ? (
        <ContentContainer>
          <FeedbackContainer>
            <FeedbackVisualizer>
              <ThresholdLine threshold={settings.threshold} />
              
              <FeedbackCircle 
                size={100 + metricValue * 200} 
                value={metricValue}
                isOverThreshold={isOverThreshold}
              >
                {isOverThreshold ? '✓' : ''}
              </FeedbackCircle>
              
              <MetricValue isOverThreshold={isOverThreshold}>
                {(metricValue * 100).toFixed(0)}%
              </MetricValue>
            </FeedbackVisualizer>
            
            <ChartContainer>
              <Line 
                data={historyData} 
                options={chartOptions} 
              />
            </ChartContainer>
            
            <Instructions>
              <h4>Training Instructions</h4>
              <p>{getBandDescription()}</p>
              <ul>
                <li>Sit in a comfortable position with your back straight</li>
                <li>Keep your eyes closed or softly focused</li>
                <li>Try to maintain the value above the threshold line</li>
                <li>When you succeed, you'll receive visual/audio feedback</li>
              </ul>
            </Instructions>
          </FeedbackContainer>
          
          <SettingsContainer>
            <h3>Session Settings</h3>
            <SettingsForm>
              <FormGroup>
                <label htmlFor="metric">Target Frequency Band</label>
                <select 
                  id="metric" 
                  name="metric" 
                  value={settings.metric} 
                  onChange={handleSettingsChange}
                  disabled={sessionActive}
                >
                  <option value="alpha">Alpha (8-13 Hz) - Relaxation</option>
                  <option value="beta">Beta (13-30 Hz) - Focus</option>
                  <option value="theta">Theta (4-8 Hz) - Meditation</option>
                  <option value="delta">Delta (1-4 Hz) - Deep Rest</option>
                  <option value="gamma">Gamma (30-50 Hz) - Cognitive Processing</option>
                </select>
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="threshold">Threshold ({(settings.threshold * 100).toFixed(0)}%)</label>
                <input 
                  type="range" 
                  id="threshold" 
                  name="threshold" 
                  min="0.1" 
                  max="0.9" 
                  step="0.05" 
                  value={settings.threshold} 
                  onChange={handleSettingsChange}
                  disabled={sessionActive}
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="feedbackType">Feedback Type</label>
                <select 
                  id="feedbackType" 
                  name="feedbackType" 
                  value={settings.feedbackType} 
                  onChange={handleSettingsChange}
                  disabled={sessionActive}
                >
                  <option value="visual">Visual Only</option>
                  <option value="audio">Audio Only</option>
                  <option value="both">Visual & Audio</option>
                </select>
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="channel">EEG Channel</label>
                <select 
                  id="channel" 
                  name="channel" 
                  value={settings.channel} 
                  onChange={handleSettingsChange}
                  disabled={sessionActive}
                >
                  <option value="average">Average (All Channels)</option>
                  {channelNames.map(channel => (
                    <option key={channel} value={channel}>{channel}</option>
                  ))}
                </select>
              </FormGroup>
            </SettingsForm>
          </SettingsContainer>
        </ContentContainer>
      ) : (
        <NotConnectedMessage>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#9CA3AF"/>
            <path d="M7 10.5L11 16.5L12.5 13.5L15.5 16.5L17 10.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Not Connected to Muse</h3>
          <p>Please connect to your Muse headset from the dashboard to start neurofeedback training.</p>
          <button onClick={() => window.location.href = '/'}>
            Go to Dashboard
          </button>
        </NotConnectedMessage>
      )}
      
      {isCalibrating && (
        <CalibrationOverlay>
          <CalibrationDialog progress={calibrationProgress}>
            <h3>Calibrating</h3>
            <p>Please sit still and relax with your eyes closed for 10 seconds.</p>
            <p>We're capturing your baseline brain activity...</p>
            
            <div className="progress">
              <div className="bar" style={{ width: `${calibrationProgress}%` }}></div>
            </div>
            
            <p>{Math.round(calibrationProgress)}% complete</p>
          </CalibrationDialog>
        </CalibrationOverlay>
      )}
    </Container>
  );
};

export default Neurofeedback; 