<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-content">
        <div class="logo">
          <h2>Aegis系统</h2>
        </div>
        <div class="nav-right">
          <el-button type="primary" @click="goToLogin" class="login-btn">
            登录
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 轮播图区域 -->
      <div class="carousel-section">
        <el-carousel :interval="4000" type="card" height="400px">
          <el-carousel-item v-for="item in carouselItems" :key="item.id">
            <div class="carousel-item" :style="{ background: item.bg }">
              <div class="carousel-content">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 公告区域 -->
      <div class="announcement-section">
        <div class="section-title">
          <h2>系统公告</h2>
        </div>
        <div class="announcements">
          <div
            v-for="announcement in announcements"
            :key="announcement.id"
            class="announcement-card"
          >
            <div class="announcement-header">
              <h3>{{ announcement.title }}</h3>
              <span class="announcement-date">{{ announcement.date }}</span>
            </div>
            <p class="announcement-content">{{ announcement.content }}</p>
            <div class="announcement-meta">
              <span class="announcement-type" :class="announcement.type">
                {{ getTypeText(announcement.type) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="footer">
      <p>&copy; 2025 Aegis系统. All rights reserved.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      carouselItems: [
        {
          id: 1,
          title: '欢迎使用Aegis系统',
          description: '专业的安全管理平台，为您提供全方位的安全防护',
          bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
          id: 2,
          title: '智能监控',
          description: '实时监控系统状态，及时发现和处理安全威胁',
          bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
          id: 3,
          title: '数据保护',
          description: '采用先进的加密技术，确保您的数据安全可靠',
          bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        }
      ],
      announcements: [
        {
          id: 1,
          title: '系统维护通知',
          content: '为了提供更好的服务体验，系统将于本周日凌晨2:00-4:00进行例行维护，期间可能会出现短暂的服务中断，敬请谅解。',
          date: '2025-01-15',
          type: 'notice'
        },
        {
          id: 2,
          title: '新功能上线',
          content: '新增了智能风险评估模块，可以更准确地识别潜在的安全风险，提升系统整体防护能力。欢迎大家体验使用。',
          date: '2025-01-10',
          type: 'feature'
        },
        {
          id: 3,
          title: '安全提醒',
          content: '请定期更改密码，使用强密码并启用双因子认证，确保账户安全。如发现异常登录行为，请及时联系管理员。',
          date: '2025-01-08',
          type: 'warning'
        }
      ]
    }
  },
  methods: {
    goToLogin() {
      this.$router.push('/login')
    },
    getTypeText(type) {
      const typeMap = {
        notice: '通知',
        feature: '功能',
        warning: '提醒'
      }
      return typeMap[type] || '公告'
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

.nav-bar {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo h2 {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

.login-btn {
  border-radius: 20px;
  padding: 8px 24px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.carousel-section {
  margin-bottom: 60px;
}

.carousel-item {
  height: 100%;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.carousel-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.carousel-content {
  position: relative;
  z-index: 2;
  padding: 20px;
}

.carousel-content h3 {
  font-size: 32px;
  margin-bottom: 16px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.carousel-content p {
  font-size: 18px;
  opacity: 0.95;
  max-width: 500px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  line-height: 1.5;
}

.announcement-section {
  margin-bottom: 40px;
}

.section-title {
  text-align: center;
  margin-bottom: 40px;
}

.section-title h2 {
  color: #2c3e50;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.announcements {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.announcement-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #667eea;
}

.announcement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.announcement-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  margin-right: 16px;
}

.announcement-date {
  color: #6c757d;
  font-size: 14px;
  white-space: nowrap;
}

.announcement-content {
  color: #495057;
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 14px;
}

.announcement-meta {
  display: flex;
  justify-content: flex-end;
}

.announcement-type {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.announcement-type.notice {
  background: #e3f2fd;
  color: #1976d2;
}

.announcement-type.feature {
  background: #e8f5e8;
  color: #2e7d32;
}

.announcement-type.warning {
  background: #fff3e0;
  color: #f57c00;
}

.footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
}

.footer p {
  margin: 0;
  opacity: 0.8;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .nav-content {
    padding: 0 15px;
  }

  .main-content {
    padding: 20px 15px;
  }

  .announcements {
    grid-template-columns: 1fr;
  }

  .carousel-content h3 {
    font-size: 24px;
  }

  .carousel-content p {
    font-size: 16px;
  }

  .announcement-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .announcement-header h3 {
    margin-right: 0;
    margin-bottom: 8px;
  }
}
</style>