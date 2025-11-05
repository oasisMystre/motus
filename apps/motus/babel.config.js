module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      "nativewind/babel",
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      "babel-plugin-transform-import-meta",
      [
        "babel-plugin-module-resolver",
        {
          alias: {
            "@motus/server": "../../server/src/external.ts",
          },
        },
      ],
    ],
  };
};
