const {defineConfig} = require('@vue/cli-service')
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const port = process.env.port || process.env.npm_config_port || 80

module.exports = defineConfig({
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false,
  lintOnSave: false,

  devServer: {
    host: '0.0.0.0',
    port,
    open: true,
    proxy: {
      [process.env.VUE_APP_BASE_PRE]: {
        target: process.env.VUE_APP_BASE_API,
        changeOrigin: true,
        pathRewrite: {['^' + process.env.VUE_APP_BASE_PRE]: ''}
      }
    },
    allowedHosts: 'all'
  },

  configureWebpack: {
    resolve: {
      alias: {'@': resolve('src')}
    }
  }
})
