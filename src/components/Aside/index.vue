<template>
  <el-menu
    :default-active="activeMenu"
    class="el-menu-vertical-demo"
    background-color="#1b2430"
    text-color="#d7e1f2"
    active-text-color="#ffffff"
    :collapse="props.collapse"
    :collapse-transition="false"
    :unique-opened="true"
    router>
    <sidebar-item
      v-for="route in routes"
      :key="route.path"
      :item="route"
      :base-path="route.path"
      :collapse="props.collapse"/>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'
import SidebarItem from './SidebarItem.vue'

defineOptions({ name: 'AsideComponent' })

const props = withDefaults(defineProps<{ collapse?: boolean }>(), { collapse: false })

const route = useRoute()
const permissionStore = usePermissionStore()

const routes = computed(() => permissionStore.routes)

const activeMenu = computed(() => {
  const meta = route.meta as Record<string, unknown>
  if (meta.activeMenu) return meta.activeMenu as string
  return route.path
})
</script>

<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 100%;
  min-height: 400px;
}
.el-menu-vertical-demo { width: 100%; }
:deep(.el-menu) { scrollbar-width: none !important; overflow-x: hidden !important; }
:deep(.el-menu::-webkit-scrollbar) { width: 0 !important; height: 0 !important; display: none !important; }
:deep(.el-scrollbar__bar) { display: none !important; }
:deep(.el-scrollbar__wrap) { overflow-x: hidden !important; }
:deep(.el-menu::after),
:deep(.el-menu--collapse::after),
:deep(.el-menu--vertical::after) { display: none !important; content: none !important; }
:deep(.el-sub-menu .el-menu) { border-right: none !important; }
:deep(.menu-icon) { margin-right: 10px; font-size: 16px; color: inherit; vertical-align: middle; }
:deep(.el-menu--collapse .menu-icon) { margin-right: 0; }
:deep(.el-menu-vertical-demo .el-menu-item),
:deep(.el-menu-vertical-demo .el-sub-menu__title) {
  height: 44px;
  line-height: 44px;
  padding-left: 20px !important;
}
:deep(.el-menu-vertical-demo .el-sub-menu .el-menu-item) {
  padding-left: 40px !important;
  min-width: auto;
}
:deep(.el-menu--collapse > .el-sub-menu > .el-sub-menu__title) {
  padding-left: 20px !important;
  padding-right: 20px !important;
}
:deep(.el-menu--collapse .el-sub-menu__icon-arrow),
:deep(.el-menu--collapse .el-sub-menu__title .el-sub-menu__icon-arrow),
:deep(.el-menu--collapse .el-sub-menu__title [class*="el-icon-arrow"]) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  opacity: 0 !important;
}
:deep(.el-menu--collapse .el-sub-menu__icon-arrow.el-icon-arrow-right) {
  display: none !important;
}
</style>
