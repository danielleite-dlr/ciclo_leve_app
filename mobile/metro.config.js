// metro.config.js
// Expo default Metro config.
// NOTE: We intentionally keep the default resolverMainFields (includes "react-native")
// to stay compatible with Expo Go native modules like react-native-safe-area-context.

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
