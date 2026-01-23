<template>
  <el-container class="layout">
    <el-aside class="layout-aside" :width="isCollapse ? '64px' : '220px'">
      <div class="logo">Aegis</div>
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
      <el-main class="layout-main">
        <router-view/>
      </el-main>
      <el-footer class="layout-footer">Aegis Admin</el-footer>
    </el-container>
  </el-container>
</template>

<script>
import AsideComponent from '@/components/Aside/index.vue'
import {getUserInfo, logout} from '@/api/profile'
import {resetRouter} from '@/router'
import {getUnreadCount} from '@/api/notice'

export default {
  name: 'LayoutComponent',
  components: {
    AsideComponent
  },
  data() {
    return {
      userInfo: {},
      unreadCount: 0,
      isCollapse: false
    }
  },
  computed: {
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
      return this.userInfo.avatar || ''
    },
    avatarText() {
      return this.displayName ? this.displayName.charAt(0) : 'U'
    }
  },
  created() {
    this.fetchUserInfo()
    this.fetchUnreadCount()
    // 个人中心更新头像/昵称后触发同步
    this.$root.$on('user-info-updated', this.handleUserInfoUpdate)
  },
  beforeDestroy() {
    this.$root.$off('user-info-updated', this.handleUserInfoUpdate)
  },
  methods: {
    async fetchUserInfo() {
      try {
        this.userInfo = await getUserInfo()
      } catch (error) {
        console.error('获取用户信息失败:', error)
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
    handleUserInfoUpdate(info) {
      this.userInfo = {
        ...this.userInfo,
        ...(info || {})
      }
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
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
}

.layout-aside {
  background: #f5f7ff;
  color: #1f2d3d;
  transition: width 0.2s;
  border-right: 1px solid #e2e9ff;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-weight: 600;
  color: #1f2d3d;
  border-bottom: 1px solid #e2e9ff;
  background: linear-gradient(135deg, #eef3ff 0%, #ffffff 100%);
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
  min-height: calc(100vh - 110px);
}

.layout-footer {
  text-align: center;
  color: #8b97ad;
  font-size: 12px;
  background: #f4f7ff;
}
</style>
