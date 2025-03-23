import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaStop, FaSave, FaTrash } from 'react-icons/fa';
import museService from '../services/MuseService';
import databaseService from '../services/DatabaseService';
import RawSignals from './visualizations/RawSignals';

const Container = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: #2d3748;
`;

const RecordingPanel = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 0.375rem;
  border: none;
  background-color: ${props => props.color || '#4299e1'};
  color: white;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.disabled ? props.color || '#4299e1' : props.hoverColor || '#3182ce'};
  }
`;

const SessionInfo = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #718096;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
`;

const SessionTypeContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const SessionTypeLabel = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #4a5568;
`;

const SessionTypeSelect = styled.select`
  width: 100%;
  max-width: 250px;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  background-color: #f7fafc;
  font-size: 1rem;
  color: #2d3748;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

const NotConnectedMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #a0aec0;
  font-size: 1.25rem;
  text-align: center;
  line-height: 1.6;
`;

const NoteInput = styled.input`
  width: 100%;
  max-width: 500px;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  background-color: #f7fafc;
  font-size: 1rem;
  color: #2d3748;
  margin-top: 0.5rem;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

const NotesContainer = styled.div`
  margin-top: 1rem;
`;

function Recording() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sessionData, setSessionData] = useState([]);
  const [sessionType, setSessionType] = useState('baseline');
  const [sessionName, setSessionName] = useState('');
  const [dataPoints, setDataPoints] = useState(0);
  const navigate = useNavigate();

  // Subscribe to connection status
  useEffect(() => {
    const connectionSub = museService.connectionStatus$.subscribe(status => {
      setIsConnected(status);
    });

    return () => {
      connectionSub.unsubscribe();
      // Ensure recording is stopped if component unmounts during recording
      if (isRecording) {
        museService.stopRecording();
      }
    };
  }, [isRecording]);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Subscribe to recording data
  useEffect(() => {
    if (isRecording) {
      const dataSub = museService.recordingData$.subscribe(data => {
        if (data) {
          setSessionData(prevData => [...prevData, data]);
          setDataPoints(prevPoints => prevPoints + 1);
        }
      });

      return () => {
        dataSub.unsubscribe();
      };
    }
  }, [isRecording]);

  const startRecording = () => {
    setSessionData([]);
    setDataPoints(0);
    setRecordingTime(0);
    museService.startRecording();
    setIsRecording(true);
  };

  const stopRecording = () => {
    museService.stopRecording();
    setIsRecording(false);
  };

  const saveSession = async () => {
    if (sessionData.length === 0) return;

    // Generate default session name if not provided
    const timestamp = new Date().toISOString();
    const name = sessionName ? sessionName : `${sessionType} Session - ${timestamp}`;

    try {
      await databaseService.saveSession({
        name,
        type: sessionType,
        timestamp,
        duration: recordingTime,
        dataPoints: dataPoints,
        data: sessionData
      });

      // Reset recording state
      setSessionData([]);
      setDataPoints(0);
      setRecordingTime(0);
      setSessionName('');
      
      // Navigate to session history
      navigate('/sessions');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session. Please try again.');
    }
  };

  const discardSession = () => {
    setSessionData([]);
    setDataPoints(0);
    setRecordingTime(0);
    setSessionName('');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Container>
      <Header>
        <Title>Record Session</Title>
      </Header>

      {isConnected ? (
        <>
          <RecordingPanel>
            <ControlsContainer>
              <ButtonGroup>
                {!isRecording ? (
                  <Button 
                    onClick={startRecording} 
                    disabled={!isConnected}
                    color="#48bb78" 
                    hoverColor="#38a169"
                  >
                    <FaPlay /> Start Recording
                  </Button>
                ) : (
                  <Button 
                    onClick={stopRecording} 
                    color="#f56565" 
                    hoverColor="#e53e3e"
                  >
                    <FaStop /> Stop Recording
                  </Button>
                )}

                {!isRecording && sessionData.length > 0 && (
                  <>
                    <Button 
                      onClick={saveSession} 
                      color="#4299e1" 
                      hoverColor="#3182ce"
                    >
                      <FaSave /> Save Session
                    </Button>
                    <Button 
                      onClick={discardSession} 
                      color="#a0aec0" 
                      hoverColor="#718096"
                    >
                      <FaTrash /> Discard
                    </Button>
                  </>
                )}
              </ButtonGroup>

              <SessionInfo>
                <InfoItem>
                  <InfoLabel>Recording Time</InfoLabel>
                  <InfoValue>{formatTime(recordingTime)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Data Points</InfoLabel>
                  <InfoValue>{dataPoints}</InfoValue>
                </InfoItem>
              </SessionInfo>
            </ControlsContainer>

            <SessionTypeContainer>
              <SessionTypeLabel>Session Type</SessionTypeLabel>
              <SessionTypeSelect 
                value={sessionType} 
                onChange={(e) => setSessionType(e.target.value)}
                disabled={isRecording || sessionData.length > 0}
              >
                <option value="baseline">Baseline</option>
                <option value="meditation">Meditation</option>
                <option value="focus">Focus</option>
                <option value="custom">Custom</option>
              </SessionTypeSelect>
            </SessionTypeContainer>

            {!isRecording && sessionData.length > 0 && (
              <NotesContainer>
                <SessionTypeLabel>Session Name</SessionTypeLabel>
                <NoteInput 
                  type="text"
                  placeholder="Enter a name for this session..."
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                />
              </NotesContainer>
            )}
          </RecordingPanel>

          <RawSignals />
        </>
      ) : (
        <NotConnectedMessage>
          <p>Muse headset is not connected</p>
          <p>Connect your Muse headset to start recording sessions</p>
        </NotConnectedMessage>
      )}
    </Container>
  );
}

export default Recording; 