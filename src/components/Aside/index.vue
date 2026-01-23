<template>
  <el-menu
    :default-active="activeMenu"
    class="el-menu-vertical-demo"
    background-color="#f5f7ff"
    text-color="#3b4a66"
    active-text-color="#4f70ff"
    :collapse="isCollapse"
    :unique-opened="true"
    router>

    <!-- 递归渲染菜单 -->
    <sidebar-item
      v-for="route in routes"
      :key="route.path"
      :item="route"/>
  </el-menu>
</template>

<script>
import SidebarItem from './SidebarItem.vue'

export default {
  name: 'AsideComponent',
  components: {SidebarItem},
  props: {
    collapse: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isCollapse() {
      return this.collapse
    },
    routes() {
      return this.$store.state.permission.routes
    },
    activeMenu() {
      const route = this.$route
      const {meta, path} = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    }
  }
}
</script>

<style scoped>
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
  }
</style>
