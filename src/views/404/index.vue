<template>
  <div class="not-found">
    <div class="not-found-card">
      <div class="image-wrap">
        <div class="error-code">404</div>
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

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}

function goHome() {
  router.push('/dashboard')
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

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #e0e6f1;
  line-height: 1;
  user-select: none;
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
