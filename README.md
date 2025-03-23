# NeuroFeedback Mondo

A web-based application for brain signal visualization and neurofeedback using the Muse EEG headset.

## Key Features

- **Raw Signal Visualization**: Display raw EEG data with filtering and scaling options.
- **Frequency Band Visualization**: Show power distribution across various frequency bands (delta, theta, alpha, beta, gamma).
- **Mental States**: Visualize mental states such as focus and relaxation using radar charts and time series.
- **Neurofeedback**: Training component for controlling brain activity.
- **Session Recording**: Record EEG data during sessions for local storage.
- **Session History**: Analyze and manage recorded sessions.
- **Settings**: Customize application settings and user preferences.

## Technology

- React
- Styled Components
- Chart.js
- RxJS
- Dexie.js
- Web Bluetooth API

## Requirements

- Compatible Muse headset
- Modern browser supporting Web Bluetooth API (Chrome, Edge)

## Getting Started

1. Clone the repository
   ```
   git clone https://github.com/username/neurofeedbackmondo.git
   cd neurofeedbackmondo
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Run the application
   ```
   npm start
   ```

4. Open your browser at http://localhost:3001

## How to Connect the Muse Headset

1. Turn on your Muse headset
2. Click the "Connect to Muse" button in the application
3. Select your Muse device from the list of available devices
4. Wait until the application shows "Connected" status

## Minimal Mode

The current version is a minimal implementation focused on:
- Connecting to the Muse headset (with simulation fallback)
- Raw EEG signal visualization
- Basic filtering and scaling options

The full version with all features will be implemented incrementally.

## License

ISC 