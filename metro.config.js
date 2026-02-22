const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'cjs' to the list of source extensions to support Firebase's CommonJS modules
config.resolver.sourceExts.push('cjs');

// Disable unstable package exports to avoid Firebase module resolution issues
config.resolver.unstable_enablePackageExports = false;

module.exports = config;

