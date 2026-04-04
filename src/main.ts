import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './router/guard'
import { permDirective } from './directives/permission'
import '@/assets/iconfont/iconfont.css'
import '@/styles/theme.css'
import '@/styles/common.css'
import '@/styles/auth.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 全局注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.directive('perm', permDirective)
app.mount('#app')
