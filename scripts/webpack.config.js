module.exports = {
  entry: "./loadworker.js",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "fts_sqlite3_bundle.js",
  },
  devServer: {
    publicPath: "/dist",
  },
  devtool: "source-map"
};