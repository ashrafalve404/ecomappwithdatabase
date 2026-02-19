// Configuration for the app
// IMPORTANT: Replace YOUR_LOCAL_IP with your actual local IP address
// For Android Emulator: use 10.0.2.2
// For iOS Simulator: use localhost or your machine's IP
// For physical devices: use your machine's local IP address

export const API_CONFIG = {
  // Your Django backend API URL
  // For Android Emulator: use http://10.0.2.2:8000
  // For iOS Simulator: use http://localhost:8000
  // For physical devices: use your machine's local IP address
  
  BASE_URL: 'http://10.0.2.2:8000/api/',
  
  // Timeout in milliseconds
  TIMEOUT: 30000,
};

export default API_CONFIG;
