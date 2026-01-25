<template>
  <div v-if="!item.hidden">
    <el-menu-item
      v-if="!item.children || item.children.length === 0"
      :index="resolvePath(item.path)"
      :class="{'submenu-title-noDropdown':!isNest}"
      :title="item.meta && item.meta.title">
      <i v-if="item.meta && item.meta.icon" :class="item.meta.icon" class="menu-icon iconfont"></i>
      <span v-if="!collapse || isNest" slot="title">{{ item.meta.title }}</span>
    </el-menu-item>

    <template v-else-if="collapse && isNest && item.children && item.children.length">
      <el-menu-item
        v-for="node in flattenChildren(item.children)"
        :key="node.path"
        :index="resolvePath(node.path)"
        :title="node.meta && node.meta.title">
        <i v-if="node.meta && node.meta.icon" :class="node.meta.icon" class="menu-icon iconfont"></i>
        <span>{{ node.meta.title }}</span>
      </el-menu-item>
    </template>

    <el-submenu
      v-else
      ref="subMenu"
      :index="resolvePath(item.path)"
      :popper-class="collapse ? 'sidebar-submenu-popper' : ''">
      <template slot="title">
        <i v-if="item.meta && item.meta.icon" :class="item.meta.icon" class="menu-icon iconfont"></i>
        <span v-if="!collapse || isNest">{{ item.meta.title }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(item.path)"
        :collapse="collapse"
        class="nest-menu"
      />
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
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    },
    collapse: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    flattenChildren(children = []) {
      const list = []
      children.forEach(child => {
        if (child.children && child.children.length) {
          list.push(...this.flattenChildren(child.children))
        } else {
          list.push(child)
        }
      })
      return list
    },
    resolvePath(routePath) {
      if (routePath && /^(https?:|mailto:|tel:)/.test(routePath)) {
        return routePath
      }
      if (!routePath) {
        return this.basePath || '/'
      }
      if (routePath && routePath.startsWith('/')) {
        return routePath.length > 1 ? routePath.replace(/\/+$/, '') : routePath
      }

      const basePath = this.basePath.replace(/\/+$/, '')
      const path = routePath ? routePath.replace(/^\/+/, '') : ''
      const fullPath = basePath ? `${basePath}/${path}` : `/${path}`
      return fullPath.length > 1 ? fullPath.replace(/\/+$/, '') : fullPath
    }
  }
}
</script>
