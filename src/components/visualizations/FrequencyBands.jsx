import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import museService from '../../services/MuseService';
import { channelNames, bandColors, frequencyBands } from '../../utils/constants';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const PageTitle = styled.h2`
  margin: 0;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const ViewSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
  }
  
  button {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
`;

const ChartContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: ${props => props.height || '300px'};
`;

const BandInfoContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const BandCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-width: 200px;
  border-top: 4px solid ${props => props.color};
`;

const BandName = styled.h3`
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: ${props => props.color};
`;

const BandDescription = styled.p`
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
`;

const BandValue = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
`;

const ChannelSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  select {
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    background-color: white;
    font-size: 0.875rem;
  }
`;

const AmplitudeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  input {
    width: 80px;
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    background-color: white;
    font-size: 0.875rem;
  }
`;

const SmoothingControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  select {
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    background-color: white;
    font-size: 0.875rem;
  }
`;

const RangeSliderContainer = styled.div`
  width: 100%;
  max-width: 300px;
  padding: 0 10px;
  margin-top: 5px;
`;

const RangeSlider = styled.div`
  position: relative;
  height: 40px;
`;

const RangeTrack = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  width: 100%;
  background-color: #e5e7eb;
  border-radius: 2px;
`;

const RangeProgress = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  background-color: #2563eb;
  border-radius: 2px;
`;

const RangeHandle = styled.div`
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background-color: #2563eb;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  
  &:hover {
    background-color: #1d4ed8;
  }
  
  &:active {
    width: 20px;
    height: 20px;
  }
`;

const RangeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  
  span {
    font-size: 0.75rem;
    color: #6b7280;
  }
`;

const FrequencyRangeControl = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  width: 100%;
  
  label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 5px;
  }
`;

const TimeRangeControl = styled(FrequencyRangeControl)``;

const PowerScaleControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  input {
    width: 80px;
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    background-color: white;
    font-size: 0.875rem;
  }
`;

const ScaleFactorControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  select {
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    background-color: white;
    font-size: 0.875rem;
  }
`;

const UnitSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  select {
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    background-color: white;
    font-size: 0.875rem;
  }
`;

const DevicePresetSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  select {
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    background-color: white;
    font-size: 0.875rem;
  }
`;

const AutoScaleButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    background-color: #1d4ed8;
  }
`;

const AdvancedSettingsToggle = styled.button`
  padding: 0.5rem 1rem;
  background-color: white;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #f9fafb;
  }
  
  svg {
    transition: transform 0.2s;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const AdvancedSettings = styled.div`
  background-color: #f9fafb;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-top: 1rem;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const BandScalingContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
`;

const BandScalingControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-size: 0.875rem;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    span {
      width: 12px;
      height: 12px;
      display: inline-block;
      border-radius: 50%;
      background-color: ${props => props.color};
    }
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    background-color: white;
    font-size: 0.875rem;
  }
`;

const NotConnectedMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 8px;
  padding: 3rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  h3 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    
    &:hover {
      background-color: #1d4ed8;
    }
  }
`;

// Band descriptions
const bandDescriptions = {
  delta: 'Associated with deep sleep and unconsciousness. High levels when awake may indicate brain injuries or learning problems.',
  theta: 'Present during deep relaxation and meditation. Associated with creativity, intuition, and daydreaming.',
  alpha: 'Dominant during relaxed wakefulness with closed eyes. Indicates relaxation and reduced anxiety.',
  beta: 'Associated with active, busy thinking and active concentration. Dominant during normal waking consciousness.',
  gamma: 'Related to simultaneous processing of information from different brain areas. Associated with higher cognitive functioning.'
};

