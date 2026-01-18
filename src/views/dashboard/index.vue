<template>
  <div class="dashboard">
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">用户总数</div>
          <div class="stat-value">{{ stats.user }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">角色总数</div>
          <div class="stat-value">{{ stats.role }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">权限总数</div>
          <div class="stat-value">{{ stats.permission }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">通知总数</div>
          <div class="stat-value">{{ stats.notice }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="content-row">
      <el-col :span="16">
        <el-card>
          <div slot="header" class="card-header">
            <span>快捷入口</span>
          </div>
          <div class="quick-actions">
            <el-button v-perm="'system:user:page'" @click="go('/system/user')">用户管理</el-button>
            <el-button v-perm="'system:role:page'" @click="go('/system/role')">角色管理</el-button>
            <el-button v-perm="'system:permission:page'" @click="go('/system/permission')">权限管理</el-button>
            <el-button v-perm="'system:menu:page'" @click="go('/system/menu')">菜单管理</el-button>
            <el-button v-perm="'system:notice:page'" @click="go('/notice/list')">通知公告</el-button>
            <el-button v-perm="'system:loginLog:page'" @click="go('/log/login')">登录日志</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div slot="header" class="card-header">
            <span>系统提示</span>
          </div>
          <ul class="tips-list">
            <li>请定期检查账号权限与角色配置。</li>
            <li>通知支持定时发布与撤回，适合公告推送。</li>
            <li>文件管理支持多平台上传与临时下载。</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {getUserPageList} from '@/api/user'
import {getRolePageList} from '@/api/role'
import {getPermissionPageList} from '@/api/permission'
import {getNoticePageList} from '@/api/notice'

export default {
  name: 'DashboardPage',
  data() {
    return {
      stats: {
        user: 0,
        role: 0,
        permission: 0,
        notice: 0
      }
    }
  },
  created() {
    this.fetchStats()
  },
  methods: {
    async fetchStats() {
      try {
        const [userData, roleData, permData, noticeData] = await Promise.all([
          getUserPageList({pageNum: 1, pageSize: 1}),
          getRolePageList({pageNum: 1, pageSize: 1}),
          getPermissionPageList({pageNum: 1, pageSize: 1}),
          getNoticePageList({pageNum: 1, pageSize: 1})
        ])
        this.stats = {
          user: userData.total || 0,
          role: roleData.total || 0,
          permission: permData.total || 0,
          notice: noticeData.total || 0
        }
      } catch (error) {
        console.error(error)
      }
    },
    go(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-row .stat-card {
  text-align: center;
}

.stat-title {
  color: #999;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.card-header {
  font-weight: 600;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tips-list {
  padding-left: 18px;
  color: #666;
  line-height: 1.8;
}
</style>
