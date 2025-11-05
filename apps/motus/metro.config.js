const path = require("path");
const { withNativeWind } = require("nativewind/metro");

const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

const { resolver, transformer } = config;

const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  if (["isows", "zustand"].includes(moduleName)) {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  if (["jose"].includes(moduleName)) {
    const ctx = {
      ...context,
      unstable_conditionNames: ["browser"],
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.resolveRequest = resolveRequestWithPackageExports;

resolver.unstable_allowRequireContext = true;
resolver.unstable_enablePackageExports = true;
resolver.sourceExts = [...resolver.sourceExts, "cjs", "svg"];
resolver.assetExts = resolver.assetExts.filter((ext) => ext !== "svg");
resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "../../node_modules"),
];

transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer/expo",
);

config.watchFolders = [
  path.resolve(__dirname, "../../server"),
  path.resolve(__dirname, "../../packages"),
];

module.exports = withNativeWind(config, { input: "./src/global.css" });
