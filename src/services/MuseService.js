import { MuseClient } from 'muse-js';
import { BehaviorSubject, Subject } from 'rxjs';
import { channelNames } from '../utils/constants';

class MuseService {
  constructor() {
    this.muse = new MuseClient();
    
    // Connection status
    this.connected = new BehaviorSubject(false);
    this.connectionStatus = this.connected.asObservable();
    
    // Raw EEG readings for each channel
    this.eegReadings = {};
    this.eegData = {};
    
    // Initialize EEG subjects for each channel
    channelNames.forEach((channel, index) => {
      this.eegReadings[channel] = new Subject();
      this.eegData[channel] = this.eegReadings[channel].asObservable();
    });
    
    // Telemetry data (battery, temperature)
    this.telemetrySubject = new BehaviorSubject(null);
    this.telemetryData = this.telemetrySubject.asObservable();
    
    // Are we using simulated data?
    this.simulationActive = false;
    this.simulationInterval = null;
  }
  
  async connect() {
    try {
      // Try to connect to real Muse device
      await this.muse.connect();
      console.log('Connected to Muse headset');
      
      // Update connection status
      this.connected.next(true);
      
      // Subscribe to EEG readings
      this.muse.eegReadings.subscribe(reading => {
        if (this.eegReadings[channelNames[reading.electrode]]) {
          this.eegReadings[channelNames[reading.electrode]].next(reading);
        }
      });
      
      // Subscribe to telemetry data
      this.muse.telemetryData.subscribe(telemetry => {
        this.telemetrySubject.next(telemetry);
      });
      
      // Start EEG data streaming
      await this.muse.start();
      
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      
      // Start simulation mode as fallback
      console.log('Starting simulation mode');
      this.startSimulation();
      
      return true; // Return true even for simulation
    }
  }
  
  async disconnect() {
    if (this.simulationActive) {
      this.stopSimulation();
      return true;
    }
    
    try {
      await this.muse.disconnect();
      this.connected.next(false);
      console.log('Disconnected from Muse headset');
      return true;
    } catch (error) {
      console.error('Disconnect error:', error);
      this.connected.next(false);
      return false;
    }
  }
  
  startSimulation() {
    if (this.simulationActive) return;
    
    this.simulationActive = true;
    this.connected.next(true);
    
    // Simulate telemetry data
    this.telemetrySubject.next({
      battery: 0.75,
      temperature: 28.5
    });
    
    // Simulate EEG data
    const sampleRate = 256; // Samples per second
    const updateInterval = 1000 / 10; // Update 10 times per second
    const samplesPerUpdate = sampleRate / (1000 / updateInterval);
    
    let time = 0;
    
    this.simulationInterval = setInterval(() => {
      // Generate fake samples for each channel
      channelNames.forEach((channel, index) => {
        const samples = [];
        
        // Generate samples
        for (let i = 0; i < samplesPerUpdate; i++) {
          // Simple sine wave with noise
          const sampleTime = time + i / sampleRate;
          const frequency = 10; // 10 Hz (alpha wave)
          const amplitude = 50 + Math.random() * 20;
          
          // Base sine wave
          let sample = amplitude * Math.sin(2 * Math.PI * frequency * sampleTime);
          
          // Add noise
          sample += (Math.random() * 2 - 1) * 30;
          
          samples.push(sample);
        }
        
        this.eegReadings[channel].next({
          electrode: index,
          timestamp: Date.now(),
          samples: samples
        });
      });
      
      time += samplesPerUpdate / sampleRate;
    }, updateInterval);
    
    console.log('Simulation started');
  }
  
  stopSimulation() {
    if (!this.simulationActive) return;
    
    clearInterval(this.simulationInterval);
    this.simulationInterval = null;
    this.simulationActive = false;
    this.connected.next(false);
    
    console.log('Simulation stopped');
  }
}

// Singleton instance
const museService = new MuseService();
export default museService; 