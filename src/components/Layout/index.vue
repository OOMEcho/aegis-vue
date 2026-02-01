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
            :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
            class="collapse-trigger"
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
            <el-button type="text" icon="el-icon-bell" @click="goNotice"/>
          </el-badge>
          <el-button
            type="text"
            icon="el-icon-search"
            class="menu-search-trigger"
            @click="openMenuSearch"/>
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-avatar :src="avatarUrl" size="small">{{ avatarText }}</el-avatar>
              <span class="username">{{ displayName }}</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="goProfile">个人中心</el-dropdown-item>
              <el-dropdown-item @click.native="goNotice">我的通知</el-dropdown-item>
              <el-dropdown-item divided @click.native="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <transition name="menu-search-fade">
        <div v-if="menuSearchVisible" class="menu-search-mask" @click.self="closeMenuSearch">
          <div class="menu-search-panel">
            <el-input
              ref="menuSearchInput"
              v-model="menuSearchKeyword"
              placeholder="菜单搜索，支持标题、URL模糊查询"
              clearable
              prefix-icon="el-icon-search"
              @keydown.native="handleSearchKeydown"/>
            <div v-if="menuSearchResults.length" class="menu-search-list">
              <div
                v-for="(item, index) in menuSearchResults"
                :key="item.path + index"
                class="menu-search-item"
                :class="{ active: index === menuSearchActiveIndex }"
                @click="selectMenuSearch(item)">
                <div class="menu-search-icon">
                  <i v-if="item.icon" class="iconfont" :class="item.icon"></i>
                  <i v-else class="el-icon-menu"></i>
                </div>
                <div class="menu-search-text">
                  <div class="menu-search-title">{{ item.breadcrumb || item.title }}</div>
                  <div class="menu-search-path">{{ item.path }}</div>
                </div>
                <i v-if="index === menuSearchActiveIndex" class="el-icon-right menu-search-enter"></i>
              </div>
            </div>
            <div v-else class="menu-search-empty">无匹配菜单</div>
          </div>
        </div>
      </transition>
      <tags-view/>
      <el-main class="layout-main">
        <keep-alive :include="cachedViews">
          <router-view :key="`${$route.fullPath}-${viewKey}`"/>
        </keep-alive>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import AsideComponent from '@/components/Aside/index.vue'
import TagsView from '@/components/TagsView/index.vue'
import {getAvatarPreview, logout} from '@/api/profile'
import {resetRouter} from '@/router'
import {getUnreadCount} from '@/api/notice'

