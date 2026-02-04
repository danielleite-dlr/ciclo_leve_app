module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      // NativeWind requires a Babel plugin (must run before Reanimated)
      "nativewind/babel",
      // Reanimated plugin must be last
      "react-native-reanimated/plugin",
    ],
  };
};
