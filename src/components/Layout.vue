<template>
  <el-container>
    <el-header>Header</el-header>
    <el-container>
      <el-aside width="200px">Aside</el-aside>
      <el-main>
        <el-button type="primary" @click="fetchData">请求后端</el-button>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import {getLayout} from "@/api/layout"

export default {
  name: 'Layout',
  methods: {
    async fetchData() {
      try {
        const response = await getLayout();
        this.$message({
          message: JSON.stringify(response), // 如果只想看后端返回的核心数据，可以改成 response.data
          type: 'success'
        });
      } catch (error) {
        this.$message.error('请求出错: ' + error);
        console.error('Error fetching data:', error);
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
