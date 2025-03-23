# NeuroFeedback Mondo

An application for EEG signal visualization and neurofeedback training built with web technologies.

## Key Features

- **Raw Signal Visualization**: View real-time EEG signals from all Muse headset channels
- **Frequency Band Visualization**: Analyze alpha, beta, gamma, delta, and theta waves
- **Mental States**: Track concentration, relaxation, and other mental states
- **Neurofeedback**: Train your brain through visual and auditory feedback
- **Session Recording**: Save your neurofeedback sessions for later analysis
- **Session History**: Review past sessions and track your progress over time
- **Settings**: Customize visualization settings and feedback parameters

## Technology Stack

- **React**: For building the user interface
- **Styled Components**: For component-level styling
- **Chart.js**: For signal visualization
- **RxJS**: For handling real-time data streams
- **Dexie.js**: For client-side session storage
- **Web Bluetooth API**: For connecting to the Muse headset

## Requirements

- Muse headset (2016 model or newer)
- Modern browser that supports Web Bluetooth API (Chrome, Edge, Opera)

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the application: `npm start`
4. Open http://localhost:3001 in your browser

## Connecting the Muse Headset

1. Turn on your Muse headset
2. Navigate to the Dashboard page in the application
3. Click "Connect to Muse"
4. Select your headset from the list of available devices
5. Wait for the connection to be established
6. The status indicator will turn green when connected

## Minimal Mode

The current version focuses on essential functionality:
- Headset connection (with simulation mode when no headset is available)
- Raw EEG signal visualization
- Basic signal processing with filters
- Simple and responsive UI

More advanced features will be added in future updates.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
