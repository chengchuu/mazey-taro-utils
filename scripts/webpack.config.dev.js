"use strict";

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("node:path");
const webpack = require("webpack");
const projectConfig = require("../project.config");

const resolveProject = (...parts) => path.resolve(__dirname, "..", ...parts);
const production = process.env.GITHUB_PAGES === "true";
const pagesBase = production ? projectConfig.site.basePath : "/";
const pwaEnabled = production || process.env.PWA_ENABLED === "true";
const siteImageEntries = [
  projectConfig.assets.faviconFile,
  projectConfig.assets.logoFile,
  projectConfig.seo.openGraphImage.file,
].map((file) => resolveProject("images", file));
const { pages, theme } = projectConfig.site;
const templateParameters = {
  API_URL: pages.api.url,
  DISPLAY_NAME: projectConfig.brand.displayName,
  FAVICON_URL: `${pagesBase}images/${projectConfig.assets.faviconFile}`,
  GITHUB_URL: projectConfig.urls.github,
  INSTALL_COMMAND: projectConfig.package.installCommand,
  LICENSE_URL: projectConfig.urls.license,
  LOGO_URL: `${pagesBase}images/${projectConfig.assets.logoFile}`,
  MANIFEST_URL: pwaEnabled ? projectConfig.pwa.manifestUrl : null,
  NPM_URL: projectConfig.urls.npm,
  OPEN_GRAPH_IMAGE_ALT: projectConfig.seo.openGraphImage.alt,
  OPEN_GRAPH_IMAGE_HEIGHT: projectConfig.seo.openGraphImage.height,
  OPEN_GRAPH_IMAGE_TYPE: projectConfig.seo.openGraphImage.type,
  OPEN_GRAPH_IMAGE_URL: projectConfig.seo.openGraphImage.url,
  OPEN_GRAPH_IMAGE_WIDTH: projectConfig.seo.openGraphImage.width,
  PACKAGE_NAME: projectConfig.package.name,
  PLAYGROUND_DESCRIPTION: pages.playground.description,
  PLAYGROUND_JSON_LD: JSON.stringify(projectConfig.seo.playgroundJsonLd),
  PLAYGROUND_TITLE: pages.playground.title,
  PLAYGROUND_URL: pages.playground.url,
  ROOT_DESCRIPTION: pages.home.description,
  ROOT_JSON_LD: JSON.stringify(projectConfig.seo.rootJsonLd),
  ROOT_TITLE: pages.home.title,
  SITEMAP_URL: projectConfig.urls.sitemap,
  SITE_URL: projectConfig.site.url,
  THEME_COLOR_DARK: theme.colorDark,
  THEME_COLOR_LIGHT: theme.colorLight,
  THEME_COLOR_PRIMARY: theme.colorPrimary,
  THEME_PRIMARY_ACTIVE: theme.primary.light.active,
  THEME_PRIMARY_DARK: theme.primary.dark.base,
  THEME_PRIMARY_DARK_ACTIVE: theme.primary.dark.active,
  THEME_PRIMARY_DARK_HOVER: theme.primary.dark.hover,
  THEME_PRIMARY_DARK_HOVER_RGB: theme.primary.dark.hoverRgb,
  THEME_PRIMARY_DARK_RGB: theme.primary.dark.rgb,
  THEME_PRIMARY_DARK_SOFT: theme.primary.dark.soft,
  THEME_PRIMARY_HOVER: theme.primary.light.hover,
  THEME_PRIMARY_HOVER_RGB: theme.primary.light.hoverRgb,
  THEME_PRIMARY_RGB: theme.primary.light.rgb,
  THEME_PRIMARY_SOFT: theme.primary.light.soft,
};
const runtimeConfig = {
  installCommand: projectConfig.package.installCommand,
  packageName: projectConfig.package.name,
  themeStorageKey: theme.storageKey,
  pwa: {
    appName: projectConfig.pwa.name,
    enabled: pwaEnabled,
    scope: projectConfig.site.basePath,
    serviceWorkerUrl: projectConfig.pwa.serviceWorkerUrl,
  },
};

module.exports = {
  mode: production ? "production" : "development",
  target: ["web", "es2018"],
  devtool: production ? "source-map" : "eval-cheap-module-source-map",
  entry: {
    shared: [resolveProject("site/shared.ts"), ...siteImageEntries],
    home: {
      import: resolveProject("site/index.ts"),
      dependOn: "shared",
    },
    playground: {
      import: resolveProject("examples/index.tsx"),
      dependOn: "shared",
    },
    api: resolveProject("site/api.ts"),
  },
  output: {
    clean: true,
    filename: "assets/[name].js",
    path: resolveProject("dist-dev"),
    publicPath: pagesBase,
  },
  devServer: {
    host: "127.0.0.1",
    port: 8080,
    static: { directory: resolveProject("dist-dev") },
    historyApiFallback: {
      rewrites: [{ from: /^\/playground\/?$/, to: "/playground/index.html" }],
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: { configFile: resolveProject("tsconfig.site.json") },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.png$/i,
        type: "asset/resource",
        generator: { filename: "images/[name][ext]" },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __SITE_RUNTIME_CONFIG__: JSON.stringify(runtimeConfig),
      "process.env.TARO_ENV": JSON.stringify("h5"),
    }),
    new MiniCssExtractPlugin({
      filename: "assets/[name].css",
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: resolveProject("site/index.html"),
      chunks: ["shared", "home"],
      inject: "body",
      templateParameters,
    }),
    new HtmlWebpackPlugin({
      filename: "playground/index.html",
      template: resolveProject("examples/index.html"),
      chunks: ["shared", "playground"],
      inject: "body",
      templateParameters,
    }),
  ],
  resolve: {
    alias: {
      "@tarojs/taro": resolveProject("examples/taro-browser-shim.ts"),
    },
    extensions: [".tsx", ".ts", ".js"],
  },
  performance: {
    maxAssetSize: 300000,
    maxEntrypointSize: 300000,
  },
};
