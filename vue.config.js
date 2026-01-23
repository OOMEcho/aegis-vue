const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = process.env.VUE_APP_TITLE || 'aegis'
const port = process.env.port || process.env.npm_config_port || 80

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false,
  transpileDependencies: ['quill'],
  lintOnSave: false,

  devServer: {
    host: '0.0.0.0',
    port,
    open: true,
    proxy: {
      [process.env.VUE_APP_BASE_PRE]: {
        target: process.env.VUE_APP_BASE_API,
        changeOrigin: true,
        pathRewrite: { ['^' + process.env.VUE_APP_BASE_PRE]: '' }
      }
    },
    allowedHosts: 'all'
  },

  css: {
    loaderOptions: {
      sass: {
        sassOptions: { outputStyle: 'expanded' }
      }
    }
  },

  configureWebpack: {
    name,
    resolve: {
      alias: { '@': resolve('src') }
    },
    plugins: [
      new CompressionPlugin({
        cache: false,
        test: /\.(js|css|html|jpe?g|png|gif|svg)?$/i,
        filename: '[path][base].gz[query]',
        algorithm: 'gzip',
        minRatio: 0.8,
        deleteOriginalAssets: false
      })
    ]
  },

  chainWebpack(config) {
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')

    config.when(process.env.NODE_ENV !== 'development', config => {
      config
        .plugin('ScriptExtHtmlWebpackPlugin')
        .after('html')
        .use('script-ext-html-webpack-plugin', [
          { inline: /runtime\..*\.js$/ }
        ])
        .end()

      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          elementUI: {
            name: 'chunk-elementUI',
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/,
            priority: 20
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'),
            minChunks: 3,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      })
      config.optimization.runtimeChunk('single')
    })
  }
})
