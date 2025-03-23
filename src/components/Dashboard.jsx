import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import museService from '../services/MuseService';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ConnectionCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
`;

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
  
  &:hover {
    background-color: ${props => props.connected ? '#b91c1c' : '#1d4ed8'};
  }
`;

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
  background-color: ${props => props.connected ? '#10b981' : '#9ca3af'};
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

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: #374151;
  padding: 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  svg {
    margin-right: 0.5rem;
    color: #2563eb;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const Dashboard = () => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [telemetry, setTelemetry] = useState({
    battery: 0,
    temperature: 0
  });
  
  useEffect(() => {
    // Subscribe to connection status
    const connectionSubscription = museService.connectionStatus.subscribe(status => {
      setConnected(status);
      setConnecting(false);
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
    
    return () => {
      connectionSubscription.unsubscribe();
      telemetrySubscription.unsubscribe();
    };
  }, []);
  
  const handleConnect = async () => {
    if (connected) {
      await museService.disconnect();
    } else {
      setConnecting(true);
      await museService.connect();
    }
  };
  
  return (
    <DashboardContainer>
      <ConnectionCard>
        <h2>Muse Connection</h2>
        <ConnectStatus>
          <StatusIndicator connected={connected} />
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </ConnectStatus>
        
        <ConnectionButton 
          connected={connected} 
          onClick={handleConnect}
          disabled={connecting}
        >
          {connecting ? 'Connecting...' : connected ? 'Disconnect' : 'Connect to Muse'}
        </ConnectionButton>
        
        {connected && (
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
        )}
      </ConnectionCard>
      
      <ActionButton to="/raw-signals">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 18.49L9.5 12.5L13.5 16.5L22 8L20.59 6.59L13.5 13.67L9.5 9.67L2 17.17L3.5 18.49Z" fill="currentColor"/>
        </svg>
        View Raw Signals
      </ActionButton>
    </DashboardContainer>
  );
};

export default Dashboard; 