<template>
  <div class="not-found">
    <div class="not-found-card">
      <div class="image-wrap">
        <img class="main" :src="mainImage" alt="404"/>
      </div>
      <div class="content">
        <h1>页面不存在</h1>
        <p>你访问的页面可能已被删除或暂不可用</p>
        <div class="actions">
          <el-button @click="goBack">返回上一页</el-button>
          <el-button type="primary" @click="goHome">返回首页</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundPage',
  data() {
    return {
      mainImage: require('@/assets/404_images/404.png'),
    }
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    goHome() {
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
.not-found {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.not-found-card {
  width: min(920px, 100%);
  background: #ffffff;
  border-radius: 18px;
  padding: 40px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 24px;
  box-shadow: 0 18px 40px rgba(32, 45, 77, 0.08);
}

.image-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
}

.image-wrap .cloud {
  position: absolute;
  width: 80%;
  opacity: 0.7;
}

.image-wrap .main {
  width: 80%;
  position: relative;
  z-index: 1;
}

.content h1 {
  margin: 0 0 12px;
  font-size: 28px;
  color: #1f2d3d;
}

.content p {
  margin: 0 0 24px;
  color: #6b7a99;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .not-found-card {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .actions {
    justify-content: center;
  }
}
</style>
