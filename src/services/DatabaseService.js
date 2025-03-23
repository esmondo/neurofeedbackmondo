import Dexie from 'dexie';
import { dbName, dbVersion } from '../utils/constants';

class DatabaseService {
  constructor() {
    this.db = new Dexie(dbName);
    
    // Define database schema
    this.db.version(dbVersion).stores({
      sessions: '++id, type, startTime, endTime, name',
      eegData: 'sessionId, timestamp, channel, *samples',
      powerData: 'sessionId, timestamp, *bands',
      mentalStates: 'sessionId, timestamp, *state',
      markers: 'sessionId, timestamp, value',
      calibrations: '++id, timestamp, *baselineData',
      settings: 'id, value'
    });
  }
  
  async saveSession(sessionData) {
    try {
      // Begin transaction
      return await this.db.transaction('rw', 
        this.db.sessions, 
        this.db.eegData, 
        this.db.powerData, 
        this.db.mentalStates, 
        this.db.markers, 
        async () => {
          
        // Save session metadata
        const sessionId = await this.db.sessions.add({
          type: sessionData.type || 'custom',
          name: sessionData.name || `Session ${new Date().toLocaleString()}`,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
          duration: sessionData.endTime - sessionData.startTime,
          notes: sessionData.notes || ''
        });
        
        // Group and save session data by type
        const dataByType = {
          eeg: [],
          power: [],
          mental_state: [],
          marker: []
        };
        
        sessionData.data.forEach(item => {
          if (dataByType[item.type]) {
            dataByType[item.type].push(item);
          }
        });
        
        // Save EEG data
        if (dataByType.eeg.length > 0) {
          await this.db.eegData.bulkAdd(
            dataByType.eeg.map(item => ({
              sessionId,
              timestamp: item.timestamp,
              channel: item.channel,
              samples: item.samples
            }))
          );
        }
        
        // Save frequency power data
        if (dataByType.power.length > 0) {
          await this.db.powerData.bulkAdd(
            dataByType.power.map(item => ({
              sessionId,
              timestamp: item.timestamp,
              bands: item.bands
            }))
          );
        }
        
        // Save mental state data
        if (dataByType.mental_state.length > 0) {
          await this.db.mentalStates.bulkAdd(
            dataByType.mental_state.map(item => ({
              sessionId,
              timestamp: item.timestamp,
              state: item.state
            }))
          );
        }
        
        // Save markers
        if (dataByType.marker.length > 0) {
          await this.db.markers.bulkAdd(
            dataByType.marker.map(item => ({
              sessionId,
              timestamp: item.timestamp,
              value: item.value
            }))
          );
        }
        
        return sessionId;
      });
    } catch (error) {
      console.error('Error saving session data:', error);
      throw error;
    }
  }
  
  async saveCalibration(calibrationData) {
    try {
      return await this.db.calibrations.add({
        timestamp: Date.now(),
        baselineData: calibrationData
      });
    } catch (error) {
      console.error('Error saving calibration data:', error);
      throw error;
    }
  }
  
  async getLatestCalibration() {
    try {
      return await this.db.calibrations
        .orderBy('timestamp')
        .reverse()
        .first();
    } catch (error) {
      console.error('Error getting latest calibration:', error);
      return null;
    }
  }
  
  async getSessions() {
    try {
      return await this.db.sessions
        .orderBy('startTime')
        .reverse()
        .toArray();
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }
  
  async getSessionById(sessionId) {
    try {
      const session = await this.db.sessions.get(sessionId);
      
      if (!session) {
        throw new Error(`Session with ID ${sessionId} not found`);
      }
      
      // Get all data for this session
      const [eegData, powerData, mentalStates, markers] = await Promise.all([
        this.db.eegData.where('sessionId').equals(sessionId).toArray(),
        this.db.powerData.where('sessionId').equals(sessionId).toArray(),
        this.db.mentalStates.where('sessionId').equals(sessionId).toArray(),
        this.db.markers.where('sessionId').equals(sessionId).toArray()
      ]);
      
      return {
        ...session,
        eegData,
        powerData,
        mentalStates,
        markers
      };
    } catch (error) {
      console.error(`Error getting session ${sessionId}:`, error);
      throw error;
    }
  }
  
  async deleteSession(sessionId) {
    try {
      return await this.db.transaction('rw',
        this.db.sessions,
        this.db.eegData,
        this.db.powerData,
        this.db.mentalStates,
        this.db.markers,
        async () => {
          // Delete all related data first
          await this.db.eegData.where('sessionId').equals(sessionId).delete();
          await this.db.powerData.where('sessionId').equals(sessionId).delete();
          await this.db.mentalStates.where('sessionId').equals(sessionId).delete();
          await this.db.markers.where('sessionId').equals(sessionId).delete();
          
          // Delete the session itself
          await this.db.sessions.delete(sessionId);
          
          return true;
        });
    } catch (error) {
      console.error(`Error deleting session ${sessionId}:`, error);
      throw error;
    }
  }
  
  async updateSessionNotes(sessionId, notes) {
    try {
      await this.db.sessions.update(sessionId, { notes });
      return true;
    } catch (error) {
      console.error(`Error updating notes for session ${sessionId}:`, error);
      throw error;
    }
  }
  
  async exportSessionData(sessionId) {
    try {
      const sessionData = await this.getSessionById(sessionId);
      return JSON.stringify(sessionData);
    } catch (error) {
      console.error(`Error exporting session ${sessionId}:`, error);
      throw error;
    }
  }

  // Settings methods
  async saveSettings(settings) {
    try {
      await this.db.settings.put({
        id: 'userSettings',
        value: settings
      });
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async getSettings() {
    try {
      const settingsObj = await this.db.settings.get('userSettings');
      return settingsObj ? settingsObj.value : null;
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();
export default databaseService; 