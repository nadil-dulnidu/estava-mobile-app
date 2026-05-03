// Babel config for Expo/React Native transpilation pipeline.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"]
  };
};