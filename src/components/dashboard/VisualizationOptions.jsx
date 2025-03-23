import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const OptionsCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const VisualizationButton = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  color: #1f2937;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-color: #2563eb;
    text-decoration: none;
  }
  
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
    border-radius: 8px;
    background-color: #eff6ff;
    color: #2563eb;
  }
  
  .title {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  .description {
    font-size: 0.75rem;
    color: #6b7280;
    text-align: center;
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

const VisualizationOptions = ({ connected }) => {
  const visualizations = [
    {
      id: 'raw-signals',
      title: 'Raw Signals',
      description: 'View the unprocessed EEG signals from all channels',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 18.49L9.5 12.5L13.5 16.5L22 8L20.59 6.59L13.5 13.67L9.5 9.67L2 17.17L3.5 18.49Z" fill="currentColor"/>
        </svg>
      ),
      path: '/raw-signals'
    },
    {
      id: 'frequency-bands',
      title: 'Frequency Bands',
      description: 'Analyze power in different frequency bands',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 18H9V6H7V18ZM11 22H13V2H11V22ZM3 14H5V10H3V14ZM15 18H17V6H15V18ZM19 10V14H21V10H19Z" fill="currentColor"/>
        </svg>
      ),
      path: '/frequency-bands'
    },
    {
      id: 'brain-map',
      title: 'Brain Map',
      description: 'Visualize activity across different brain regions',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
          <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="currentColor"/>
        </svg>
      ),
      path: '/brain-map'
    },
    {
      id: 'neurofeedback',
      title: 'Neurofeedback',
      description: 'Interactive training for brain activity',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
        </svg>
      ),
      path: '/neurofeedback'
    }
  ];
  
  return (
    <OptionsCard>
      <h2>
        Visualizations
        <Tooltip>
          <span className="tooltip-icon">ⓘ</span>
          <span className="tooltip-text">Explore your brain data through different visualization types.</span>
        </Tooltip>
      </h2>
      
      <OptionsGrid>
        {visualizations.map(viz => (
          <VisualizationButton 
            key={viz.id} 
            to={viz.path}
            style={{ 
              opacity: connected ? 1 : 0.6, 
              color: '#1f2937'
            }}
          >
            <div className="icon">{viz.icon}</div>
            <div className="title">{viz.title}</div>
            <div className="description" style={{ color: '#6b7280' }}>{viz.description}</div>
          </VisualizationButton>
        ))}
      </OptionsGrid>
      
      {!connected && (
        <div style={{ marginTop: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
          Connect to your Muse headset to enable all visualizations
        </div>
      )}
    </OptionsCard>
  );
};

export default VisualizationOptions; 