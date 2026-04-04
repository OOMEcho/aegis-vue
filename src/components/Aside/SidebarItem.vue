<template>
  <div v-if="!item.hidden">
    <el-menu-item
      v-if="!item.children || item.children.length === 0"
      :index="resolvePath(item.path)"
      :class="{'submenu-title-noDropdown':!isNest}">
      <i v-if="itemIcon" :class="itemIcon" class="menu-icon iconfont"></i>
      <template #title>
        <span v-if="!collapse || isNest">{{ itemTitle }}</span>
      </template>
    </el-menu-item>

    <template v-else-if="collapse && isNest && item.children && item.children.length">
      <el-menu-item
        v-for="node in flattenChildren(item.children)"
        :key="node.path"
        :index="resolvePath(node.path)">
        <i v-if="getIcon(node)" :class="getIcon(node)" class="menu-icon iconfont"></i>
        <template #title><span>{{ getTitle(node) }}</span></template>
      </el-menu-item>
    </template>

    <el-sub-menu
      v-else
      :index="resolvePath(item.path)"
      :popper-class="collapse ? 'sidebar-submenu-popper' : ''">
      <template #title>
        <i v-if="itemIcon" :class="itemIcon" class="menu-icon iconfont"></i>
        <span v-if="!collapse || isNest">{{ itemTitle }}</span>
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
import { computed } from 'vue'

defineOptions({ name: 'SidebarItem' })

interface MenuItem {
  path: string
  name?: string
  hidden?: boolean
  title?: string
  icon?: string
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

// 兼容 RouteItem (title/icon 在顶层) 和 RouteRecordRaw (title/icon 在 meta 中)
const itemTitle = computed(() => props.item.title || props.item.meta?.title || '')
const itemIcon = computed(() => props.item.icon || props.item.meta?.icon || '')

function getTitle(node: MenuItem): string {
  return node.title || node.meta?.title || ''
}

function getIcon(node: MenuItem): string {
  return node.icon || node.meta?.icon || ''
}

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