export default {
  name: 'LayoutComponent',
  components: {
    AsideComponent,
    TagsView
  },
  data() {
    return {
      avatarPreviewUrl: '',
      unreadCount: 0,
      isCollapse: localStorage.getItem('sidebarCollapsed') === '1',
      menuSearchVisible: false,
      menuSearchKeyword: '',
      menuSearchActiveIndex: 0
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.auth.userInfo || {}
    },
    breadcrumbs() {
      return this.$route.matched
        .filter(item => item.meta && item.meta.title)
        .map(item => ({
          path: item.path,
          title: item.meta.title
        }))
    },
    displayName() {
      return this.userInfo.nickname || this.userInfo.username || '用户'
    },
    avatarUrl() {
      return this.avatarPreviewUrl
    },
    avatarText() {
      return this.displayName ? this.displayName.charAt(0) : 'U'
    },
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    viewKey() {
      return this.$store.state.tagsView.viewKey
    },
    menuSearchResults() {
      const keyword = this.menuSearchKeyword.trim().toLowerCase()
      const list = this.flattenMenuRoutes(this.$store.state.permission.routes || [])
      if (!keyword) {
        return list
      }
      return list.filter(item => {
        const title = (item.title || '').toLowerCase()
        const breadcrumb = (item.breadcrumb || '').toLowerCase()
        const path = (item.path || '').toLowerCase()
        return title.includes(keyword) || breadcrumb.includes(keyword) || path.includes(keyword)
      })
    }
  },
  created() {
    this.fetchUserInfo()
    this.fetchUnreadCount()
  },
  mounted() {
    document.addEventListener('keydown', this.handleGlobalKeydown)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleGlobalKeydown)
    this.revokeAvatarPreview()
  },
  watch: {
    'userInfo.avatar': {
      immediate: true,
      handler() {
        this.loadAvatarPreview()
      }
    },
    menuSearchVisible(value) {
      if (value) {
        this.menuSearchKeyword = ''
        this.menuSearchActiveIndex = 0
        this.$nextTick(() => this.focusMenuSearch())
      }
    },
    menuSearchKeyword() {
      this.menuSearchActiveIndex = 0
    },
    $route() {
      if (this.menuSearchVisible) {
        this.menuSearchVisible = false
      }
    }
  },
  methods: {
    async fetchUserInfo() {
      try {
        await this.$store.dispatch('auth/fetchUserInfo')
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    revokeAvatarPreview() {
      if (this.avatarPreviewUrl) {
        URL.revokeObjectURL(this.avatarPreviewUrl)
        this.avatarPreviewUrl = ''
      }
    },
    async loadAvatarPreview() {
      if (!this.userInfo.avatar) {
        this.revokeAvatarPreview()
        return
      }
      try {
        const blob = await getAvatarPreview()
        if (!blob || !blob.size) {
          this.revokeAvatarPreview()
          return
        }
        this.revokeAvatarPreview()
        this.avatarPreviewUrl = URL.createObjectURL(blob)
      } catch (error) {
        console.error('加载头像失败:', error)
        this.revokeAvatarPreview()
      }
    },
    async fetchUnreadCount() {
      try {
        const count = await getUnreadCount()
        this.unreadCount = Number(count) || 0
      } catch (error) {
        console.error('获取未读消息数失败:', error)
      }
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
      localStorage.setItem('sidebarCollapsed', this.isCollapse ? '1' : '0')
    },
    goNotice() {
      this.$router.push('/notice/user')
    },
    goProfile() {
      this.$router.push('/profile')
    },
    openMenuSearch() {
      this.menuSearchVisible = true
    },
    closeMenuSearch() {
      this.menuSearchVisible = false
    },
    focusMenuSearch() {
      if (this.$refs.menuSearchInput && this.$refs.menuSearchInput.focus) {
        this.$refs.menuSearchInput.focus()
      }
    },
    handleGlobalKeydown(event) {
      const key = (event.key || '').toLowerCase()
      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault()
        this.openMenuSearch()
        return
      }
      if (!this.menuSearchVisible) {
        return
      }
      if (key === 'escape') {
        event.preventDefault()
        this.closeMenuSearch()
      }
    },
    handleSearchKeydown(event) {
      if (!this.menuSearchVisible) {
        return
      }
      const results = this.menuSearchResults
      if (!results.length) {
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        this.menuSearchActiveIndex = (this.menuSearchActiveIndex + 1) % results.length
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        this.menuSearchActiveIndex = (this.menuSearchActiveIndex - 1 + results.length) % results.length
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const item = results[this.menuSearchActiveIndex]
        if (item) {
          this.selectMenuSearch(item)
        }
      } else if (event.key === 'Escape') {
        event.preventDefault()
        this.closeMenuSearch()
      }
    },
    selectMenuSearch(item) {
      if (!item || !item.path) {
        return
      }
      if (/^https?:\/\//i.test(item.path)) {
        window.open(item.path, '_blank')
      } else if (this.$route.path !== item.path) {
        this.$router.push(item.path)
      }
      this.closeMenuSearch()
    },
    flattenMenuRoutes(routes = [], parentPath = '', parentTitle = '') {
      const list = []
      routes.forEach(route => {
        if (!route) {
          return
        }
        const hidden = route.hidden || (route.meta && route.meta.hidden)
        const title = route.meta && route.meta.title
        const icon = route.meta && route.meta.icon
        const path = this.resolveMenuPath(parentPath, route.path)
        const breadcrumb = title ? (parentTitle ? `${parentTitle} / ${title}` : title) : parentTitle
        if (title && !hidden) {
          list.push({
            title,
            breadcrumb,
            path,
            icon
          })
        }
        if (route.children && route.children.length) {
          list.push(...this.flattenMenuRoutes(route.children, path, breadcrumb))
        }
      })
      return list
    },
    resolveMenuPath(basePath, path) {
      if (!path) {
        return basePath || ''
      }
      if (/^https?:\/\//i.test(path)) {
        return path
      }
      if (path.startsWith('/')) {
        return path
      }
      if (!basePath || basePath === '/') {
        return `/${path}`
      }
      return `${basePath.replace(/\/$/, '')}/${path}`
    },
    async handleLogout() {
      try {
        await logout()
      } catch (error) {
        console.error('退出登录失败:', error)
      }
      await this.$store.dispatch('auth/clearToken')
      this.$store.commit('permission/SET_ROUTES', [])
      this.$store.commit('permission/SET_PERMISSIONS', [])
      resetRouter()
      await this.$router.replace('/login')
    }
  }
}
</script>

