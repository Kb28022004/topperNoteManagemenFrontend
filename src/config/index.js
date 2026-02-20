// Load from env or fallback
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.21.32:8000/api/v1';

console.log('API_BASE_URL:', API_BASE_URL); // Debugging
