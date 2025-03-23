import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import museService from '../services/MuseService';

const HeaderContainer = styled.header`
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2563EB;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
`;

const NavItem = styled(Link)`
  margin-left: 1.5rem;
  color: #4b5563;
  font-weight: 500;
  text-decoration: none;
  
  &:hover {
    color: #2563EB;
  }
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: ${props => props.connected ? '#10b981' : '#9ca3af'};
  
  span {
    margin-left: 0.5rem;
  }
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.connected ? '#10b981' : '#9ca3af'};
`;

const Header = () => {
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    // Subscribe to connection status
    const subscription = museService.connectionStatus.subscribe(status => {
      setConnected(status);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return (
    <HeaderContainer>
      <Logo>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C14 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" 
            fill="#2563EB"/>
        </svg>
        NeuroFeedback Mondo
      </Logo>
      <Nav>
        <ConnectionStatus connected={connected}>
          <StatusDot connected={connected} />
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </ConnectionStatus>
        <NavItem to="/raw-signals">Raw Signals</NavItem>
      </Nav>
    </HeaderContainer>
  );
};

export default Header; 