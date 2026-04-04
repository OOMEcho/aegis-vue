<template>
  <el-container class="layout">
    <el-aside class="layout-aside" :width="isCollapse ? '64px' : '190px'">
      <div class="logo">
        <img src="@/assets/images/logo.png" alt="Aegis" class="logo-image"/>
        <span v-if="!isCollapse" class="logo-text">Aegis</span>
      </div>
      <aside-component :collapse="isCollapse"/>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <i
            :class="isCollapse ? 'icon-zhankai' : 'icon-shouqi'"
            class="collapse-trigger iconfont"
            @click="toggleCollapse"/>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item
              v-for="item in breadcrumbs"
              :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-badge :value="unreadCount" :max="99" :hidden="!unreadCount" class="badge-item">
            <el-button text @click="goNotice">
              <i class="iconfont icon-tongzhi"></i>
            </el-button>
          </el-badge>
          <el-button text class="menu-search-trigger" @click="openMenuSearch">
            <i class="iconfont icon-sousuo"></i>
          </el-button>
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-avatar :src="avatarUrl" :size="28">{{ avatarText }}</el-avatar>
              <span class="username">{{ displayName }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goProfile">个人中心</el-dropdown-item>
                <el-dropdown-item @click="goNotice">我的通知</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <transition name="menu-search-fade">
        <div v-if="menuSearchVisible" class="menu-search-mask" @click.self="closeMenuSearch">
          <div class="menu-search-panel">
            <el-input
              ref="menuSearchInputRef"
              v-model="menuSearchKeyword"
              placeholder="菜单搜索，支持标题、URL模糊查询"
              clearable
              @keydown="handleSearchKeydown($event as KeyboardEvent)"/>
            <div v-if="menuSearchResults.length" class="menu-search-list">
              <div
                v-for="(item, index) in menuSearchResults"
                :key="item.path + index"
                class="menu-search-item"
                :class="{ active: index === menuSearchActiveIndex }"
                @click="selectMenuSearch(item)">
                <div class="menu-search-icon">
                  <i v-if="item.icon" class="iconfont" :class="item.icon"></i>
                </div>
                <div class="menu-search-text">
                  <div class="menu-search-title">{{ item.breadcrumb || item.title }}</div>
                  <div class="menu-search-path">{{ item.path }}</div>
                </div>
              </div>
            </div>
            <div v-else class="menu-search-empty">无匹配菜单</div>
          </div>
        </div>
      </transition>
      <tags-view/>
      <el-main class="layout-main">
        <keep-alive :include="cachedViews">
          <router-view :key="`${route.fullPath}-${viewKey}`"/>
        </keep-alive>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AsideComponent from '@/components/Aside/index.vue'
import TagsView from '@/components/TagsView/index.vue'
import { getAvatarPreview, logout } from '@/api/profile'
import { getUnreadCount } from '@/api/notice'
import { resetRouter } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import { useTagsViewStore } from '@/stores/tagsView'
import type { RouteItem } from '@/types/store'

defineOptions({ name: 'LayoutComponent' })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const tagsViewStore = useTagsViewStore()

const avatarPreviewUrl = ref('')
const unreadCount = ref(0)
const isCollapse = ref(localStorage.getItem('sidebarCollapsed') === '1')
const menuSearchVisible = ref(false)
const menuSearchKeyword = ref('')
const menuSearchActiveIndex = ref(0)
const menuSearchInputRef = ref<{ focus: () => void } | null>(null)

const userInfo = computed(() => authStore.userInfo || ({} as Record<string, any>))
const breadcrumbs = computed(() =>
  route.matched
    .filter(item => item.meta?.title)
    .map(item => ({ path: item.path, title: item.meta.title as string }))
)
const displayName = computed(() => userInfo.value.nickname || userInfo.value.username || '用户')
const avatarUrl = computed(() => avatarPreviewUrl.value)
const avatarText = computed(() => displayName.value ? displayName.value.charAt(0) : 'U')
const cachedViews = computed(() => tagsViewStore.cachedViews)
const viewKey = computed(() => tagsViewStore.viewKey)

interface FlatMenuItem {
  title: string
  breadcrumb: string
  path: string
  icon: string
}

const menuSearchResults = computed(() => {
  const keyword = menuSearchKeyword.value.trim().toLowerCase()
  const list = flattenMenuRoutes(permissionStore.routes || [])
  if (!keyword) return list
  return list.filter(item => {
    const title = (item.title || '').toLowerCase()
    const breadcrumb = (item.breadcrumb || '').toLowerCase()
    const path = (item.path || '').toLowerCase()
    return title.includes(keyword) || breadcrumb.includes(keyword) || path.includes(keyword)
  })
})

function flattenMenuRoutes(routes: RouteItem[], parentPath = '', parentTitle = ''): FlatMenuItem[] {
  const list: FlatMenuItem[] = []
  routes.forEach(r => {
    if (!r) return
    const hidden = r.hidden
    const title = r.title
    const icon = r.icon
    const path = resolveMenuPath(parentPath, r.path)
    const breadcrumb = title ? (parentTitle ? `${parentTitle} / ${title}` : title) : parentTitle
    if (title && !hidden) {
      list.push({ title, breadcrumb, path, icon })
    }
    if (r.children && r.children.length) {
      list.push(...flattenMenuRoutes(r.children, path, breadcrumb))
    }
  })
  return list
}

function resolveMenuPath(basePath: string, path: string): string {
  if (!path) return basePath || ''
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('/')) return path
  if (!basePath || basePath === '/') return `/${path}`
  return `${basePath.replace(/\/$/, '')}/${path}`
}

