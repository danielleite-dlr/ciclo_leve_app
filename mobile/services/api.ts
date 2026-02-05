import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from './storage';

// Base URL por ambiente:
// 1) app.json -> extra.apiUrl (mais "à prova de build")
// 2) EXPO_PUBLIC_API_URL (EAS env / Expo env)
// 3) fallback (localhost = EMULADOR/SIMULATOR, NUNCA device real)
const extraApiUrl = (Constants.expoConfig?.extra as any)?.apiUrl as string | undefined;
const envApiUrl = (process.env.EXPO_PUBLIC_API_URL || '').trim();

// IMPORTANTE: em APK, env pode vir vazio. Preferimos o valor embutido em app.config.js (extra.apiUrl).
const baseURL = (extraApiUrl || envApiUrl || '').trim() || 'http://localhost:3000/api/v1';

// eslint-disable-next-line no-console
console.log('[API] baseURL =', baseURL, '| extra?', !!extraApiUrl, '| env?', !!envApiUrl);

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
