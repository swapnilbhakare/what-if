const path = require("path");
const fs = require("fs");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Visualizer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const ExtraWatchWebpackPlugin = require("extra-watch-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const PowerBICustomVisualsWebpackPlugin = require("powerbi-visuals-webpack-plugin");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
const powerbiApi = require("powerbi-visuals-api");
const config = require("./config.json");

const pbivizPath = "./pbiviz.json";
const pbivizFile = require(path.join(__dirname, pbivizPath));
const capabilitiesPath = "./capabilities.json";
const capabilitiesFile = require(path.join(__dirname, capabilitiesPath));
const pluginLocation = "./.tmp/precompile/visualPlugin.ts";

const resourcesFolder = path.join(".", "stringResources");
const localizationFolders =
  fs.existsSync(resourcesFolder) && fs.readdirSync(resourcesFolder);
const statsLocation = "../../webpack.statistics.html";

let babelOptions = {
  presets: [
    require.resolve("@babel/preset-react"),
    [
      require.resolve("@babel/preset-env"),
      {
        targets: {
          ie: "11",
        },
        useBuiltIns: "entry",
        corejs: 3,
        modules: false,
      },
    ],
  ],
  sourceType: "unambiguous",
  cacheDirectory: path.join(".tmp", "babelCache"),
};

module.exports = {
  entry: {
    "visual.js": pluginLocation,
  },
  output: {
    path: path.join(__dirname, "/.tmp", "drop"),
    publicPath: "assets",
    filename: "[name]",
    library:
      +powerbiApi.version.replace(/\./g, "") >= 320
        ? pbivizFile.visual.guid
        : undefined,
    libraryTarget:
      +powerbiApi.version.replace(/\./g, "") >= 320 ? "var" : undefined,
  },
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  devtool: process.env.NODE_ENV === "production" ? false : "source-map",
  optimization: {
    concatenateModules: true,
    minimize: process.env.NODE_ENV === "production",
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true,
            defaults: false, // Disable default compress options
          },
          mangle: true, // Disable variable mangling for faster builds
        },
      }),
    ],
    splitChunks: {
      chunks: "all",
      minSize: 20000, // Adjust as needed
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: "~",
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        include: path.join(__dirname),
        use: [
          {
            loader: require.resolve("cache-loader"),
            options: {
              cacheDirectory: path.resolve(
                __dirname,
                ".tmp",
                "cache-loader-ts"
              ),
            },
          },
          {
            loader: require.resolve("thread-loader"),
            options: {
              workers: require("os").cpus().length - 1,
            },
          },
          {
            loader: require.resolve("babel-loader"),
            options: babelOptions,
          },
          {
            loader: require.resolve("ts-loader"),
            options: {
              transpileOnly: true,
              happyPackMode: true,
              skipLibCheck: true,
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("cache-loader"),
            options: {
              cacheDirectory: path.resolve(
                __dirname,
                ".tmp",
                "cache-loader-js"
              ),
            },
          },
          {
            loader: require.resolve("thread-loader"),
            options: {
              workers: require("os").cpus().length - 1,
            },
          },
          {
            loader: require.resolve("babel-loader"),
            options: babelOptions,
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      process: require.resolve("process/browser"),
      buffer: require.resolve("buffer"),
    },
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "visual.css",
      chunkFilename: "[id].css",
    }),
    new Visualizer({
      reportFilename: statsLocation,
      openAnalyzer: false,
      analyzerMode: "static",
    }),
    new ForkTsCheckerWebpackPlugin({
      async: false, // Ensures that Webpack will wait for the type-checking results.
      workers: require("os").cpus().length - 1,
    }),
    new PowerBICustomVisualsWebpackPlugin({
      ...pbivizFile,
      capabilities: capabilitiesFile,
      stringResources:
        localizationFolders &&
        localizationFolders.map((localization) =>
          path.join(resourcesFolder, localization, "resources.resjson")
        ),
      apiVersion: powerbiApi.version,
      capabilitiesSchema: powerbiApi.schemas.capabilities,
      pbivizSchema: powerbiApi.schemas.pbiviz,
      stringResourcesSchema: powerbiApi.schemas.stringResources,
      dependenciesSchema: powerbiApi.schemas.dependencies,
      devMode: false,
      generatePbiviz: true,
      generateResources: true,
      modules: true,
      visualSourceLocation: "../../src/visual",
      pluginLocation: pluginLocation,
      packageOutPath: path.join(__dirname, "dist"),
    }),
    new ExtraWatchWebpackPlugin({
      files: [pbivizPath, capabilitiesPath],
    }),
    powerbiApi.version.replace(/\./g, "") >= 320
      ? new webpack.ProvidePlugin({
          define: "fakeDefine",
        })
      : new webpack.ProvidePlugin({
          window: "realWindow",
          define: "fakeDefine",
          powerbi: "corePowerbiObject",
        }),
    new HardSourceWebpackPlugin(), // Enables aggressive caching
  ],
  devServer: {
    static: path.join(__dirname, ".tmp", "drop"),
    port: 8080,
    hot: true,
    https: true,
    headers: {
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=0",
    },
  },
  externals:
    powerbiApi.version.replace(/\./g, "") >= 320
      ? {
          "powerbi-visuals-api": "null",
          fakeDefine: "false",
        }
      : {
          "powerbi-visuals-api": "null",
          fakeDefine: "false",
          corePowerbiObject: "Function('return this.powerbi')()",
          realWindow: "Function('return this')()",
        },
};
