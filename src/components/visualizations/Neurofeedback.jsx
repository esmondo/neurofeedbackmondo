import React from 'react';
import styled from 'styled-components';
import museService from '../../services/MuseService';

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

const PageTitle = styled.h2`
  margin: 0;
`;

const ComingSoonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 8px;
  padding: 3rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-height: 400px;
  
  h3 {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
    color: #2563eb;
  }

  p {
    color: #6b7280;
    margin-bottom: 1.5rem;
    max-width: 500px;
  }
`;

const AnimatedIllustration = styled.div`
  width: 200px;
  height: 200px;
  position: relative;
  margin-bottom: 1rem;
`;

const Circle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 3px solid #2563eb;
  animation: pulse 2s infinite ease-in-out;
  
  @keyframes pulse {
    0% {
      transform: translate(-50%, -50%) scale(0.95);
      box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
    }
    70% {
      transform: translate(-50%, -50%) scale(1);
      box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
    }
    100% {
      transform: translate(-50%, -50%) scale(0.95);
      box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
    }
  }
`;

const InnerCircle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: rgba(37, 99, 235, 0.1);
  border: 2px solid rgba(37, 99, 235, 0.3);
`;

const WaveContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 40px;
  transform: translateY(-50%);
  overflow: hidden;
`;

const Wave = styled.div`
  width: 200px;
  height: 40px;
  position: absolute;
  left: 0;
  background: linear-gradient(90deg, transparent, #2563eb, transparent);
  animation: waveMove 3s linear infinite;
  opacity: 0.5;
  
  @keyframes waveMove {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const FeatureList = styled.ul`
  text-align: left;
  margin-top: 1rem;
  
  li {
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    
    &:before {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 8px;
      background-color: #2563eb;
      border-radius: 50%;
    }
  }
`;

const NeurofeedbackTypeCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem;
  width: 180px;
  text-align: center;
  
  h4 {
    color: #2563eb;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.875rem;
    margin: 0;
  }
`;

const TypesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const Neurofeedback = () => {
  // Check connection status
  const [connected, setConnected] = React.useState(false);
  
  React.useEffect(() => {
    const subscription = museService.connectionStatus.subscribe(status => {
      setConnected(status);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const feedbackTypes = [
    { 
      name: "Focus Training", 
      description: "Improve concentration and attention span"
    },
    { 
      name: "Relaxation", 
      description: "Reduce stress and anxiety levels"
    },
    { 
      name: "Meditation", 
      description: "Enhance mindfulness and awareness"
    },
    { 
      name: "Sleep Quality", 
      description: "Improve sleep patterns and quality"
    }
  ];
  
  return (
    <Container>
      <Header>
        <PageTitle>Neurofeedback Training</PageTitle>
      </Header>
      
      <ComingSoonContainer>
        <AnimatedIllustration>
          <Circle />
          <InnerCircle />
          <WaveContainer>
            <Wave style={{ animationDelay: '0s' }} />
            <Wave style={{ animationDelay: '1s' }} />
            <Wave style={{ animationDelay: '2s' }} />
          </WaveContainer>
        </AnimatedIllustration>
        <h3>Neurofeedback Training Coming Soon!</h3>
        <p>
          We're developing interactive neurofeedback training protocols to help you improve cognitive performance, 
          relaxation, and mental well-being through real-time brainwave training.
        </p>
        
        <TypesContainer>
          {feedbackTypes.map((type, index) => (
            <NeurofeedbackTypeCard key={index}>
              <h4>{type.name}</h4>
              <p>{type.description}</p>
            </NeurofeedbackTypeCard>
          ))}
        </TypesContainer>
        
        <FeatureList>
          <li>Real-time feedback based on your brainwave activity</li>
          <li>Customizable training protocols for different goals</li>
          <li>Progress tracking to monitor improvements over time</li>
          <li>Guided training sessions with visual and audio feedback</li>
        </FeatureList>
        
        {!connected && (
          <p style={{ marginTop: "1rem", color: "#ef4444" }}>
            Please connect your Muse headset from the dashboard to activate this feature when available.
          </p>
        )}
      </ComingSoonContainer>
    </Container>
  );
};

export default Neurofeedback; 