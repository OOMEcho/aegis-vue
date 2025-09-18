const {defineConfig} = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_BASE_API,
        pathRewrite: {
          '^/api': '',
        }
      }
    }
  }
})
