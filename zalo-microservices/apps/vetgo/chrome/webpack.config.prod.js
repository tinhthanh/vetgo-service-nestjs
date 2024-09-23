const { join } = require('path');
const { optimize } = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: join(__dirname, 'src/background.ts'),
    controller: join(__dirname, 'src/controller.ts'),
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: join(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new optimize.AggressiveMergingPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: join(__dirname, 'manifest.json'),
          to: join(__dirname, 'dist')
        },
        {
          from: join(__dirname, 'assets'),
          to: join(__dirname, 'dist/assets')
        }
      ]
    })],
  resolve: {
    extensions: ['.ts', '.js']
  }
};
