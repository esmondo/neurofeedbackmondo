import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import { FaDownload, FaTrash, FaChartLine, FaExpand } from 'react-icons/fa';
import databaseService from '../services/DatabaseService';

// Styled components
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

const SessionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const NoSessionsMessage = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  grid-column: 1 / -1;
  color: #a0aec0;
  font-size: 1.1rem;
`;

const SessionCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
`;

const SessionHeader = styled.div`
  margin-bottom: 1rem;
`;

const SessionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SessionType = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.type) {
      case 'baseline': return '#ebf8ff';
      case 'meditation': return '#f0fff4';
      case 'focus': return '#fef5f5';
      default: return '#f7fafc';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'baseline': return '#3182ce';
      case 'meditation': return '#38a169';
      case 'focus': return '#e53e3e';
      default: return '#a0aec0';
    }
  }};
`;

const SessionDetails = styled.div`
  margin-bottom: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: #718096;
`;

const DetailValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
`;

const ChartPreview = styled.div`
  height: 100px;
  margin-bottom: 1rem;
`;

const SessionActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: auto;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 0.375rem;
  background-color: ${props => props.bgColor || '#f7fafc'};
  color: ${props => props.iconColor || '#4a5568'};
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.hoverBgColor || '#edf2f7'};
    color: ${props => props.hoverIconColor || '#2d3748'};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: auto;
  padding: 2rem;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #a0aec0;
  
  &:hover {
    color: #718096;
  }
`;

const ModalChartContainer = styled.div`
  height: 500px;
  margin-bottom: 2rem;
