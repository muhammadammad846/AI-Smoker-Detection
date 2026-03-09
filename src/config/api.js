/**
 * API and Socket URLs for backend.
 * Production: Set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_SOCKET_URL in EAS Build env or app.config.js extra.
 * Development: When no env is set, uses host address so emulator/simulator can reach backend on same machine.
 * Physical device: set EXPO_PUBLIC_API_URL to your computer's LAN IP (e.g. http://192.168.1.5:3000/api).
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PORT = 3000;
// Android emulator: 10.0.2.2 is the host machine. iOS simulator: 127.0.0.1 is localhost.
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const DEV_API = `http://${DEV_HOST}:${PORT}/api`;
const DEV_SOCKET = `http://${DEV_HOST}:${PORT}`;
const PROD_API_PLACEHOLDER = 'https://your-production-url.com/api';
const PROD_SOCKET_PLACEHOLDER = 'https://your-production-url.com';

function getApiBaseUrl() {
  const extra = Constants.expoConfig?.extra;
  if (extra?.apiUrl) return extra.apiUrl;
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return __DEV__ ? DEV_API : PROD_API_PLACEHOLDER;
}

function getSocketUrl() {
  const extra = Constants.expoConfig?.extra;
  if (extra?.socketUrl) return extra.socketUrl;
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SOCKET_URL) {
    return process.env.EXPO_PUBLIC_SOCKET_URL;
  }
  return __DEV__ ? DEV_SOCKET : PROD_SOCKET_PLACEHOLDER;
}

export const API_BASE_URL = getApiBaseUrl();
export const SOCKET_URL = getSocketUrl();

if (__DEV__ && typeof global !== 'undefined') {
  const url = API_BASE_URL || '(none)';
  console.log('[API config] API_BASE_URL:', url);
  if (!url || url === '(none)') {
    console.warn('[API config] No API URL set. Edit src/config/api.js DEV_API or set EXPO_PUBLIC_API_URL.');
  }
}
