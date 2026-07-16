const isDevelopmentVariant = process.env.APP_VARIANT === "development";

module.exports = ({ config }) => {
  const appName = isDevelopmentVariant ? "MuseIQ Dev" : config.name;
  const appScheme = isDevelopmentVariant ? "museiq-dev" : config.scheme;
  const androidPackage = isDevelopmentVariant
    ? "com.jguevaral.museiq.dev"
    : config.android?.package;
  const iosBundleIdentifier = isDevelopmentVariant
    ? "com.jguevaral.museiq.dev"
    : config.ios?.bundleIdentifier;

  return {
    ...config,
    name: appName,
    scheme: appScheme,
    android: {
      ...config.android,
      package: androidPackage,
    },
    ios: {
      ...config.ios,
      bundleIdentifier: iosBundleIdentifier,
    },
    plugins: [...(config.plugins ?? []), "./plugins/with-museiq-android-variants"],
    extra: {
      ...config.extra,
      appVariant: isDevelopmentVariant ? "development" : "production",
      museRagMode: process.env.EXPO_PUBLIC_MUSERAG_MODE ?? "local",
      museRagUrl: process.env.EXPO_PUBLIC_MUSERAG_URL ?? "",
      museIqBleSimUrl: process.env.EXPO_PUBLIC_MUSEIQ_BLE_SIM_URL ?? "",
    },
  };
};
