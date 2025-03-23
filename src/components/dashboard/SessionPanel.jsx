import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { sessionTypes } from '../../utils/constants';

const SessionCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const SessionTypeButton = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f9fafb;
    transform: translateY(-1px);
  }
  
  &.active {
    border-color: #2563eb;
    background-color: #eff6ff;
  }
`;

const SessionButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background-color: ${props => props.isActive ? '#ef4444' : '#2563eb'};
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  transition: background-color 0.2s, transform 0.2s;
  
  &:hover {
    background-color: ${props => props.isActive ? '#b91c1c' : '#1d4ed8'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }
`;

const SessionTimer = styled.div`
  text-align: center;
  margin: 1.5rem 0;
  
  .time {
    font-size: 2.5rem;
    font-weight: 600;
    font-family: monospace;
    color: #1f2937;
  }
  
  .label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }
`;

const DurationSelector = styled.div`
  margin: 1rem 0;
  
  label {
    display: block;
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }
  
  select {
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    background-color: white;
    font-size: 0.875rem;
  }
`;

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

const SessionPanel = ({ connected, onSessionStart }) => {
  const [selectedSessionType, setSelectedSessionType] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(300); // 5 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(sessionDuration);
  const timerRef = useRef(null);
  
  useEffect(() => {
    // Reset timer when duration changes
    setTimeRemaining(sessionDuration);
  }, [sessionDuration]);
  
  useEffect(() => {
    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const startSession = () => {
    if (!selectedSessionType || !connected) return;
    
    setSessionActive(true);
    setTimeRemaining(sessionDuration);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    if (onSessionStart) {
      onSessionStart(selectedSessionType, sessionDuration);
    }
  };
  
  const endSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSessionActive(false);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <SessionCard>
      <h2>
        Session Control
        <Tooltip>
          <span className="tooltip-icon">ⓘ</span>
          <span className="tooltip-text">Start a neurofeedback session with your selected parameters.</span>
        </Tooltip>
      </h2>
      
      {sessionActive ? (
        <>
          <SessionTimer>
            <div className="time">{formatTime(timeRemaining)}</div>
            <div className="label">Time Remaining</div>
          </SessionTimer>
          
          <SessionButton 
            isActive={true}
            onClick={endSession}
          >
            End Session
          </SessionButton>
        </>
      ) : (
        <>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Select a session type:
            </p>
            
            {sessionTypes.map(type => (
              <SessionTypeButton 
                key={type.id}
                className={selectedSessionType === type.id ? 'active' : ''}
                onClick={() => setSelectedSessionType(type.id)}
                disabled={!connected}
              >
                {type.name}
              </SessionTypeButton>
            ))}
          </div>
          
          <DurationSelector>
            <label htmlFor="session-duration">Session Duration:</label>
            <select 
              id="session-duration" 
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
              disabled={!connected}
            >
              <option value={60}>1 minute</option>
              <option value={180}>3 minutes</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
              <option value={900}>15 minutes</option>
              <option value={1800}>30 minutes</option>
            </select>
          </DurationSelector>
          
          <SessionButton 
            disabled={!selectedSessionType || !connected}
            onClick={startSession}
          >
            Start Session
          </SessionButton>
        </>
      )}
    </SessionCard>
  );
};

export default SessionPanel; 