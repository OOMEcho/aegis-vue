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
      <tags-view/>
      <el-main class="layout-main">
        <keep-alive :include="cachedViews">
          <router-view :key="`${$route.fullPath}-${viewKey}`"/>
        </keep-alive>
      </el-main>
      <el-footer class="layout-footer">Aegis Admin</el-footer>
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
      isCollapse: localStorage.getItem('sidebarCollapsed') === '1'
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
    }
  },
  created() {
    this.fetchUserInfo()
    this.fetchUnreadCount()
  },
  beforeDestroy() {
    this.revokeAvatarPreview()
  },
  watch: {
    'userInfo.avatar': {
      immediate: true,
      handler() {
        this.loadAvatarPreview()
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
  padding: 20px;
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.layout-footer {
  text-align: center;
  color: #8b97ad;
  font-size: 12px;
  background: #f4f7ff;
}
</style>
