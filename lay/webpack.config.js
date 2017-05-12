module.exports = {
  entry: "./src/app.js",
  output: {
    filename: "bundle.js",
    path: __dirname + "/build"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: /src\//,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
        }
      }
    ]
  }}
