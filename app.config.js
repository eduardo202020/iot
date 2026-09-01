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
      museRagMode: process.env.EXPO_PUBLIC_MUSERAG_MODE ?? "remote",
      museRagUrl: process.env.EXPO_PUBLIC_MUSERAG_URL ?? "",
      museRagUseAdbReverse:
        process.env.EXPO_PUBLIC_MUSERAG_USE_ADB_REVERSE === "1",
      museRagAllowLocalFallback:
        process.env.EXPO_PUBLIC_MUSERAG_ALLOW_LOCAL_FALLBACK !== "0",
      museRagRemoteTts:
        process.env.EXPO_PUBLIC_MUSERAG_REMOTE_TTS !== "0",
      museIqHarnessMode:
        process.env.EXPO_PUBLIC_MUSEIQ_HARNESS_MODE === "1",
      museIqBleSimUrl: process.env.EXPO_PUBLIC_MUSEIQ_BLE_SIM_URL ?? "",
    },
  };
};
