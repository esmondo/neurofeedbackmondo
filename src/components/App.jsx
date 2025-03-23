import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';
import Dashboard from './Dashboard';
import RawSignals from './visualizations/RawSignals';
import FrequencyBands from './visualizations/FrequencyBands';
import BrainMap from './visualizations/BrainMap';
import Neurofeedback from './visualizations/Neurofeedback';

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