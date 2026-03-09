/**
 * Expo app config. Production backend URLs are set via environment variables
 * so the app connects to your deployed API and Socket server.
 *
 * EAS Build (production APK):
 *   Set in Expo dashboard → Project → Environment variables → production:
 *     EXPO_PUBLIC_API_URL    = https://your-backend.fly.dev/api
 *     EXPO_PUBLIC_SOCKET_URL = https://your-backend.fly.dev
 *
 * Local production test:
 *   EXPO_PUBLIC_API_URL=https://... EXPO_PUBLIC_SOCKET_URL=https://... npx expo start --no-dev
 */
const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || null,
      socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL || null,
    },
  },
};
