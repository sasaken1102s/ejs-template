const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',

  entry: {
    app: './src/js/app.js'
  },

  output: {
    filename: '[name].bundle.min.js'
  },

  module: {
    rules: [
      {
        // 拡張子 .js の場合
        test: /\.js$/,
        use: [
          {
            // Babel を利用する
            loader: 'babel-loader',
            // Babel のオプションを指定する
            options: {
              presets: [
                // env を指定することで、ES2017 を ES5 に変換。
                // {modules: false}にしないと import 文が Babel によって CommonJS に変換され、
                // webpack の Tree Shaking 機能が使えない
                "@babel/preset-env"
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.optimize.AggressiveMergingPlugin()
  ],

  devtool: 'source-map'
};