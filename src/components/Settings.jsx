import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSave, FaTrash, FaDownload, FaUpload } from 'react-icons/fa';
import databaseService from '../services/DatabaseService';

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

const SettingsPanel = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #4a5568;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.75rem;
`;

const Input = styled.input`
  width: 100%;
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

const Select = styled.select`
  width: 100%;
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

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const Checkbox = styled.input`
  margin-right: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 1rem;
  color: #4a5568;
  cursor: pointer;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
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

const FileUpload = styled.div`
  position: relative;
  overflow: hidden;
  display: inline-block;
`;

const HiddenInput = styled.input`
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const DataManagementCard = styled.div`
  background-color: #f7fafc;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
`;

const StorageInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const InfoLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #718096;
`;

const InfoValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
`;

const AlertMessage = styled.div`
  background-color: ${props => props.type === 'success' ? '#f0fff4' : '#fff5f5'};
  color: ${props => props.type === 'success' ? '#38a169' : '#e53e3e'};
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.type === 'success' ? '#48bb78' : '#f56565'};
`;

function Settings() {
  const [settings, setSettings] = useState({
    username: '',
    theme: 'light',
    sampleRate: 256,
    showNotifications: true,
    autoConnect: false,
    autoSave: true,
  });

  const [storageInfo, setStorageInfo] = useState({
    sessionCount: 0,
    totalSize: 0,
  });

  const [alert, setAlert] = useState(null);

  // Load settings and storage info on component mount
  useEffect(() => {
    loadSettings();
    loadStorageInfo();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await databaseService.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const sessions = await databaseService.getSessions();
      
      // Calculate total size (rough estimation)
      let totalSize = 0;
      sessions.forEach(session => {
        // Estimate size of session in KB (JSON serialization)
        const sessionSize = JSON.stringify(session).length / 1024;
        totalSize += sessionSize;
      });
      
      setStorageInfo({
        sessionCount: sessions.length,
        totalSize: Math.round(totalSize),
      });
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveSettings = async () => {
    try {
      await databaseService.saveSettings(settings);
      showAlert('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('Failed to save settings', 'error');
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      username: '',
      theme: 'light',
      sampleRate: 256,
      showNotifications: true,
      autoConnect: false,
      autoSave: true,
    };
    
    setSettings(defaultSettings);
    showAlert('Settings reset to defaults', 'success');
  };

  const exportAllData = async () => {
    try {
      const sessions = await databaseService.getSessions();
      const currentSettings = await databaseService.getSettings();
      
      const exportData = {
        settings: currentSettings,
        sessions: sessions
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileName = `neurofeedback_data_export_${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
      
      showAlert('Data exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showAlert('Failed to export data', 'error');
    }
  };

  const importData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          if (data.settings) {
            await databaseService.saveSettings(data.settings);
            setSettings(data.settings);
          }
          
          if (data.sessions && Array.isArray(data.sessions)) {
            // First clear existing sessions
            await databaseService.clearAllSessions();
            
            // Then import new sessions
            for (const session of data.sessions) {
              await databaseService.saveSession(session);
            }
            
            // Refresh storage info
            loadStorageInfo();
          }
          
          showAlert('Data imported successfully!', 'success');
        } catch (error) {
          console.error('Error parsing or saving imported data:', error);
          showAlert('Failed to import data. Invalid file format.', 'error');
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      showAlert('Failed to read import file', 'error');
    }
  };

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      try {
        await databaseService.clearAllSessions();
        
        // Reset storage info
        setStorageInfo({
          sessionCount: 0,
          totalSize: 0,
        });
        
        showAlert('All data has been cleared', 'success');
      } catch (error) {
        console.error('Error clearing data:', error);
        showAlert('Failed to clear data', 'error');
      }
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <Container>
      <Header>
        <Title>Settings</Title>
      </Header>

      {alert && (
        <AlertMessage type={alert.type}>
          {alert.message}
        </AlertMessage>
      )}

      <SettingsPanel>
        <SectionTitle>User Settings</SectionTitle>
        
        <FormGroup>
          <Label htmlFor="username">Username</Label>
          <Description>Used to identify your data across devices</Description>
          <Input 
            type="text" 
            id="username" 
            name="username" 
            value={settings.username} 
            onChange={handleInputChange} 
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="theme">Theme</Label>
          <Description>Select your preferred visual theme</Description>
          <Select 
            id="theme" 
            name="theme" 
            value={settings.theme} 
            onChange={handleInputChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">System Default</option>
          </Select>
        </FormGroup>

        <SectionTitle>Muse Device Settings</SectionTitle>
        
        <FormGroup>
          <Label htmlFor="sampleRate">Sample Rate (Hz)</Label>
          <Description>Higher rates capture more data but use more resources</Description>
          <Select 
            id="sampleRate" 
            name="sampleRate" 
            value={settings.sampleRate} 
            onChange={handleInputChange}
          >
            <option value="128">128 Hz</option>
            <option value="256">256 Hz</option>
            <option value="512">512 Hz (experimental)</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>Connection Options</Label>
          <CheckboxContainer>
            <Checkbox 
              type="checkbox" 
              id="autoConnect" 
              name="autoConnect" 
              checked={settings.autoConnect} 
              onChange={handleInputChange} 
            />
            <CheckboxLabel htmlFor="autoConnect">
              Auto-connect to last used device
            </CheckboxLabel>
          </CheckboxContainer>
        </FormGroup>

        <SectionTitle>Application Settings</SectionTitle>
        
        <FormGroup>
          <Label>Notifications</Label>
          <CheckboxContainer>
            <Checkbox 
              type="checkbox" 
              id="showNotifications" 
              name="showNotifications" 
              checked={settings.showNotifications} 
              onChange={handleInputChange} 
            />
            <CheckboxLabel htmlFor="showNotifications">
              Show notifications
            </CheckboxLabel>
          </CheckboxContainer>
        </FormGroup>
        
        <FormGroup>
          <Label>Session Recording</Label>
          <CheckboxContainer>
            <Checkbox 
              type="checkbox" 
              id="autoSave" 
              name="autoSave" 
              checked={settings.autoSave} 
              onChange={handleInputChange} 
            />
            <CheckboxLabel htmlFor="autoSave">
              Auto-save sessions when stopped
            </CheckboxLabel>
          </CheckboxContainer>
        </FormGroup>
        
        <ButtonsContainer>
          <Button 
            onClick={resetSettings} 
            color="#a0aec0" 
            hoverColor="#718096"
          >
            Reset Defaults
          </Button>
          <Button 
            onClick={saveSettings} 
            color="#4299e1" 
            hoverColor="#3182ce"
          >
            <FaSave /> Save Settings
          </Button>
        </ButtonsContainer>
      </SettingsPanel>

      <SettingsPanel>
        <SectionTitle>Data Management</SectionTitle>
        
        <DataManagementCard>
          <StorageInfo>
            <div>
              <InfoLabel>Total Sessions</InfoLabel>
              <InfoValue>{storageInfo.sessionCount}</InfoValue>
            </div>
            <div>
              <InfoLabel>Storage Used</InfoLabel>
              <InfoValue>{storageInfo.totalSize} KB</InfoValue>
            </div>
          </StorageInfo>
          
          <Description>
            You can export your data to back it up or transfer it to another device. 
            Importing will replace all existing data.
          </Description>
          
          <ButtonsContainer>
            <Button 
              onClick={clearAllData} 
              color="#f56565" 
              hoverColor="#e53e3e"
            >
              <FaTrash /> Clear All Data
            </Button>
            <Button 
              onClick={exportAllData}
              color="#4299e1" 
              hoverColor="#3182ce"
            >
              <FaDownload /> Export All Data
            </Button>
            <FileUpload>
              <Button 
                as="span" 
                color="#48bb78" 
                hoverColor="#38a169"
              >
                <FaUpload /> Import Data
              </Button>
              <HiddenInput 
                type="file" 
                accept=".json"
                onChange={importData}
              />
            </FileUpload>
          </ButtonsContainer>
        </DataManagementCard>
      </SettingsPanel>
    </Container>
  );
}

export default Settings; 