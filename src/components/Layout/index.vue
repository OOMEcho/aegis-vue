<template>
  <el-container>
    <el-aside width="200px">
      <aside-component/>
    </el-aside>
    <el-container>
      <el-header>
        <div>欢迎，{{ userInfo.username }}</div>
      </el-header>
      <el-main>
        <!-- 这里渲染子路由 -->
        <router-view/>
      </el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </el-container>
</template>

<script>
import AsideComponent from '@/components/Aside/index.vue'
import {getUserInfo} from '@/api/profile'

export default {
  name: 'LayoutComponent',
  components: {
    AsideComponent
  },
  data() {
    return {
      userInfo: {}
    }
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    async getUserInfo() {
      try {
        this.userInfo = await getUserInfo()
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.el-container {
  height: 100vh;
}

.el-header, .el-footer {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #D3DCE6;
  color: #333;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  padding: 20px;
}
</style>
