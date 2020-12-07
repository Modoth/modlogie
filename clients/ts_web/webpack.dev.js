const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    host: '0.0.0.0',
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        pathRewrite: { '^/api': '' }
      },
      '/s': {
        target: 'http://localhost:8080'
      }
    },
    contentBase: path.resolve('../..', 'dist'),
    port: 9080
  }
})
