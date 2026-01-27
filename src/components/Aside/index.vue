<template>
  <el-menu
    :default-active="activeMenu"
    class="el-menu-vertical-demo"
    background-color="#1b2430"
    text-color="#d7e1f2"
    active-text-color="#ffffff"
    :collapse="isCollapse"
    :collapse-transition="false"
    :unique-opened="true"
    router>

    <!-- 递归渲染菜单 -->
    <sidebar-item
      v-for="route in routes"
      :key="route.path"
      :item="route"
      :base-path="route.path"
      :collapse="isCollapse"/>
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
  width: 100%;
  min-height: 400px;
}

.el-menu-vertical-demo {
  width: 100%;
}

::v-deep .el-menu {
  scrollbar-width: none !important;
  overflow-x: hidden !important;
}

::v-deep .el-menu::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
}

::v-deep .el-scrollbar__bar {
  display: none !important;
}

::v-deep .el-scrollbar__wrap {
  overflow-x: hidden !important;
}

::v-deep .el-menu::after,
::v-deep .el-menu--collapse::after,
::v-deep .el-menu--vertical::after {
  display: none !important;
  content: none !important;
}

::v-deep .el-submenu .el-menu {
  border-right: none !important;
}

::v-deep .menu-icon {
  margin-right: 10px;
  font-size: 16px;
  color: inherit;
  vertical-align: middle;
}

::v-deep .el-menu--collapse .menu-icon {
  margin-right: 0;
}

::v-deep .el-menu-vertical-demo .el-menu-item,
::v-deep .el-menu-vertical-demo .el-submenu__title {
  height: 44px;
  line-height: 44px;
  padding-left: 20px !important;
}

::v-deep .el-menu-vertical-demo .el-submenu .el-menu-item {
  padding-left: 40px !important;
  min-width: auto;
}

/*
 * 修正折叠后的样式
 * 确保 popup 样式正确
 */
::v-deep .el-menu--collapse > .el-submenu > .el-submenu__title {
  padding-left: 20px !important;
  padding-right: 20px !important;
}

/* 隐藏折叠状态下的箭头 */
::v-deep .el-menu--collapse .el-submenu__icon-arrow,
::v-deep .el-menu--collapse .el-submenu__title .el-submenu__icon-arrow,
::v-deep .el-menu--collapse .el-submenu__title [class*="el-icon-arrow"] {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  opacity: 0 !important;
}

::v-deep .el-menu--collapse .el-submenu__icon-arrow.el-icon-arrow-right {
  display: none !important;
}
</style>
