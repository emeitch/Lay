module.exports = {
  entry: "./src/app.js",
  devtool: "inline-source-map",
  output: {
    filename: "bundle.js",
    path: __dirname + "/build"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: /src\//,
        loader: 'babel-loader',
      }
    ]
  },
  optimization: {
    minimize: false, // for constructor name keeping
  },
};
