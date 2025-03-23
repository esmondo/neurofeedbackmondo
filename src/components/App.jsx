import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';
import Dashboard from './Dashboard';
import RawSignals from './visualizations/RawSignals';

// Placeholder components for new pages
const FrequencyBands = () => <div style={{ padding: '2rem' }}><h1>Frequency Bands Visualization</h1><p>Coming soon!</p></div>;
const BrainMap = () => <div style={{ padding: '2rem' }}><h1>Brain Map Visualization</h1><p>Coming soon!</p></div>;
const Neurofeedback = () => <div style={{ padding: '2rem' }}><h1>Neurofeedback Training</h1><p>Coming soon!</p></div>;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 1.5rem;
  background-color: #f9fafb;
  overflow-y: auto;
`;

function App() {
  return (
    <AppContainer>
      <Header />
      <MainContent>
        <ContentArea>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/raw-signals" element={<RawSignals />} />
            <Route path="/frequency-bands" element={<FrequencyBands />} />
            <Route path="/brain-map" element={<BrainMap />} />
            <Route path="/neurofeedback" element={<Neurofeedback />} />
          </Routes>
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
}

export default App; 