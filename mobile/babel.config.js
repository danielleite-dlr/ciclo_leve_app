module.exports = function (api) {
  api.cache(true);
  return {
    // NOTE: nativewind/babel exports a PRESET (it returns { plugins: [...] }).
    // If we put it under `plugins`, Babel errors with:
    // ".plugins is not a valid Plugin property".
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Reanimated plugin must be last
    plugins: ["react-native-reanimated/plugin"],
  };
};
