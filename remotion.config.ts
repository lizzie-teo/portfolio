import {Config} from "@remotion/cli/config";

Config.setShouldOpenBrowser(false);
Config.setStudioPort(3001);
Config.setRendererPort(3002);
Config.setWebpackPollingInMilliseconds(1000);

Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    experiments: {
      ...config.experiments,
      lazyCompilation: false,
    },
    watchOptions: {
      ...config.watchOptions,
      ignored: [
        ...(Array.isArray(config.watchOptions?.ignored) ? config.watchOptions.ignored : []),
        "**/.next/**",
        "**/out/**",
        "**/artefacts/**",
        "**/.work/**",
      ],
    },
  };
});