<style scoped>
.layout {
  height: 100vh;
  overflow: hidden;
}

.layout > .el-container {
  height: 100%;
}

.layout-aside {
  background: #1b2430;
  color: #d7e1f2;
  transition: width 0.2s;
  position: relative;
  z-index: 2;
}

::v-deep .el-aside {
  overflow-x: hidden;
}

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

.logo-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.logo-text {
  font-size: 14px;
  letter-spacing: 0.4px;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e9ff;
  box-shadow: 0 10px 30px rgba(31, 45, 61, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-trigger {
  font-size: 18px;
  margin-right: 12px;
  cursor: pointer;
  color: #4f70ff;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-search-trigger {
  color: #4f70ff;
}

.user-info {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  font-size: 14px;
}

.layout-main {
  background-color: #f4f7ff;
  padding: 0;
  flex: 1;
  overflow: auto;
  min-height: 0;
}


.menu-search-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.2);
  z-index: 3000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 90px;
}

.menu-search-panel {
  width: min(600px, calc(100vw - 40px));
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e1e8ff;
  box-shadow: 0 18px 40px rgba(31, 45, 61, 0.18);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-search-list {
  max-height: 360px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-search-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  color: #3b4a66;
  border: 1px solid transparent;
}

.menu-search-item:hover {
  background: #f3f6ff;
  border-color: #e1e8ff;
}

.menu-search-item.active {
  background: #4f70ff;
  color: #ffffff;
}

.menu-search-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(79, 112, 255, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #4f70ff;
  flex-shrink: 0;
}

.menu-search-item.active .menu-search-icon {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.menu-search-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.menu-search-title {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-search-path {
  font-size: 12px;
  color: #8b97ad;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-search-item.active .menu-search-path {
  color: rgba(255, 255, 255, 0.85);
}

.menu-search-enter {
  margin-left: auto;
  font-size: 16px;
  color: inherit;
}

.menu-search-empty {
  text-align: center;
  color: #8b97ad;
  font-size: 12px;
  padding: 24px 0;
}

.menu-search-fade-enter-active,
.menu-search-fade-leave-active {
  transition: opacity 0.2s ease;
}

.menu-search-fade-enter,
.menu-search-fade-leave-to {
  opacity: 0;
}

.badge-item ::v-deep .el-badge__content {
  border: none;
  background: #f56c6c;
  color: #ffffff;
  height: 12px;
  min-width: 12px;
  line-height: 12px;
  border-radius: 6px;
  padding: 0 2px;
  font-size: 8px;
  font-weight: 600;
  transform: translate(20px, 4px);
}
</style>
