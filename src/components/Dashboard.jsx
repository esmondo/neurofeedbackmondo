import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import museService from '../services/MuseService';
import { channelNames, channelColors } from '../utils/constants';

// Import the new dashboard components
import SessionPanel from './dashboard/SessionPanel';
import RecentActivity from './dashboard/RecentActivity';
import MiniEEGChart from './dashboard/MiniEEGChart';
import VisualizationOptions from './dashboard/VisualizationOptions';

// Grid layout for dashboard organization
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

// Responsive grid layout for dashboard cards
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ConnectionCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  position: relative;
`;

// Enhanced connection button with hover effects
const ConnectionButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  background-color: ${props => props.connected ? '#ef4444' : '#2563eb'};
  color: white;
  transition: background-color 0.2s, transform 0.2s;
  
  &:hover {
    background-color: ${props => props.connected ? '#b91c1c' : '#1d4ed8'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }
`;

// Enhanced status display with animation
const ConnectStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  
  span {
    margin-left: 0.5rem;
    font-weight: 500;
  }
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => {
    if (props.connecting) return '#f59e0b';
    return props.connected ? '#10b981' : '#9ca3af';
  }};
  animation: ${props => props.connecting ? 'pulse 1.5s infinite' : 'none'};
  
  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
    }
    
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
    }
    
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
    }
  }
`;

const TelemetryInfo = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  
  div {
    text-align: center;
  }
  
  .value {
    font-size: 1.5rem;
    font-weight: 500;
  }
  
  .label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }
`;

// Styled tooltip component
const Tooltip = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 0.5rem;
  
  .tooltip-icon {
    color: #9ca3af;
    cursor: help;
    transition: color 0.2s;
  }
  
  &:hover .tooltip-icon {
    color: #2563eb;
  }
  
  .tooltip-text {
    visibility: hidden;
    width: 200px;
    background-color: #1f2937;
    color: white;
    text-align: center;
    border-radius: 6px;
    padding: 8px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 0.75rem;
    font-weight: normal;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    pointer-events: none;
  }
  
  .tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #1f2937 transparent transparent transparent;
  }
  
  &:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
`;

// Connection progress steps
const ConnectionSteps = styled.div`
  display: ${props => props.connecting ? 'flex' : 'none'};
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  
  .step {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  
  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: ${props => props.active ? '#2563eb' : '#9ca3af'};
    color: white;
    font-weight: 500;
    margin-right: 0.5rem;
  }
  
  .step-complete {
    background-color: #10b981;
  }
  
  .step-active {
    background-color: #2563eb;
  }
  
  .step-pending {
    background-color: #9ca3af;
  }
