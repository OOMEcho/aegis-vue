import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [vue()],
    resolve: { alias: { '@': resolve(__dirname, 'src') } },
    server: {
      host: '0.0.0.0',
      port: 9090,
      open: true,
      proxy: {
        [env.VITE_BASE_PRE]: {
          target: env.VITE_BASE_API,
          changeOrigin: true,
          rewrite: (p: string) => p.replace(new RegExp('^' + env.VITE_BASE_PRE), '')
        }
      }
    },
    build: { outDir: 'dist', assetsDir: 'static', sourcemap: false }
  }
})
