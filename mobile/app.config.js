// app.config.js
// Garante que a API URL seja embutida no manifest (Constants.expoConfig.extra)
// porque process.env pode nao estar disponivel em runtime no APK.

module.exports = ({ config }) => {
  const apiUrl = (process.env.EXPO_PUBLIC_API_URL || '').trim();

  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      apiUrl: apiUrl || (config.extra && config.extra.apiUrl) || undefined,
    },
  };
};