`;

// First-time user guidance panel
const OnboardingPanel = styled.div`
  display: ${props => props.visible ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow: auto;
`;

const OnboardingContent = styled.div`
  background-color: white;
  margin: 10% auto;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  h2 {
    margin-top: 0;
  }
  
  button {
    margin-top: 1.5rem;
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

// Signal quality indicators
const SignalQualityIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  
  .channel {
    width: 30px;
    font-weight: 500;
    margin-right: 0.5rem;
    color: ${props => props.color};
  }
  
  .quality-bar {
    flex: 1;
    height: 6px;
    background-color: #e5e7eb;
    border-radius: 3px;
    overflow: hidden;
  }
  
  .quality-fill {
    height: 100%;
    background-color: ${props => {
      if (props.quality >= 0.7) return '#10b981';
      if (props.quality >= 0.4) return '#f59e0b';
      return '#ef4444';
    }};
    width: ${props => `${props.quality * 100}%`};
    transition: width 0.5s ease;
  }
`;

// EEG Preview Card
const PreviewCard = styled(Card)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Dashboard = () => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [telemetry, setTelemetry] = useState({
    battery: 0,
    temperature: 0
  });
  const [signalQuality, setSignalQuality] = useState({
    TP9: 0,
    AF7: 0,
    AF8: 0,
    TP10: 0
  });
  
  // Check if it's the first visit
  useEffect(() => {
    const isFirstVisit = localStorage.getItem('hasVisitedBefore') !== 'true';
    if (isFirstVisit) {
      setShowOnboarding(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);
  
  useEffect(() => {
    // Subscribe to connection status
    const connectionSubscription = museService.connectionStatus.subscribe(status => {
      setConnected(status);
      if (status) {
        // Reset connection steps when fully connected
        setConnectionStep(4);
        setTimeout(() => {
          setConnecting(false);
        }, 1000);
      }
    });
    
    // Subscribe to telemetry data
    const telemetrySubscription = museService.telemetryData.subscribe(data => {
      if (data) {
        setTelemetry({
          battery: Math.round(data.battery * 100),
          temperature: data.temperature.toFixed(1)
        });
      }
    });
    
    // Simulate signal quality for now - in a real app, this would come from the device
    if (connected) {
      const signalQualityInterval = setInterval(() => {
        const newQualities = {};
        channelNames.forEach(channel => {
          // Start with current quality or 0
          const currentQuality = signalQuality[channel] || 0;
          // Adjust slightly (with a tendency to improve over time)
          let newQuality = currentQuality;
          if (currentQuality < 0.7) {
            newQuality = Math.min(1, currentQuality + Math.random() * 0.1);
          } else {
            newQuality = Math.max(0.6, Math.min(1, currentQuality + (Math.random() * 0.1 - 0.05)));
          }
          newQualities[channel] = newQuality;
        });
        setSignalQuality(newQualities);
      }, 2000);
      
      return () => {
        connectionSubscription.unsubscribe();
        telemetrySubscription.unsubscribe();
        clearInterval(signalQualityInterval);
      };
    }
    
    return () => {
      connectionSubscription.unsubscribe();
      telemetrySubscription.unsubscribe();
    };
  }, [connected, signalQuality]);
  
  const handleConnect = async () => {
    if (connected) {
      await museService.disconnect();
    } else {
      setConnecting(true);
      setConnectionStep(1);
      
      // Simulate the connection steps for better UX
      setTimeout(() => setConnectionStep(2), 1000);
      setTimeout(() => setConnectionStep(3), 2000);
      
      // Actual connection
      try {
        await museService.connect();
      } catch (error) {
        console.error("Connection error:", error);
        setConnecting(false);
      }
    }
  };
  
  const handleSessionStart = (sessionType, duration) => {
    console.log(`Starting ${sessionType} session for ${duration} seconds`);
    // In a real app, you would start recording data, set up visualization, etc.
  };
  
  const closeOnboarding = () => {
    setShowOnboarding(false);
  };
  
  return (
    <DashboardContainer>
      <h1>Dashboard 
        <Tooltip>
          <span className="tooltip-icon">ⓘ</span>
          <span className="tooltip-text">Welcome to your NeuroFeedback Mondo dashboard. Here you can connect to your Muse headset and explore your brain data.</span>
        </Tooltip>
      </h1>
      
      <DashboardGrid>
        {/* Connection Card */}
        <ConnectionCard>
          <h2>Muse Connection 
            <Tooltip>
              <span className="tooltip-icon">ⓘ</span>
              <span className="tooltip-text">Connect to your Muse headset to start receiving EEG data. Make sure your headset is turned on and in pairing mode.</span>
            </Tooltip>
          </h2>
          
          <ConnectStatus>
            <StatusIndicator connected={connected} connecting={connecting} />
            <span>
              {connecting ? 'Connecting...' : connected ? 'Connected' : 'Disconnected'}
            </span>
          </ConnectStatus>
          
          <ConnectionButton 
            connected={connected} 
            onClick={handleConnect}
            disabled={connecting && !connected}
          >
            {connecting && !connected ? 'Connecting...' : connected ? 'Disconnect' : 'Connect to Muse'}
          </ConnectionButton>
          
          <ConnectionSteps connecting={connecting}>
            <div className="step">
              <div className={`step-number ${connectionStep >= 1 ? 'step-active' : 'step-pending'}`}>1</div>
              <span>Searching for Muse devices...</span>
            </div>
            <div className="step">
              <div className={`step-number ${connectionStep >= 2 ? 'step-active' : 'step-pending'}`}>2</div>
              <span>Establishing connection...</span>
            </div>
            <div className="step">
              <div className={`step-number ${connectionStep >= 3 ? 'step-active' : 'step-pending'}`}>3</div>
              <span>Starting data stream...</span>
            </div>
            <div className="step">
              <div className={`step-number ${connectionStep >= 4 ? 'step-complete' : 'step-pending'}`}>
                {connectionStep >= 4 ? '✓' : '4'}
              </div>
              <span>Connection established!</span>
            </div>
          </ConnectionSteps>
          
          {connected && (
            <>
              <TelemetryInfo>
                <div>
                  <div className="value">{telemetry.battery}%</div>
                  <div className="label">Battery</div>
                </div>
                <div>
                  <div className="value">{telemetry.temperature}°C</div>
                  <div className="label">Temperature</div>
                </div>
              </TelemetryInfo>
              
              <div style={{ width: '100%', marginTop: '1.5rem' }}>
                <h3>Signal Quality 
                  <Tooltip>
                    <span className="tooltip-icon">ⓘ</span>
                    <span className="tooltip-text">This shows the quality of the connection for each electrode. Green is good, yellow is acceptable, red needs adjustment.</span>
                  </Tooltip>
                </h3>
                <div style={{ marginTop: '0.75rem' }}>
                  {channelNames.map(channel => (
                    <SignalQualityIndicator key={channel} quality={signalQuality[channel]} color={channelColors[channel]}>
                      <div className="channel">{channel}</div>
                      <div className="quality-bar">
                        <div className="quality-fill"></div>
                      </div>
                    </SignalQualityIndicator>
                  ))}
                </div>
              </div>
            </>
          )}
        </ConnectionCard>
        
        {/* Session Panel */}
        <SessionPanel 
          connected={connected} 
          onSessionStart={handleSessionStart} 
        />
        
        {/* EEG Preview */}
        <PreviewCard>
          <h2>
            EEG Preview
            <Tooltip>
              <span className="tooltip-icon">ⓘ</span>
              <span className="tooltip-text">A real-time preview of your EEG signals.</span>
            </Tooltip>
          </h2>
          <MiniEEGChart connected={connected} />
        </PreviewCard>
        
        {/* Recent Activity Section - spans 2 columns on larger screens */}
        <div style={{ gridColumn: 'span 2' }}>
          <RecentActivity />
        </div>
        
        {/* Visualization Options - spans full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <VisualizationOptions connected={connected} />
        </div>
      </DashboardGrid>
      
      {/* First-time user onboarding */}
      <OnboardingPanel visible={showOnboarding}>
        <OnboardingContent>
          <h2>Welcome to NeuroFeedback Mondo!</h2>
          <p>This application allows you to connect to your Muse headset and visualize your brain's electrical activity in real-time.</p>
          
          <h3>Getting Started:</h3>
          <ol>
            <li>Make sure your Muse headset is turned on and charged</li>
            <li>Click the "Connect to Muse" button on the dashboard</li>
            <li>Once connected, you can explore various visualizations of your brain data</li>
            <li>Ensure the headset is properly fitted for the best signal quality</li>
          </ol>
          
          <p>Look for the info icons (<span style={{ color: '#9ca3af' }}>ⓘ</span>) throughout the interface for helpful tips.</p>
          
          <button onClick={closeOnboarding}>Got it!</button>
        </OnboardingContent>
      </OnboardingPanel>
    </DashboardContainer>
  );
};

export default Dashboard; 