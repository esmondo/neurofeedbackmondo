import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
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
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    .nav-text {
      display: none;
    }
  }
`;

const NavItem = styled(Link)`
  margin-left: 1.5rem;
  color: ${props => props.active ? '#2563EB' : '#4b5563'};
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  position: relative;
  
  &:hover {
    color: #2563EB;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1rem;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #2563EB;
    transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.3s ease;
  }
  
  &:hover::after {
    transform: scaleX(1);
  }
  
  @media (max-width: 768px) {
    margin-left: 1rem;
    
    svg {
      margin-right: 0;
    }
  }
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: ${props => props.connected ? '#10b981' : '#9ca3af'};
  margin-right: ${props => props.menuVisible ? '0' : '1rem'};
  
  span {
    margin-left: 0.5rem;
  }
  
  @media (max-width: 768px) {
    span {
      display: none;
    }
  }
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.connected ? '#10b981' : '#9ca3af'};
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #4b5563;
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 640px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: ${props => props.visible ? 'flex' : 'none'};
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  background-color: white;
  flex-direction: column;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  
  a {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: #4b5563;
    text-decoration: none;
    border-radius: 0.375rem;
    
    &:hover {
      background-color: #f9fafb;
      color: #2563EB;
    }
    
    &.active {
      background-color: #eff6ff;
      color: #2563EB;
    }
    
    svg {
      margin-right: 0.75rem;
    }
  }
`;

const Header = () => {
  const [connected, setConnected] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Subscribe to connection status
    const subscription = museService.connectionStatus.subscribe(status => {
      setConnected(status);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <HeaderContainer>
      <Logo as={Link} to="/">
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
        
        {/* Desktop Navigation */}
        <NavItem to="/" active={isActive('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.25rem' }}>
            <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
          </svg>
          <span className="nav-text">Dashboard</span>
        </NavItem>
        
        <NavItem to="/raw-signals" active={isActive('/raw-signals')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.25rem' }}>
            <path d="M3.5 18.49L9.5 12.5L13.5 16.5L22 8L20.59 6.59L13.5 13.67L9.5 9.67L2 17.17L3.5 18.49Z" fill="currentColor"/>
          </svg>
          <span className="nav-text">Raw Signals</span>
        </NavItem>
        
        <NavItem to="/frequency-bands" active={isActive('/frequency-bands')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.25rem' }}>
            <path d="M7 18H9V6H7V18ZM11 22H13V2H11V22ZM3 14H5V10H3V14ZM15 18H17V6H15V18ZM19 10V14H21V10H19Z" fill="currentColor"/>
          </svg>
          <span className="nav-text">Frequency Bands</span>
        </NavItem>
        
        <MobileMenuButton onClick={toggleMenu}>
          ☰
        </MobileMenuButton>
      </Nav>
      
      {/* Mobile Navigation Menu */}
      <MobileMenu visible={menuVisible}>
        <Link to="/" className={isActive('/') ? 'active' : ''} onClick={() => setMenuVisible(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
          </svg>
          Dashboard
        </Link>
        
        <Link to="/raw-signals" className={isActive('/raw-signals') ? 'active' : ''} onClick={() => setMenuVisible(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 18.49L9.5 12.5L13.5 16.5L22 8L20.59 6.59L13.5 13.67L9.5 9.67L2 17.17L3.5 18.49Z" fill="currentColor"/>
          </svg>
          Raw Signals
        </Link>
        
        <Link to="/frequency-bands" className={isActive('/frequency-bands') ? 'active' : ''} onClick={() => setMenuVisible(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18H9V6H7V18ZM11 22H13V2H11V22ZM3 14H5V10H3V14ZM15 18H17V6H15V18ZM19 10V14H21V10H19Z" fill="currentColor"/>
          </svg>
          Frequency Bands
        </Link>
        
        <Link to="/brain-map" className={isActive('/brain-map') ? 'active' : ''} onClick={() => setMenuVisible(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
            <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="currentColor"/>
          </svg>
          Brain Map
        </Link>
        
        <Link to="/neurofeedback" className={isActive('/neurofeedback') ? 'active' : ''} onClick={() => setMenuVisible(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
          </svg>
          Neurofeedback
        </Link>
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header; 