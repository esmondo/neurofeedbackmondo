// Run this in browser console to validate FFT implementation
function validateFFT() {
  console.log("Starting FFT validation...");
  
  if (window.fftService && typeof window.fftService.validateWithSyntheticData === 'function') {
    window.fftService.validateWithSyntheticData();
    console.log("FFT validation completed. Check results above.");
  } else {
    console.error("FFT service not found or validation method not available");
  }
}

console.log("To validate FFT implementation, run: validateFFT()"); 