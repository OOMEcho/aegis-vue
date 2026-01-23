<template>
  <div v-if="!item.hidden">
    <!-- 只有一个子菜单且需要显示 -->
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <el-menu-item :index="resolvePath(onlyOneChild.path)">
        <i v-if="(onlyOneChild.meta && onlyOneChild.meta.icon) || (item.meta && item.meta.icon)" :class="onlyOneChild.meta.icon || item.meta.icon" class="menu-icon iconfont"></i>
        <span>{{ onlyOneChild.meta.title }}</span>
      </el-menu-item>
    </template>

    <!-- 多个子菜单 -->
    <el-submenu v-else :index="resolvePath(item.path)">
      <template #title>
        <i v-if="item.meta && item.meta.icon" :class="item.meta.icon" class="menu-icon iconfont"></i>
        <span>{{ item.meta.title }}</span>
      </template>

      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child" />
    </el-submenu>
  </div>
</template>

<script>
export default {
  name: 'SidebarItem',
  props: {
    item: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      onlyOneChild: null
    }
  },
  methods: {
    hasOneShowingChild(children = [], parent) {
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          this.onlyOneChild = item
          return true
        }
      })

      if (showingChildren.length === 1) {
        return true
      }

      if (showingChildren.length === 0) {
        this.onlyOneChild = { ...parent, path: parent.path, noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath(routePath) {
      // 处理外部链接
      if (this.isExternalLink(routePath)) {
        return routePath
      }
      return routePath || '/'
    },
    isExternalLink(path) {
      return /^(https?:|mailto:|tel:)/.test(path)
    }
  }
}
</script>