async function fetchUserInfo() {
  try { await authStore.fetchUserInfo() } catch (e) { console.error('获取用户信息失败:', e) }
}

function revokeAvatarPreview() {
  if (avatarPreviewUrl.value) {
    URL.revokeObjectURL(avatarPreviewUrl.value)
    avatarPreviewUrl.value = ''
  }
}

async function loadAvatarPreview() {
  if (!userInfo.value.avatar) {
    revokeAvatarPreview()
    return
  }
  try {
    const blob = await getAvatarPreview()
    if (!blob || !(blob as Blob).size) { revokeAvatarPreview(); return }
    revokeAvatarPreview()
    avatarPreviewUrl.value = URL.createObjectURL(blob as Blob)
  } catch (e) {
    console.error('加载头像失败:', e)
    revokeAvatarPreview()
  }
}

async function fetchUnreadCount() {
  try {
    const count = await getUnreadCount()
    unreadCount.value = Number(count) || 0
  } catch (e) { console.error('获取未读消息数失败:', e) }
}

function toggleCollapse() {
  isCollapse.value = !isCollapse.value
  localStorage.setItem('sidebarCollapsed', isCollapse.value ? '1' : '0')
}

function goNotice() { router.push('/notice/user') }
function goProfile() { router.push('/profile') }
function openMenuSearch() { menuSearchVisible.value = true }
function closeMenuSearch() { menuSearchVisible.value = false }

function handleGlobalKeydown(event: KeyboardEvent) {
  const key = (event.key || '').toLowerCase()
  if ((event.ctrlKey || event.metaKey) && key === 'k') {
    event.preventDefault()
    openMenuSearch()
    return
  }
  if (!menuSearchVisible.value) return
  if (key === 'escape') { event.preventDefault(); closeMenuSearch() }
}

function handleSearchKeydown(event: KeyboardEvent) {
  if (!menuSearchVisible.value) return
  const results = menuSearchResults.value
  if (!results.length) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    menuSearchActiveIndex.value = (menuSearchActiveIndex.value + 1) % results.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    menuSearchActiveIndex.value = (menuSearchActiveIndex.value - 1 + results.length) % results.length
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const item = results[menuSearchActiveIndex.value]
    if (item) selectMenuSearch(item)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    closeMenuSearch()
  }
}

