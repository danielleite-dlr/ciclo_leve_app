import axios from 'axios';
import { getToken } from './storage';

// Base URL por ambiente (Expo): defina EXPO_PUBLIC_API_URL
// Exemplos:
// - Android Emulator:  http://10.0.2.2:3000/api/v1
// - iOS Simulator:    http://localhost:3000/api/v1
// - Device na mesma rede: http://192.168.x.x:3000/api/v1
// - Túnel (ngrok/cloudflared): https://<...>/api/v1
const baseURL = (process.env.EXPO_PUBLIC_API_URL || '').trim() || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
