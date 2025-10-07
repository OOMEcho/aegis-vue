<template>
  <div v-if="!item.hidden">
    <!-- 只有一个子菜单且需要显示 -->
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <el-menu-item :request="resolvePath(onlyOneChild.path)">
        <i :class="onlyOneChild.meta.icon || item.meta.icon"></i>
        <span>{{ onlyOneChild.meta.title }}</span>
      </el-menu-item>
    </template>

    <!-- 多个子菜单 -->
    <el-submenu v-else :request="resolvePath(item.path)">
      <template #title>
        <i :class="item.meta.icon"></i>
        <span>{{ item.meta.title }}</span>
      </template>

      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)" />
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
    basePath: {
      type: String,
      default: ''
    }
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
        this.onlyOneChild = { ...parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath(routePath) {
      // 处理外部链接
      if (this.isExternalLink(routePath)) {
        return routePath
      }
      if (this.isExternalLink(this.basePath)) {
        return this.basePath
      }

      // 如果是绝对路径，直接返回
      if (routePath.startsWith('/')) {
        return routePath
      }

      // 拼接路径
      return this.joinPath(this.basePath, routePath)
    },
    joinPath(base, path) {
      // 移除 base 结尾的斜杠
      base = base.replace(/\/$/, '')
      // 移除 path 开头的斜杠
      path = path.replace(/^\//, '')
      // 拼接
      return base ? `${base}/${path}` : `/${path}`
    },
    isExternalLink(path) {
      return /^(https?:|mailto:|tel:)/.test(path)
    }
  }
}
</script>