function selectMenuSearch(item: FlatMenuItem) {
  if (!item?.path) return
  if (/^https?:\/\//i.test(item.path)) {
    window.open(item.path, '_blank')
  } else if (route.path !== item.path) {
    router.push(item.path)
  }
  closeMenuSearch()
}

async function handleLogout() {
  try { await logout() } catch (e) { console.error('退出登录失败:', e) }
  authStore.clearToken()
  permissionStore.reset()
  resetRouter()
  await router.replace('/login')
}

watch(() => userInfo.value.avatar, () => { loadAvatarPreview() }, { immediate: true })
watch(menuSearchVisible, (val) => {
  if (val) {
    menuSearchKeyword.value = ''
    menuSearchActiveIndex.value = 0
    nextTick(() => menuSearchInputRef.value?.focus())
  }
})
watch(menuSearchKeyword, () => { menuSearchActiveIndex.value = 0 })
watch(() => route.path, () => { if (menuSearchVisible.value) menuSearchVisible.value = false })

fetchUserInfo()
fetchUnreadCount()

onMounted(() => { document.addEventListener('keydown', handleGlobalKeydown) })
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  revokeAvatarPreview()
})
</script>

<style scoped>
.layout { height: 100vh; overflow: hidden; }
.layout > .el-container { height: 100%; }
.layout-aside {
  background: #1b2430;
  color: #d7e1f2;
  transition: width 0.2s;
  position: relative;
  z-index: 2;
}
:deep(.el-aside) { overflow-x: hidden; }
.logo {
  height: 60px;
  line-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  color: #d7e1f2;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
}
.logo-image { width: 28px; height: 28px; object-fit: contain; }
.logo-text { font-size: 14px; letter-spacing: 0.4px; }
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e9ff;
  box-shadow: 0 10px 30px rgba(31, 45, 61, 0.06);
}
.header-left { display: flex; align-items: center; }
.collapse-trigger { font-size: 18px; margin-right: 12px; cursor: pointer; color: #4f70ff; }
.breadcrumb { font-size: 14px; }
.header-right { display: flex; align-items: center; gap: 12px; }
.menu-search-trigger { color: #4f70ff; }
.user-info { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
.username { font-size: 14px; }
.layout-main { background-color: #f4f7ff; padding: 0; flex: 1; overflow: auto; min-height: 0; }
.menu-search-mask {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.2);
  z-index: 3000;
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: 90px;
}
.menu-search-panel {
  width: min(600px, calc(100vw - 40px));
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e1e8ff;
  box-shadow: 0 18px 40px rgba(31, 45, 61, 0.18);
  padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
}
.menu-search-list { max-height: 360px; overflow: auto; display: flex; flex-direction: column; gap: 6px; }
.menu-search-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 10px; cursor: pointer;
  color: #3b4a66; border: 1px solid transparent;
}
.menu-search-item:hover { background: #f3f6ff; border-color: #e1e8ff; }
.menu-search-item.active { background: #4f70ff; color: #ffffff; }
.menu-search-icon {
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(79, 112, 255, 0.12);
  display: inline-flex; align-items: center; justify-content: center;
  color: #4f70ff; flex-shrink: 0;
}
.menu-search-item.active .menu-search-icon { background: rgba(255, 255, 255, 0.2); color: #ffffff; }
.menu-search-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.menu-search-title {
  font-size: 14px; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.menu-search-path {
  font-size: 12px; color: #8b97ad;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.menu-search-item.active .menu-search-path { color: rgba(255, 255, 255, 0.85); }
.menu-search-empty { text-align: center; color: #8b97ad; font-size: 12px; padding: 24px 0; }
.menu-search-fade-enter-active,
.menu-search-fade-leave-active { transition: opacity 0.2s ease; }
.menu-search-fade-enter-from,
.menu-search-fade-leave-to { opacity: 0; }
:deep(.badge-item .el-badge__content) {
  border: none; background: #f56c6c; color: #ffffff;
  height: 12px; min-width: 12px; line-height: 12px;
  border-radius: 6px; padding: 0 2px;
  font-size: 8px; font-weight: 600;
  transform: translate(20px, 4px);
}
</style>
