const path = require("path");
const nodeExternals = require('webpack-node-externals');

const mode = process.env.NODE_ENV || "production";

module.exports = {
  entry: "./src/main.ts",
  mode,
  target: "node",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
        exclude: [/node_modules/]
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
