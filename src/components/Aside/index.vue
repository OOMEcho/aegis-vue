<template>
  <el-menu
    :default-active="activeMenu"
    class="el-menu-vertical-demo"
    background-color="#1f2d3d"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    @open="handleOpen"
    @close="handleClose"
    :collapse="isCollapse"
    :unique-opened="true"
    router>

    <!-- 递归渲染菜单 -->
    <sidebar-item
      v-for="route in routes"
      :key="route.path"
      :item="route"
      :base-path="route.path"/>
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
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath)
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
