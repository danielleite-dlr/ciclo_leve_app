// metro.config.js
// Workaround: some packages (ex: react-native-worklets) expose TS sources via the `react-native` field.
// Expo/Metro can fail resolving TS source imports inside node_modules on some setups.
// Prefer compiled outputs via `module`/`main` to keep Expo Go stable.

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prefer compiled JS builds over `react-native` entrypoints.
config.resolver.resolverMainFields = ['module', 'main'];

module.exports = config;
