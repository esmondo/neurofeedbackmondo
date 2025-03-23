import { MuseClient } from 'muse-js';
import { BehaviorSubject, Subject } from 'rxjs';
import { channelNames } from '../utils/constants';
import fftService from './FFTService';

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
    
    // Link to FFT service for frequency band power
    this.eegPower = fftService.eegPower;
    
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
          // Forward to our observable
          this.eegReadings[channelNames[reading.electrode]].next(reading);
          
          // Send to FFT service for frequency analysis
          fftService.addData(channelNames[reading.electrode], reading.samples);
        }
      });
      
      // Subscribe to telemetry data
      this.muse.telemetryData.subscribe(telemetry => {
        this.telemetrySubject.next(telemetry);
      });
      
      // Start EEG data streaming
      await this.muse.start();
      
      // Start FFT analysis
      fftService.start();
      
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
      // Stop FFT analysis
      fftService.stop();
      
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
    
    // Start FFT service for frequency band analysis
    fftService.start();
    
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
          
          // Create a complex wave with multiple frequencies
          // to better simulate real EEG with different bands
          
          // Delta wave (3 Hz)
          const delta = 40 * Math.sin(2 * Math.PI * 3 * sampleTime);
          
          // Theta wave (6 Hz)
          const theta = 20 * Math.sin(2 * Math.PI * 6 * sampleTime);
          
          // Alpha wave (10 Hz)
          const alpha = 30 * Math.sin(2 * Math.PI * 10 * sampleTime);
          
          // Beta wave (20 Hz)
          const beta = 15 * Math.sin(2 * Math.PI * 20 * sampleTime);
          
          // Gamma wave (40 Hz)
          const gamma = 10 * Math.sin(2 * Math.PI * 40 * sampleTime);
          
          // Combine waves
          let sample = delta + theta + alpha + beta + gamma;
          
          // Add noise
          sample += (Math.random() * 2 - 1) * 15;
          
          samples.push(sample);
        }
        
        // Send to our observable
        this.eegReadings[channel].next({
          electrode: index,
          timestamp: Date.now(),
          samples: samples
        });
        
        // Send to FFT service for frequency analysis
        fftService.addData(channel, samples);
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
    
    // Stop FFT analysis
    fftService.stop();
    
    console.log('Simulation stopped');
  }
}

// Singleton instance
const museService = new MuseService();
export default museService; 