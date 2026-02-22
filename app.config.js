/**
 * Expo app config. Set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_SOCKET_URL
 * for production backend URLs (e.g. in EAS Build environment).
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
