module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // මෙතන යටින් plugins: ['expo-router/babel'] වගේ ඒවා තියෙන්න බෑ!
  };
};