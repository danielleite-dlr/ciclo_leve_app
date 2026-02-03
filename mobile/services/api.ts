import axios from 'axios';
import { getToken } from './storage';

// IMPORTANTE: Para Android Emulator use 'http://10.0.2.2:3000/api/v1'
// Para iOS Simulator use 'http://localhost:3000/api/v1'
// Para dispositivo físico use o IP da sua máquina: 'http://192.168.x.x:3000/api/v1'

const api = axios.create({
  baseURL: 'https://8e52310b0d36.ngrok-free.app/api/v1', 
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
