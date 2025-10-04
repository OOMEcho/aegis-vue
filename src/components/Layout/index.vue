<template>
  <el-container>
    <el-aside width="200px">
      <aside-component/>
    </el-aside>
    <el-container>
      <el-header>Header</el-header>
      <el-main>Main</el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </el-container>
</template>

<script>
import AsideComponent from '@/components/Aside/index.vue'
import {getUserInfo, getRouters} from '@/api/profile';

export default {
  name: 'LayoutComponent',
  components: {
    AsideComponent
  },
  data() {
    return {
      userInfo: {},
      routers: {}
    }
  },
  created() {
    this.getUserInfo();
    this.getRouters();
  },
  methods: {
    async getUserInfo() {
      try {
        this.userInfo = await getUserInfo();
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },
    async getRouters() {
      try {
        this.routers = await getRouters();
      } catch (error) {
        console.error('获取路由信息失败:', error);
      }
    }
  }
}
</script>

<style scoped>
.el-container {
  height: 100%;
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
  text-align: center;
  line-height: 200px;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
  line-height: 160px;
}
</style>