`;

function SessionHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const allSessions = await databaseService.getSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      try {
        await databaseService.deleteSession(sessionId);
        loadSessions();
      } catch (error) {
        console.error('Error deleting session:', error);
        alert('Failed to delete session. Please try again.');
      }
    }
  };

  const exportSessionData = (session) => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = `${session.name.replace(/\s+/g, '_')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const openSessionDetails = (session) => {
    setSelectedSession(session);
  };

  const closeSessionDetails = () => {
    setSelectedSession(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Generate preview chart data
  const getPreviewChartData = (session) => {
    if (!session.data || session.data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Sample the data to get a smaller dataset for preview
    const sampleRate = Math.max(1, Math.floor(session.data.length / 50));
    const sampledData = session.data.filter((_, index) => index % sampleRate === 0);

    // Extract timestamp and a representative data point (e.g., alpha power)
    const labels = sampledData.map((_, index) => index);
    
    // Try to get alpha power or any other representative value
    let dataPoints = [];
    if (sampledData[0] && sampledData[0].eegPower && sampledData[0].eegPower.alpha) {
      dataPoints = sampledData.map(d => d.eegPower.alpha.average);
    } else if (sampledData[0] && sampledData[0].eeg) {
      // If no power data, use raw EEG from the first channel
      dataPoints = sampledData.map(d => d.eeg[0] || 0);
    }

    return {
      labels,
      datasets: [
        {
          data: dataPoints,
          borderColor: '#4299e1',
          backgroundColor: 'rgba(66, 153, 225, 0.2)',
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  // Generate detailed chart data for the modal
  const getDetailedChartData = (session) => {
    if (!session.data || session.data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Sample the data for better performance in the detailed view
    const sampleRate = Math.max(1, Math.floor(session.data.length / 200));
    const sampledData = session.data.filter((_, index) => index % sampleRate === 0);

    // Extract timestamp 
    const labels = sampledData.map((_, index) => index);
    
    const datasets = [];

    // Add alpha, beta, theta, delta, gamma if available
    if (sampledData[0] && sampledData[0].eegPower) {
      if (sampledData[0].eegPower.alpha) {
        datasets.push({
          label: 'Alpha',
          data: sampledData.map(d => d.eegPower.alpha.average),
          borderColor: '#4299e1',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0
        });
      }
      
      if (sampledData[0].eegPower.beta) {
        datasets.push({
          label: 'Beta',
          data: sampledData.map(d => d.eegPower.beta.average),
          borderColor: '#48bb78',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0
        });
      }
      
      if (sampledData[0].eegPower.theta) {
        datasets.push({
          label: 'Theta',
          data: sampledData.map(d => d.eegPower.theta.average),
          borderColor: '#ed64a6',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0
        });
      }
      
      if (sampledData[0].eegPower.delta) {
        datasets.push({
          label: 'Delta',
          data: sampledData.map(d => d.eegPower.delta.average),
          borderColor: '#9f7aea',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0
        });
      }
      
      if (sampledData[0].eegPower.gamma) {
        datasets.push({
          label: 'Gamma',
          data: sampledData.map(d => d.eegPower.gamma.average),
          borderColor: '#f6ad55',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0
        });
      }
    } else if (sampledData[0] && sampledData[0].eeg) {
      // If no power data, use raw EEG from multiple channels
      for (let i = 0; i < sampledData[0].eeg.length; i++) {
        datasets.push({
          label: `Channel ${i + 1}`,
          data: sampledData.map(d => d.eeg[i] || 0),
          borderColor: ['#4299e1', '#48bb78', '#ed64a6', '#9f7aea'][i % 4],
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0
        });
      }
    }

    return {
      labels,
      datasets
    };
  };

  // Chart options
  const previewChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
        display: false
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };

  const detailedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Value'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <Container>
      <Header>
        <Title>Session History</Title>
      </Header>

      <SessionsContainer>
        {loading ? (
          <NoSessionsMessage>Loading sessions...</NoSessionsMessage>
        ) : sessions.length === 0 ? (
          <NoSessionsMessage>
            No recorded sessions found. Start recording to create your first session.
          </NoSessionsMessage>
        ) : (
          sessions.map(session => (
            <SessionCard key={session.id}>
              <SessionHeader>
                <SessionTitle>{session.name}</SessionTitle>
                <SessionType type={session.type}>{session.type}</SessionType>
              </SessionHeader>

              <SessionDetails>
                <DetailItem>
                  <DetailLabel>Date</DetailLabel>
                  <DetailValue>{formatDate(session.timestamp)}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Duration</DetailLabel>
                  <DetailValue>{formatDuration(session.duration)}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Data Points</DetailLabel>
                  <DetailValue>{session.dataPoints}</DetailValue>
                </DetailItem>
              </SessionDetails>

              <ChartPreview>
                <Line data={getPreviewChartData(session)} options={previewChartOptions} />
              </ChartPreview>

              <SessionActions>
                <div>
                  <ActionButton 
                    onClick={() => openSessionDetails(session)}
                    bgColor="#ebf8ff"
                    iconColor="#4299e1"
                    hoverBgColor="#bee3f8"
                    hoverIconColor="#3182ce"
                    title="View Details"
                  >
                    <FaExpand size={14} />
                  </ActionButton>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <ActionButton 
                    onClick={() => exportSessionData(session)}
                    bgColor="#f0fff4"
                    iconColor="#48bb78"
                    hoverBgColor="#c6f6d5"
                    hoverIconColor="#38a169"
                    title="Export Data"
                  >
                    <FaDownload size={14} />
                  </ActionButton>
                  <ActionButton 
                    onClick={() => deleteSession(session.id)}
                    bgColor="#fff5f5"
                    iconColor="#f56565"
                    hoverBgColor="#fed7d7"
                    hoverIconColor="#e53e3e"
                    title="Delete Session"
                  >
                    <FaTrash size={14} />
                  </ActionButton>
                </div>
              </SessionActions>
            </SessionCard>
          ))
        )}
      </SessionsContainer>

      {selectedSession && (
        <ModalOverlay onClick={closeSessionDetails}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedSession.name}</ModalTitle>
              <CloseButton onClick={closeSessionDetails}>&times;</CloseButton>
            </ModalHeader>

            <SessionDetails style={{ marginBottom: '1.5rem' }}>
              <DetailItem>
                <DetailLabel>Type</DetailLabel>
                <DetailValue>
                  <SessionType type={selectedSession.type}>{selectedSession.type}</SessionType>
                </DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Date</DetailLabel>
                <DetailValue>{formatDate(selectedSession.timestamp)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Duration</DetailLabel>
                <DetailValue>{formatDuration(selectedSession.duration)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Data Points</DetailLabel>
                <DetailValue>{selectedSession.dataPoints}</DetailValue>
              </DetailItem>
            </SessionDetails>

            <ModalChartContainer>
              <Line data={getDetailedChartData(selectedSession)} options={detailedChartOptions} />
            </ModalChartContainer>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button 
                onClick={() => exportSessionData(selectedSession)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#4299e1' }}
              >
                <FaDownload /> Export Data
              </Button>
              <Button 
                onClick={closeSessionDetails}
                style={{ backgroundColor: '#a0aec0' }}
              >
                Close
              </Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

// Additional styled component that wasn't defined earlier
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
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.hoverColor || '#3182ce'};
  }
`;

export default SessionHistory;