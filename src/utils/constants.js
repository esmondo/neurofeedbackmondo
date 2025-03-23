// Muse EEG channel names
export const channelNames = ['TP9', 'AF7', 'AF8', 'TP10'];

// Frequency bands definitions (Hz)
export const frequencyBands = {
  delta: [1, 4],
  theta: [4, 8],
  alpha: [8, 13],
  beta: [13, 30],
  gamma: [30, 50]
};

// Color scheme for frequency bands
export const bandColors = {
  delta: '#4C51BF', // indigo
  theta: '#805AD5', // purple
  alpha: '#4299E1', // blue
  beta: '#48BB78',  // green
  gamma: '#F6AD55'  // orange
};

export const channelColors = {
  TP9: '#4A72B0',   // left ear
  AF7: '#54B151',   // left forehead
  AF8: '#E0A32E',   // right forehead
  TP10: '#DB4325'   // right ear
};

// Sampling rate of Muse EEG (samples per second)
export const samplingRate = 256;

// Number of seconds of data to display in raw visualization
export const rawDisplaySeconds = 5;

// Default neurofeedback settings
export const defaultNeurofeedbackSettings = {
  targetBand: 'alpha',
  threshold: 1.2, // baseline multiplier
  rewardType: 'visual', // visual, audio, both
  sessionDuration: 300, // seconds
  feedbackInterval: 0.5, // seconds
};

// Mental state thresholds
export const mentalStateThresholds = {
  focus: 0.7,
  relaxation: 0.65,
  stress: 0.5
};

// Mental state colors
export const mentalStateColors = {
  focus: '#805AD5',    // purple
  relaxation: '#4299E1', // blue
  stress: '#F56565'    // red
};

// Database name for IndexedDB
export const dbName = 'neurofeedbackDB';
export const dbVersion = 1;

// Session types
export const sessionTypes = [
  { id: 'baseline', name: 'Baseline Recording' },
  { id: 'meditation', name: 'Meditation' },
  { id: 'focus', name: 'Focus Training' },
  { id: 'custom', name: 'Custom Session' }
];

// Default app settings
export const defaultSettings = {
  theme: 'light',
  dataRetentionDays: 90,
  sampleRate: 256, // Hz
  autoConnect: false,
  showTooltips: true,
  defaultSessionDuration: 300, // seconds
  defaultCalibrationDuration: 60, // seconds
  neurofeedback: defaultNeurofeedbackSettings
}; 