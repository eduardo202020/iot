const {
  createRunOncePlugin,
  withAndroidManifest,
  withAppBuildGradle,
} = require("@expo/config-plugins");

const PLUGIN_NAME = "with-museiq-android-variants";
const DEFAULT_MARKER = "// @museiq-android-variants-default";
const DEBUG_MARKER = "// @museiq-android-variants-debug";

function insertAfterBlockStart(contents, blockName, snippet, marker) {
  if (contents.includes(marker)) {
    return contents;
  }

  const blockStart = contents.indexOf(`${blockName} {`);
  if (blockStart < 0) {
    throw new Error(`[${PLUGIN_NAME}] No se encontro el bloque ${blockName}.`);
  }

  const lineEnd = contents.indexOf("\n", blockStart);
  return `${contents.slice(0, lineEnd + 1)}${snippet}${contents.slice(lineEnd + 1)}`;
}

function withMuseIQAndroidVariants(config) {
  config = withAndroidManifest(config, (modConfig) => {
    const application = modConfig.modResults.manifest.application?.[0];
    const activities = application?.activity ?? [];

    for (const activity of activities) {
      for (const intentFilter of activity["intent-filter"] ?? []) {
        for (const data of intentFilter.data ?? []) {
          const scheme = data.$?.["android:scheme"];

          if (scheme === "museiq" || scheme === "${museiqAppScheme}") {
            data.$["android:scheme"] = "${museiqAppScheme}";
          }

          if (scheme === "exp+museiq" || scheme === "${museiqExpoScheme}") {
            data.$["android:scheme"] = "${museiqExpoScheme}";
          }
        }
      }
    }

    return modConfig;
  });

  return withAppBuildGradle(config, (modConfig) => {
    let contents = modConfig.modResults.contents;

    // Expo already assigns the development application ID. Remove the legacy
    // Gradle suffix so it is not duplicated as ".dev.dev".
    contents = contents.replace(/^\s*applicationIdSuffix "\.dev"\s*\n/m, "");

    contents = insertAfterBlockStart(
      contents,
      "defaultConfig",
      `        ${DEFAULT_MARKER}\n        manifestPlaceholders = [\n            museiqAppScheme: "museiq",\n            museiqExpoScheme: "exp+museiq"\n        ]\n`,
      DEFAULT_MARKER,
    );

    const buildTypesStart = contents.indexOf("buildTypes {");
    const debugStart = contents.indexOf("debug {", buildTypesStart);
    if (debugStart < 0) {
      throw new Error(`[${PLUGIN_NAME}] No se encontro el build type debug.`);
    }

    if (!contents.includes(DEBUG_MARKER)) {
      const debugLineEnd = contents.indexOf("\n", debugStart);
      const debugSnippet = `            ${DEBUG_MARKER}\n            versionNameSuffix "-dev"\n            resValue "string", "app_name", "MuseIQ Dev"\n            manifestPlaceholders = [\n                museiqAppScheme: "museiq-dev",\n                museiqExpoScheme: "exp+museiq-dev"\n            ]\n`;
      contents = `${contents.slice(0, debugLineEnd + 1)}${debugSnippet}${contents.slice(debugLineEnd + 1)}`;
    }

    modConfig.modResults.contents = contents;
    return modConfig;
  });
}

module.exports = createRunOncePlugin(withMuseIQAndroidVariants, PLUGIN_NAME, "1.0.1");
