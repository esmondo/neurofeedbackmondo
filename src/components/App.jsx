import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';
import Dashboard from './Dashboard';
import RawSignals from './visualizations/RawSignals';

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
          </Routes>
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
}

export default App; 