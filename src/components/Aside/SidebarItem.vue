<template>
  <div v-if="!item.hidden">
    <el-menu-item
      v-if="!item.children || item.children.length === 0"
      :index="resolvePath(item.path)"
      :class="{'submenu-title-noDropdown':!isNest}"
      :title="item.meta && item.meta.title">
      <i v-if="item.meta && item.meta.icon" :class="item.meta.icon" class="menu-icon iconfont"></i>
      <!-- 仅在展开侧栏 或 处于折叠子菜单弹窗内 时才提供 #title 插槽。
           Element Plus 的 el-menu-item 仅在 slots.title 存在时才会给折叠态根级 item
           包一个 el-tooltip 弹出标题——不提供这个插槽就不会弹。 -->
      <template v-if="!collapse || isNest" #title>
        <span>{{ item.meta && item.meta.title }}</span>
      </template>
    </el-menu-item>

    <template v-else-if="collapse && isNest && item.children && item.children.length">
      <el-menu-item
        v-for="node in flattenChildren(item.children)"
        :key="node.path"
        :index="resolvePath(node.path)"
        :title="node.meta && node.meta.title">
        <i v-if="node.meta && node.meta.icon" :class="node.meta.icon" class="menu-icon iconfont"></i>
        <template #title>
          <span>{{ node.meta && node.meta.title }}</span>
        </template>
      </el-menu-item>
    </template>

    <el-sub-menu
      v-else
      :index="resolvePath(item.path)"
      :popper-class="collapse ? 'sidebar-submenu-popper' : ''">
      <template #title>
        <i v-if="item.meta && item.meta.icon" :class="item.meta.icon" class="menu-icon iconfont"></i>
        <span v-if="!collapse || isNest">{{ item.meta && item.meta.title }}</span>
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
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SidebarItem' })

interface MenuItem {
  path: string
  name?: string | symbol
  hidden?: boolean
  meta?: { title?: string; icon?: string }
  children?: MenuItem[]
}

const props = withDefaults(defineProps<{
  item: MenuItem
  isNest?: boolean
  basePath?: string
  collapse?: boolean
}>(), {
  isNest: false,
  basePath: '',
  collapse: false
})

function flattenChildren(children: MenuItem[] = []): MenuItem[] {
  const list: MenuItem[] = []
  children.forEach(child => {
    if (child.children && child.children.length) {
      list.push(...flattenChildren(child.children))
    } else {
      list.push(child)
    }
  })
  return list
}

function resolvePath(routePath: string): string {
  if (routePath && /^(https?:|mailto:|tel:)/.test(routePath)) return routePath
  if (!routePath) return props.basePath || '/'
  if (routePath.startsWith('/')) {
    return routePath.length > 1 ? routePath.replace(/\/+$/, '') : routePath
  }
  const basePath = props.basePath.replace(/\/+$/, '')
  const path = routePath.replace(/^\/+/, '')
  const fullPath = basePath ? `${basePath}/${path}` : `/${path}`
  return fullPath.length > 1 ? fullPath.replace(/\/+$/, '') : fullPath
}
</script>
