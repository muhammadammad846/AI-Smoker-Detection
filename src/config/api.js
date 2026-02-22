/**
 * API and Socket URLs for backend.
 * Production: Set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_SOCKET_URL in EAS Build env or app.config.js extra.
 * Development: Uses __DEV__ fallback; edit DEV_API / DEV_SOCKET below if your machine IP differs.
 */
import Constants from 'expo-constants';

const DEV_API = 'http://192.168.18.56:3000/api';
const DEV_SOCKET = 'http://192.168.18.56:3000';
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
