import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.aside`
  width: 250px;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  padding: 1.5rem 0;
  height: 100%;
`;

const NavSection = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    color: var(--gray);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0 1.5rem;
    margin-bottom: 0.75rem;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: ${props => props.active ? 'var(--primary)' : 'var(--dark)'};
  background-color: ${props => props.active ? '#f0f5ff' : 'transparent'};
  border-left: 3px solid ${props => props.active ? 'var(--primary)' : 'transparent'};
  text-decoration: none;
  font-weight: ${props => props.active ? '500' : 'normal'};
  transition: all 0.2s;
  
  svg {
    margin-right: 0.75rem;
    color: ${props => props.active ? 'var(--primary)' : 'var(--gray)'};
  }
  
  &:hover {
    background-color: #f9fafb;
    color: var(--primary);
    text-decoration: none;
  }
`;

const Sidebar = () => {
  const location = useLocation();
  
  return (
    <SidebarContainer>
      <NavSection>
        <h3>Main</h3>
        <NavList>
          <NavItem>
            <NavLink to="/" active={location.pathname === '/'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
              </svg>
              Dashboard
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/record" active={location.pathname === '/record'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 16H8V8H16V16Z" fill="currentColor"/>
              </svg>
              Record Session
            </NavLink>
          </NavItem>
        </NavList>
      </NavSection>
      
      <NavSection>
        <h3>Visualizations</h3>
        <NavList>
          <NavItem>
            <NavLink to="/raw-signals" active={location.pathname === '/raw-signals'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 18.49L9.5 12.5L13.5 16.5L22 8L20.59 6.59L13.5 13.67L9.5 9.67L2 17.17L3.5 18.49Z" fill="currentColor"/>
              </svg>
              Raw Signals
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/frequency-bands" active={location.pathname === '/frequency-bands'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z" fill="currentColor"/>
              </svg>
              Frequency Bands
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/mental-states" active={location.pathname === '/mental-states'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3ZM21 19H3V5H21V19ZM8 15C8.55 15 9 14.55 9 14C9 13.45 8.55 13 8 13C7.45 13 7 13.45 7 14C7 14.55 7.45 15 8 15ZM8 11C8.55 11 9 10.55 9 10C9 9.45 8.55 9 8 9C7.45 9 7 9.45 7 10C7 10.55 7.45 11 8 11ZM8 7C8.55 7 9 6.55 9 6C9 5.45 8.55 5 8 5C7.45 5 7 5.45 7 6C7 6.55 7.45 7 8 7ZM16 15C16.55 15 17 14.55 17 14C17 13.45 16.55 13 16 13C15.45 13 15 13.45 15 14C15 14.55 15.45 15 16 15ZM16 11C16.55 11 17 10.55 17 10C17 9.45 16.55 9 16 9C15.45 9 15 9.45 15 10C15 10.55 15.45 11 16 11ZM16 7C16.55 7 17 6.55 17 6C17 5.45 16.55 5 16 5C15.45 5 15 5.45 15 6C15 6.55 15.45 7 16 7Z" fill="currentColor"/>
              </svg>
              Mental States
            </NavLink>
          </NavItem>
        </NavList>
      </NavSection>
      
      <NavSection>
        <h3>Neurofeedback</h3>
        <NavList>
          <NavItem>
            <NavLink to="/neurofeedback" active={location.pathname === '/neurofeedback'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 4V11H5.17L4 12.17V4H15ZM16 2H3C2.45 2 2 2.45 2 3V17L6 13H16C16.55 13 17 12.55 17 12V3C17 2.45 16.55 2 16 2ZM21 6H19V15H6V17C6 17.55 6.45 18 7 18H18L22 22V7C22 6.45 21.55 6 21 6Z" fill="currentColor"/>
              </svg>
              Neurofeedback Demo
            </NavLink>
          </NavItem>
        </NavList>
      </NavSection>
      
      <NavSection>
        <h3>History</h3>
        <NavList>
          <NavItem>
            <NavLink to="/sessions" active={location.pathname === '/sessions'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z" fill="currentColor"/>
              </svg>
              Session History
            </NavLink>
          </NavItem>
        </NavList>
      </NavSection>
    </SidebarContainer>
  );
};

export default Sidebar; 