const FrequencyBands = () => {
  // View mode: 'bar', 'spectrum', 'time'
  const [viewMode, setViewMode] = useState('bar');
  
  // Connection status
  const [connected, setConnected] = useState(false);
  
  // Current power values by frequency band
  const [powerValues, setPowerValues] = useState({
    delta: 0,
    theta: 0,
    alpha: 0,
    beta: 0,
    gamma: 0
  });
  
  // Channel to display for spectrum and time views
  const [selectedChannel, setSelectedChannel] = useState('average');
  
  // Add scaling factor state to adjust power values
  const [powerScaleFactor, setPowerScaleFactor] = useState(1000); // Default scaling factor
  
  // Add default visualization-specific power limits
  const DEFAULT_BAR_LIMIT = 500;
  const DEFAULT_SPECTRUM_LIMIT = 300;
  const DEFAULT_TIME_LIMIT = 400;
  
  // Static amplitude for Y-axis (can be adjusted)
  const [powerScaleLimit, setPowerScaleLimit] = useState(DEFAULT_BAR_LIMIT);
  
  // Smoothing factor for time series (0-100%)
  const [smoothingFactor, setSmoothingFactor] = useState(50);
  
  // Frequency range for spectrum view (Hz)
  const [frequencyRange, setFrequencyRange] = useState([1, 50]);
  
  // Time window for time series (seconds)
  const [timeWindow, setTimeWindow] = useState([0, 60]);
  const MAX_TIME_WINDOW = 60;
  
  // Current spectrum data for the selected channel
  const [spectrumData, setSpectrumData] = useState({
    labels: Array.from({length: 50}, (_, i) => i + 1), // 1-50 Hz
    datasets: [
      {
        label: 'Power Spectrum',
        data: Array(50).fill(0),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  });
  
  // Time series data for each band
  const [timeSeriesData, setTimeSeriesData] = useState({
    labels: Array(60).fill(''),
    datasets: Object.keys(frequencyBands).map(band => ({
      label: band.charAt(0).toUpperCase() + band.slice(1),
      data: Array(60).fill(0),
      borderColor: bandColors[band],
      backgroundColor: `${bandColors[band]}20`,
      tension: 0.4,
    })),
  });
  
  // Store historical power values for time series
  const powerHistoryRef = React.useRef({
    delta: Array(60).fill(0),
    theta: Array(60).fill(0),
    alpha: Array(60).fill(0),
    beta: Array(60).fill(0),
    gamma: Array(60).fill(0)
  });
  
  // Store raw values before smoothing
  const rawPowerHistoryRef = React.useRef({
    delta: Array(60).fill(0),
    theta: Array(60).fill(0),
    alpha: Array(60).fill(0),
    beta: Array(60).fill(0),
    gamma: Array(60).fill(0)
  });
  
  // Add unit selection (μV² or dB)
  const [powerUnit, setPowerUnit] = useState('uv2'); // 'uv2' or 'db'
  
  // Add device preset selection
  const [devicePreset, setDevicePreset] = useState('muse2');
  
  // Add advanced settings toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Add individual band scaling factors
  const [bandScalingFactors, setBandScalingFactors] = useState({
    delta: 1.0,
    theta: 1.0,
    alpha: 1.0,
    beta: 1.0,
    gamma: 1.0
  });
  
  // Add auto-scaling state
  const [isAutoScaling, setIsAutoScaling] = useState(false);
  
  // Add data buffers for auto-scaling
  const powerBufferRef = React.useRef({
    delta: [],
    theta: [],
    alpha: [],
    beta: [],
    gamma: []
  });
  
  // Device presets for common EEG devices
  const devicePresets = {
    muse2: {
      scaleFactor: 1000,
      barLimit: 500,
      spectrumLimit: 300,
      timeLimit: 400
    },
    museS: {
      scaleFactor: 1500,
      barLimit: 750,
      spectrumLimit: 450,
      timeLimit: 600
    },
    emotiv: {
      scaleFactor: 5000,
      barLimit: 2500,
      spectrumLimit: 1500,
      timeLimit: 2000
    },
    openBCI: {
      scaleFactor: 10000,
      barLimit: 5000,
      spectrumLimit: 3000,
      timeLimit: 4000
    },
    custom: {
      scaleFactor: powerScaleFactor,
      barLimit: DEFAULT_BAR_LIMIT,
      spectrumLimit: DEFAULT_SPECTRUM_LIMIT,
      timeLimit: DEFAULT_TIME_LIMIT
    }
  };
  
  // Reference value for dB conversion (1 μV² is common in EEG)
  const DB_REFERENCE = 1.0;
  
  // Convert power to dB
  const powerTodB = (power) => {
    // Avoid log of 0 or negative numbers
    if (power <= 0) return -100;
    return 10 * Math.log10(power / DB_REFERENCE);
  };
  
  // Apply device preset
  useEffect(() => {
    if (devicePreset === 'custom') return;
    
    const preset = devicePresets[devicePreset];
    setPowerScaleFactor(preset.scaleFactor);
    
    // Update limits based on current view
    switch(viewMode) {
      case 'bar':
        setPowerScaleLimit(preset.barLimit);
        break;
      case 'spectrum':
        setPowerScaleLimit(preset.spectrumLimit);
        break;
      case 'time':
        setPowerScaleLimit(preset.timeLimit);
        break;
    }
  }, [devicePreset]);
  
  // Auto-scaling logic
  const performAutoScaling = () => {
    // Need at least 10 samples for meaningful auto-scaling
    if (powerBufferRef.current.delta.length < 10) {
      console.log("Not enough data for auto-scaling yet");
      return;
    }
    
    // Find max power across all bands
    let maxPower = 0;
    Object.keys(frequencyBands).forEach(band => {
      const bandMax = Math.max(...powerBufferRef.current[band]);
      if (bandMax > maxPower) maxPower = bandMax;
    });
    
    // Calculate appropriate scale factor
    // We want the max value to be about 80% of our display limit
    const targetMaxValue = powerScaleLimit * 0.8;
    const rawMaxValue = maxPower / powerScaleFactor; // Value without current scaling
    const newScaleFactor = targetMaxValue / rawMaxValue;
    
    console.log(`Auto-scaling: Max power ${maxPower}, new scale factor ${newScaleFactor}`);
    
    // Update scale factor (clamped to reasonable values)
    const clampedScaleFactor = Math.max(1, Math.min(1000000, Math.round(newScaleFactor)));
    setPowerScaleFactor(clampedScaleFactor);
    
    // Update device preset to custom
    setDevicePreset('custom');
    
    // Calculate individual band scaling factors
    const newBandScalingFactors = {};
    Object.keys(frequencyBands).forEach(band => {
      const bandMax = Math.max(...powerBufferRef.current[band]);
      if (bandMax > 0) {
        const bandScaleFactor = (targetMaxValue / bandMax) * (maxPower / bandMax);
        newBandScalingFactors[band] = Math.min(5.0, Math.max(0.2, bandScaleFactor / newScaleFactor));
      } else {
        newBandScalingFactors[band] = 1.0;
      }
    });
    
    setBandScalingFactors(newBandScalingFactors);
  };
  
  // Update view mode limits based on device preset
  useEffect(() => {
    if (devicePreset === 'custom') return;
    
    const preset = devicePresets[devicePreset];
    switch(viewMode) {
      case 'bar':
        setPowerScaleLimit(preset.barLimit);
        break;
      case 'spectrum':
        setPowerScaleLimit(preset.spectrumLimit);
        break;
      case 'time':
        setPowerScaleLimit(preset.timeLimit);
        break;
    }
  }, [viewMode, devicePreset]);
  
  // Handle frequency range changes
  const handleFrequencyRangeChange = (newRange) => {
    setFrequencyRange(newRange);
    
    // Filter spectrum data to show only the selected frequency range
    const filteredLabels = spectrumData.labels.filter(label => 
      label >= newRange[0] && label <= newRange[1]
    );
    
    const filteredData = spectrumData.datasets[0].data.filter((_, i) => 
      (i + 1) >= newRange[0] && (i + 1) <= newRange[1]
    );
    
    setFilteredSpectrumData({
      labels: filteredLabels,
      datasets: [
        {
          ...spectrumData.datasets[0],
          data: filteredData
        }
      ]
    });
  };
  
  // Handle time window changes
  const handleTimeWindowChange = (newWindow) => {
    setTimeWindow(newWindow);
    
    // Calculate the indices for the time window
    const startIndex = Math.max(0, powerHistoryRef.current.delta.length - (MAX_TIME_WINDOW - newWindow[0]));
    const endIndex = powerHistoryRef.current.delta.length - (MAX_TIME_WINDOW - newWindow[1]);
    
    // Update time series data with the selected time window
    setFilteredTimeSeriesData({
      labels: Array(newWindow[1] - newWindow[0]).fill(''),
      datasets: Object.keys(frequencyBands).map(band => {
        const timeData = powerHistoryRef.current[band].slice(startIndex, endIndex);
        return {
          label: band.charAt(0).toUpperCase() + band.slice(1),
          data: timeData.map(val => Math.min(val, powerScaleLimit)),
          borderColor: bandColors[band],
          backgroundColor: `${bandColors[band]}20`,
          tension: 0.4,
        };
      }),
    });
  };
  
  // Filtered spectrum data based on frequency range
  const [filteredSpectrumData, setFilteredSpectrumData] = useState({
    labels: Array.from({length: 50}, (_, i) => i + 1), // 1-50 Hz
    datasets: [
      {
        label: 'Power Spectrum',
        data: Array(50).fill(0),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  });
  
  // Filtered time series data based on time window
  const [filteredTimeSeriesData, setFilteredTimeSeriesData] = useState({
    labels: Array(60).fill(''),
    datasets: Object.keys(frequencyBands).map(band => ({
      label: band.charAt(0).toUpperCase() + band.slice(1),
      data: Array(60).fill(0),
      borderColor: bandColors[band],
      backgroundColor: `${bandColors[band]}20`,
      tension: 0.4,
    })),
  });
  
  // Range slider components
  const FrequencyRangeSlider = () => {
    const minVal = 1;
    const maxVal = 50;
    const rangeWidth = 300; // Width of the slider in pixels
    
    // Calculate handle positions
    const leftHandlePos = (frequencyRange[0] - minVal) / (maxVal - minVal) * 100;
    const rightHandlePos = (frequencyRange[1] - minVal) / (maxVal - minVal) * 100;
    
    // Create refs for the slider container
    const sliderRef = React.useRef(null);
    
    // Handle drag events
    const createDragHandler = (isLeft) => {
      let containerRect = null;
      
      const moveHandler = (moveEvent) => {
        if (!containerRect) return;
        
        const pos = (moveEvent.clientX - containerRect.left) / containerRect.width;
        let newVal = Math.round(pos * (maxVal - minVal) + minVal);
        newVal = Math.max(minVal, Math.min(maxVal, newVal));
        
        if (isLeft) {
          if (newVal < frequencyRange[1]) {
            handleFrequencyRangeChange([newVal, frequencyRange[1]]);
          }
        } else {
          if (newVal > frequencyRange[0]) {
            handleFrequencyRangeChange([frequencyRange[0], newVal]);
          }
        }
      };
      
      const upHandler = () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        containerRect = null;
      };
      
      return (e) => {
        // Store the container rect at the start of drag
        if (sliderRef.current) {
          containerRect = sliderRef.current.getBoundingClientRect();
          document.addEventListener('mousemove', moveHandler);
          document.addEventListener('mouseup', upHandler);
        }
      };
    };
    
    return (
      <RangeSliderContainer>
        <RangeSlider ref={sliderRef}>
          <RangeTrack />
          <RangeProgress 
            style={{
              left: `${leftHandlePos}%`,
              width: `${rightHandlePos - leftHandlePos}%`
            }}
          />
          <RangeHandle 
            style={{ left: `${leftHandlePos}%` }}
            onMouseDown={createDragHandler(true)}
          />
          <RangeHandle 
            style={{ left: `${rightHandlePos}%` }}
            onMouseDown={createDragHandler(false)}
          />
        </RangeSlider>
        <RangeLabels>
          <span>{frequencyRange[0]} Hz</span>
          <span>{frequencyRange[1]} Hz</span>
        </RangeLabels>
      </RangeSliderContainer>
    );
  };
  
  // Time slider component
  const TimeRangeSlider = () => {
    const minVal = 0;
    const maxVal = MAX_TIME_WINDOW;
    
    // Calculate handle positions
    const leftHandlePos = (timeWindow[0] - minVal) / (maxVal - minVal) * 100;
    const rightHandlePos = (timeWindow[1] - minVal) / (maxVal - minVal) * 100;
    
    // Create refs for the slider container
    const sliderRef = React.useRef(null);
    
    // Handle drag events with the same improved pattern
    const createDragHandler = (isLeft) => {
      let containerRect = null;
      
      const moveHandler = (moveEvent) => {
        if (!containerRect) return;
        
        const pos = (moveEvent.clientX - containerRect.left) / containerRect.width;
        let newVal = Math.round(pos * (maxVal - minVal) + minVal);
        newVal = Math.max(minVal, Math.min(maxVal, newVal));
        
        if (isLeft) {
          if (newVal < timeWindow[1]) {
            handleTimeWindowChange([newVal, timeWindow[1]]);
          }
        } else {
          if (newVal > timeWindow[0]) {
            handleTimeWindowChange([timeWindow[0], newVal]);
          }
        }
      };
      
      const upHandler = () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        containerRect = null;
      };
      
      return (e) => {
        // Store the container rect at the start of drag
        if (sliderRef.current) {
          containerRect = sliderRef.current.getBoundingClientRect();
          document.addEventListener('mousemove', moveHandler);
          document.addEventListener('mouseup', upHandler);
        }
      };
    };
    
    return (
      <RangeSliderContainer>
        <RangeSlider ref={sliderRef}>
          <RangeTrack />
          <RangeProgress 
            style={{
              left: `${leftHandlePos}%`,
              width: `${rightHandlePos - leftHandlePos}%`
            }}
          />
          <RangeHandle 
            style={{ left: `${leftHandlePos}%` }}
            onMouseDown={createDragHandler(true)}
          />
          <RangeHandle 
            style={{ left: `${rightHandlePos}%` }}
            onMouseDown={createDragHandler(false)}
          />
        </RangeSlider>
        <RangeLabels>
          <span>{timeWindow[0]}s</span>
          <span>{timeWindow[1]}s</span>
        </RangeLabels>
      </RangeSliderContainer>
    );
  };
  
  useEffect(() => {
    // Subscribe to connection status
    const connectionSubscription = museService.connectionStatus.subscribe(status => {
      setConnected(status);
    });
    
    // Subscribe to EEG power data
    const powerSubscription = museService.eegPower.subscribe(power => {
      if (!power) return;
      
      // Calculate average power across channels for each band
      const avgPower = {
        delta: 0,
        theta: 0,
        alpha: 0,
        beta: 0,
        gamma: 0
      };
      
      // Process the data differently based on selected channel
      if (selectedChannel === 'average') {
        // Calculate average across all channels
        Object.keys(frequencyBands).forEach(band => {
          // Apply scaling factor and band-specific scaling to power values
          avgPower[band] = (power[band].reduce((a, b) => a + b, 0) / power[band].length) 
                           * powerScaleFactor 
                           * bandScalingFactors[band];
        });
      } else {
        // Get data for the specific channel
        const channelIndex = channelNames.indexOf(selectedChannel);
        if (channelIndex !== -1) {
          Object.keys(frequencyBands).forEach(band => {
            // Apply scaling factor and band-specific scaling to power values
            avgPower[band] = power[band][channelIndex] 
                             * powerScaleFactor 
                             * bandScalingFactors[band];
          });
        }
      }
      
      // Store raw values in buffer for auto-scaling (before conversion to dB)
      Object.keys(frequencyBands).forEach(band => {
        // Keep buffer at 100 samples max
        if (powerBufferRef.current[band].length >= 100) {
          powerBufferRef.current[band].shift();
        }
        powerBufferRef.current[band].push(avgPower[band]);
      });
      
      // Convert to dB if needed
      const displayPower = {};
      if (powerUnit === 'db') {
        Object.keys(frequencyBands).forEach(band => {
          displayPower[band] = powerTodB(avgPower[band]);
        });
      } else {
        displayPower = {...avgPower};
      }
      
      // Update current power values
      setPowerValues(powerUnit === 'db' ? displayPower : avgPower);
      
      // Update raw history first
      Object.keys(frequencyBands).forEach(band => {
        rawPowerHistoryRef.current[band] = [
          ...rawPowerHistoryRef.current[band].slice(1), 
          avgPower[band]
        ];
      });
      
      // Apply smoothing based on smoothing factor
      Object.keys(frequencyBands).forEach(band => {
        const rawValues = rawPowerHistoryRef.current[band];
        const lastSmoothedValue = powerHistoryRef.current[band][powerHistoryRef.current[band].length - 1];
        const newSmoothedValue = smoothValue(avgPower[band], lastSmoothedValue, smoothingFactor);
        
        powerHistoryRef.current[band] = [
          ...powerHistoryRef.current[band].slice(1), 
          newSmoothedValue
        ];
      });
      
      // Update time series data with power scale limit
      setTimeSeriesData({
        labels: Array(60).fill(''),
        datasets: Object.keys(frequencyBands).map(band => ({
          label: band.charAt(0).toUpperCase() + band.slice(1),
          data: powerHistoryRef.current[band].map(val => Math.min(val, powerScaleLimit)),
          borderColor: bandColors[band],
          backgroundColor: `${bandColors[band]}20`,
          tension: 0.4,
        })),
      });
      
      // Generate spectrum data
      // This would come from a real FFT in a production app
      // Here we're creating a simplified spectrum based on the band power
      const mockSpectrum = Array.from({length: 50}, (_, i) => {
        const freq = i + 1; // 1-50 Hz
        let value = 0;
        
        // Delta (1-4 Hz)
        if (freq >= 1 && freq <= 4) {
          const position = (freq - 1) / 3; // 0 to 1 within the band
          value = avgPower.delta * (1 - position) * (0.8 + Math.random() * 0.4);
        }
        // Theta (4-8 Hz)
        else if (freq > 4 && freq <= 8) {
          const position = (freq - 4) / 4; // 0 to 1 within the band
          value = avgPower.theta * (1 - position) * (0.7 + Math.random() * 0.4);
        }
        // Alpha (8-13 Hz)
        else if (freq > 8 && freq <= 13) {
          const position = (freq - 8) / 5; // 0 to 1 within the band
          value = avgPower.alpha * (1 - position * 0.8) * (0.8 + Math.random() * 0.4);
        }
        // Beta (13-30 Hz)
        else if (freq > 13 && freq <= 30) {
          const position = (freq - 13) / 17; // 0 to 1 within the band
          value = avgPower.beta * (1 - position * 0.7) * (0.7 + Math.random() * 0.3);
        }
        // Gamma (30-50 Hz)
        else if (freq > 30 && freq <= 50) {
          const position = (freq - 30) / 20; // 0 to 1 within the band
          value = avgPower.gamma * (1 - position * 0.6) * (0.7 + Math.random() * 0.3);
        }
        
        return value;
      });
      
      const newSpectrumData = {
        labels: Array.from({length: 50}, (_, i) => i + 1),
        datasets: [
          {
            label: 'Power Spectrum',
            data: mockSpectrum,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
      
      setSpectrumData(newSpectrumData);
      
      // Update filtered spectrum data based on current frequency range
      handleFrequencyRangeChange(frequencyRange);
      
      // Update filtered time series data based on current time window
      handleTimeWindowChange(timeWindow);
      
      // Auto-scale if enabled and sufficient data is available
      if (isAutoScaling && powerBufferRef.current.delta.length >= 60) {
        performAutoScaling();
        setIsAutoScaling(false); // Turn off auto-scaling after applying
      }
    });
    
    return () => {
      connectionSubscription.unsubscribe();
      powerSubscription.unsubscribe();
    };
  }, [selectedChannel, smoothingFactor, frequencyRange, timeWindow, powerScaleLimit, powerScaleFactor, bandScalingFactors, isAutoScaling]);
  
  // Apply exponential smoothing to a value
  const smoothValue = (newValue, prevValue, factor) => {
    const alpha = factor / 100; // Convert 0-100% to 0-1
    return alpha * newValue + (1 - alpha) * prevValue;
  };
  
  // Update limit when changing visualization
  useEffect(() => {
    switch(viewMode) {
      case 'bar':
        setPowerScaleLimit(DEFAULT_BAR_LIMIT);
        break;
      case 'spectrum':
        setPowerScaleLimit(DEFAULT_SPECTRUM_LIMIT);
        break;
      case 'time':
        setPowerScaleLimit(DEFAULT_TIME_LIMIT);
        break;
    }
  }, [viewMode]);
  
  // Prepare bar chart data
  const barData = {
    labels: Object.keys(frequencyBands).map(band => {
      const { min, max } = frequencyBands[band];
      return `${band.charAt(0).toUpperCase() + band.slice(1)} (${min}-${max} Hz)`;
    }),
    datasets: [
      {
        label: 'Power',
        data: Object.values(powerValues),
        backgroundColor: Object.values(bandColors),
        borderWidth: 1,
      },
    ],
  };
  
  // Update chart options based on power unit
  const getYAxisTitle = () => {
    return powerUnit === 'db' ? 'Power (dB)' : 'Power (μV²)';
  };
  
  const getTooltipLabel = (value, unit, freq) => {
    if (unit === 'db') {
      return `${value.toFixed(1)} dB${freq ? ` at ${freq} Hz` : ''}`;
    } else {
      return `${value.toFixed(1)} μV²${freq ? ` at ${freq} Hz` : ''}`;
    }
  };
  
  // Update chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: powerUnit === 'db' ? 40 : powerScaleLimit, // dB scale typically -20 to 40
        min: powerUnit === 'db' ? -20 : 0,
        title: {
          display: true,
          text: getYAxisTitle()
        }
      },
      x: {
        title: {
          display: true,
          text: 'Frequency Bands (Hz)'
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };
  
  const spectrumOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: powerUnit !== 'db',
        max: powerUnit === 'db' ? 40 : powerScaleLimit,
        min: powerUnit === 'db' ? -20 : 0,
        title: {
          display: true,
          text: getYAxisTitle()
        }
      },
      x: {
        title: {
          display: true,
          text: 'Frequency (Hz)'
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return getTooltipLabel(context.parsed.y, powerUnit, context.parsed.x);
          }
        }
      }
    },
  };
  
  const timeSeriesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: powerUnit !== 'db',
        max: powerUnit === 'db' ? 40 : powerScaleLimit,
        min: powerUnit === 'db' ? -20 : 0,
        title: {
          display: true,
          text: getYAxisTitle()
        }
      },
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time (seconds)'
        },
        ticks: {
          callback: function(value, index) {
            // Only show some time labels for readability
            const timeValue = timeWindow[0] + (index * ((timeWindow[1] - timeWindow[0]) / 10));
            return index % 2 === 0 ? timeValue.toFixed(0) + 's' : '';
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return getTooltipLabel(context.parsed.y, powerUnit, null);
          }
        }
      }
    },
    animation: {
      duration: 0 // Disable animations for smoother updates
    }
  };
  
  return (
    <Container>
      <Header>
        <PageTitle>Frequency Band Power</PageTitle>
        
        <ControlsContainer>
          <ViewSelector>
            <button 
              onClick={() => setViewMode('bar')}
              style={{
                backgroundColor: viewMode === 'bar' ? '#2563eb' : 'white',
                color: viewMode === 'bar' ? 'white' : '#374151',
                border: `1px solid ${viewMode === 'bar' ? '#2563eb' : '#e5e7eb'}`
              }}
            >
              Bar Chart
            </button>
            <button 
              onClick={() => setViewMode('spectrum')}
              style={{
                backgroundColor: viewMode === 'spectrum' ? '#2563eb' : 'white',
                color: viewMode === 'spectrum' ? 'white' : '#374151',
                border: `1px solid ${viewMode === 'spectrum' ? '#2563eb' : '#e5e7eb'}`
              }}
            >
              Spectrum
            </button>
            <button 
              onClick={() => setViewMode('time')}
              style={{
                backgroundColor: viewMode === 'time' ? '#2563eb' : 'white',
                color: viewMode === 'time' ? 'white' : '#374151',
                border: `1px solid ${viewMode === 'time' ? '#2563eb' : '#e5e7eb'}`
              }}
            >
              Time Series
            </button>
          </ViewSelector>
          
          {(viewMode === 'spectrum' || viewMode === 'time') && (
            <ChannelSelector>
              <label>Channel:</label>
              <select 
                value={selectedChannel} 
                onChange={e => setSelectedChannel(e.target.value)}
              >
                <option value="average">Average</option>
                {channelNames.map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </ChannelSelector>
          )}
          
          <DevicePresetSelector>
            <label>Device:</label>
            <select
              value={devicePreset}
              onChange={e => setDevicePreset(e.target.value)}
            >
              <option value="muse2">Muse 2</option>
              <option value="museS">Muse S</option>
              <option value="emotiv">Emotiv</option>
              <option value="openBCI">OpenBCI</option>
              <option value="custom">Custom</option>
            </select>
          </DevicePresetSelector>
          
          <PowerScaleControl>
            <label>Max Power:</label>
            <input 
              type="number"
              min="10"
              max="1000000"
              step="10"
              value={powerScaleLimit}
              onChange={e => {
                setPowerScaleLimit(Number(e.target.value));
                setDevicePreset('custom'); // Switch to custom when manually changing
              }}
            />
          </PowerScaleControl>
          
          <ScaleFactorControl>
            <label>Scale Factor:</label>
            <select
              value={powerScaleFactor}
              onChange={e => {
                setPowerScaleFactor(Number(e.target.value));
                setDevicePreset('custom'); // Switch to custom when manually changing
              }}
            >
              <option value="1">x1</option>
              <option value="10">x10</option>
              <option value="100">x100</option>
              <option value="1000">x1,000</option>
              <option value="10000">x10,000</option>
              <option value="100000">x100,000</option>
            </select>
          </ScaleFactorControl>
          
          <UnitSelector>
            <label>Unit:</label>
            <select
              value={powerUnit}
              onChange={e => setPowerUnit(e.target.value)}
            >
              <option value="uv2">μV²</option>
              <option value="db">dB</option>
            </select>
          </UnitSelector>
          
          <AutoScaleButton 
            onClick={() => setIsAutoScaling(true)}
            disabled={isAutoScaling}
          >
            Auto Scale
          </AutoScaleButton>
          
          <AdvancedSettingsToggle 
            isOpen={showAdvanced}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Advanced
            <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8L2 4h8L6 8z" fill="currentColor" />
            </svg>
          </AdvancedSettingsToggle>
          
          {viewMode === 'time' && (
            <>
              <SmoothingControl>
                <label>Smoothing:</label>
                <select
                  value={smoothingFactor}
                  onChange={e => setSmoothingFactor(Number(e.target.value))}
                >
                  <option value="0">None (0%)</option>
                  <option value="25">Low (25%)</option>
                  <option value="50">Medium (50%)</option>
                  <option value="75">High (75%)</option>
                  <option value="90">Very High (90%)</option>
                </select>
              </SmoothingControl>
              
              <TimeRangeControl>
                <label>Time Window (seconds):</label>
                <TimeRangeSlider />
              </TimeRangeControl>
            </>
          )}
          
          {viewMode === 'spectrum' && (
            <FrequencyRangeControl>
              <label>Frequency Range (Hz):</label>
              <FrequencyRangeSlider />
            </FrequencyRangeControl>
          )}
        </ControlsContainer>
        
        <AdvancedSettings isOpen={showAdvanced}>
          <h3>Per-Band Scaling Factors</h3>
          <p>Adjust the relative scaling of each frequency band:</p>
          
          <BandScalingContainer>
            {Object.keys(frequencyBands).map(band => (
              <BandScalingControl key={band} color={bandColors[band]}>
                <label>
                  <span style={{ backgroundColor: bandColors[band] }}></span>
                  {band.charAt(0).toUpperCase() + band.slice(1)}
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="5"
                  step="0.1"
                  value={bandScalingFactors[band]}
                  onChange={e => {
                    const newFactors = {...bandScalingFactors};
                    newFactors[band] = Number(e.target.value);
                    setBandScalingFactors(newFactors);
                  }}
                />
                <div style={{ textAlign: 'center' }}>
                  {bandScalingFactors[band].toFixed(1)}x
                </div>
              </BandScalingControl>
            ))}
          </BandScalingContainer>
        </AdvancedSettings>
      </Header>
      
      {connected ? (
        <>
          <ChartContainer height="400px">
            {viewMode === 'bar' && (
              <Bar data={barData} options={barOptions} />
            )}
            
            {viewMode === 'spectrum' && (
              <Line data={filteredSpectrumData} options={spectrumOptions} />
            )}
            
            {viewMode === 'time' && (
              <Line data={filteredTimeSeriesData} options={timeSeriesOptions} />
            )}
          </ChartContainer>
          
          <BandInfoContainer>
            {Object.keys(frequencyBands).map(band => (
              <BandCard key={band} color={bandColors[band]}>
                <BandName color={bandColors[band]}>
                  {band.charAt(0).toUpperCase() + band.slice(1)}
                </BandName>
                <div>
                  {frequencyBands[band].min}-{frequencyBands[band].max} Hz
                </div>
                <BandDescription>
                  {bandDescriptions[band]}
                </BandDescription>
                <BandValue>
                  {powerUnit === 'db' 
                    ? `${powerTodB(powerValues[band]).toFixed(1)} dB` 
                    : `${powerValues[band].toFixed(1)} μV²`}
                </BandValue>
              </BandCard>
            ))}
          </BandInfoContainer>
        </>
      ) : (
        <NotConnectedMessage>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#9CA3AF"/>
            <path d="M7 10.5L11 16.5L12.5 13.5L15.5 16.5L17 10.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Not Connected to Muse</h3>
          <p>Please connect to your Muse headset from the dashboard to view frequency band data.</p>
          <button onClick={() => window.location.href = '/'}>
            Go to Dashboard
          </button>
        </NotConnectedMessage>
      )}
    </Container>
  );
};

export default FrequencyBands; 