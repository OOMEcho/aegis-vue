<template>
  <div class="page-container dashboard">
    <section class="hero-card">
      <div class="hero-content">
        <div class="hero-title">欢迎回来，{{ displayName }}</div>
      </div>
      <div class="hero-quick">
        <button v-perm="PERMS.user.page" type="button" class="quick-item hero-quick-item" @click="go('/system/user')">
          <i class="el-icon-user"></i>
          <div class="quick-title">用户管理</div>
          <div class="quick-desc">账号与基础信息维护</div>
        </button>
        <button v-perm="PERMS.role.page" type="button" class="quick-item hero-quick-item" @click="go('/system/role')">
          <i class="el-icon-s-custom"></i>
          <div class="quick-title">角色管理</div>
          <div class="quick-desc">角色与分配策略</div>
        </button>
        <button v-perm="PERMS.permission.page" type="button" class="quick-item hero-quick-item" @click="go('/system/permission')">
          <i class="el-icon-key"></i>
          <div class="quick-title">权限管理</div>
          <div class="quick-desc">权限与资源配置</div>
        </button>
      </div>
    </section>

    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-head">
            <i class="el-icon-user stat-icon"></i>
            <span class="stat-title">用户总数</span>
          </div>
          <div class="stat-value">{{ stats.user }}</div>
          <div class="stat-meta">近 7 日 {{ growth.user }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-head">
            <i class="el-icon-s-custom stat-icon"></i>
            <span class="stat-title">角色总数</span>
          </div>
          <div class="stat-value">{{ stats.role }}</div>
          <div class="stat-meta">近 7 日 {{ growth.role }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-head">
            <i class="el-icon-key stat-icon"></i>
            <span class="stat-title">权限总数</span>
          </div>
          <div class="stat-value">{{ stats.permission }}</div>
          <div class="stat-meta">近 7 日 {{ growth.permission }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-head">
            <i class="el-icon-bell stat-icon"></i>
            <span class="stat-title">通知总数</span>
          </div>
          <div class="stat-value">{{ stats.notice }}</div>
          <div class="stat-meta">近 7 日 {{ growth.notice }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="content-row">
      <el-col :span="16">
        <el-card class="trend-card">
          <div slot="header" class="card-header">
            <span>近 30 日访问趋势</span>
            <div class="card-actions">
              <el-button size="mini" :type="trendDays === 7 ? 'primary' : 'default'" :plain="trendDays !== 7" @click="setTrendDays(7)">近 7 日</el-button>
              <el-button size="mini" :type="trendDays === 30 ? 'primary' : 'default'" :plain="trendDays !== 30" @click="setTrendDays(30)">近 30 日</el-button>
            </div>
          </div>
          <div class="trend-body">
            <v-chart class="trend-chart" :options="trendOption" autoresize/>
            <div class="trend-legend">
              <span class="legend-dot"></span>
              <span>访问量</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="tips-card">
          <div slot="header" class="card-header">
            <span>系统介绍</span>
          </div>
          <div class="intro-text">
            <p>
              Aegis 是一个企业级 RBAC 权限管理系统，采用前后端分离架构，以权限为核心组织用户、角色与资源。
              系统通过用户-角色-权限链路完成授权，将菜单路由与接口资源统一纳入权限控制，可作为企业应用的管理基础框架。
            </p>
          </div>
          <ul class="tips-list">
            <li>多样化登录与安全校验：账号密码、邮箱验证码、滑块验证码与 RSA 加密传输。</li>
            <li>权限驱动菜单与路由：动态生成菜单与路由，统一权限配置入口。</li>
            <li>按钮级权限指令：细粒度操作控制，支持权限回收与灰度配置。</li>
            <li>资源权限映射：URL/Method 与权限绑定，保障接口访问安全。</li>
            <li>完备的后台模块：用户、角色、权限、菜单、资源、部门、字典、日志、通知、文件等。</li>
            <li>数据权限支持：按部门、部门及以下、自定义、仅本人等多种访问范围。</li>
            <li>日志与审计：操作日志与登录日志留痕，满足审计与排查。</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import VChart from 'vue-echarts'
import 'echarts'
import {getDashboardAccessTrend, getDashboardStatistics} from '@/api/dashboard'
import {PERMS} from '@/utils/permCode'

export default {
  name: 'DashboardPage',
  components: {
    VChart
  },
  data() {
    return {
      stats: {
        user: '--',
        role: '--',
        permission: '--',
        notice: '--'
      },
      growth: {
        user: '+0.0%',
        role: '+0.0%',
        permission: '+0.0%',
        notice: '+0.0%'
      },
      trendDays: 30,
      trendLabels: [],
      trendValues: [],
      PERMS
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.auth.userInfo || {}
    },
    displayName() {
      return this.userInfo.nickname || this.userInfo.username || '用户'
    },
    trendOption() {
      return {
        grid: {left: 12, right: 12, top: 12, bottom: 24, containLabel: true},
        tooltip: {trigger: 'axis'},
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.trendLabels,
          axisLine: {lineStyle: {color: '#dfe6f5'}},
          axisLabel: {color: '#8b97ad'}
        },
        yAxis: {
          type: 'value',
          axisLine: {show: false},
          splitLine: {lineStyle: {color: '#eef2ff'}},
          axisLabel: {color: '#8b97ad'}
        },
        series: [
          {
            name: '访问量',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            data: this.trendValues,
            lineStyle: {color: '#4f70ff', width: 2},
            itemStyle: {color: '#4f70ff'},
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {offset: 0, color: 'rgba(79, 112, 255, 0.25)'},
                  {offset: 1, color: 'rgba(79, 112, 255, 0.02)'}
                ]
              }
            }
          }
        ]
      }
    }
  },
  created() {
    this.fetchStatistics()
    this.fetchTrend()
  },
  methods: {
    async fetchStatistics() {
      try {
        const data = await getDashboardStatistics()
        this.stats = {
          user: data.userCount || '0',
          role: data.roleCount || '0',
          permission: data.permissionCount || '0',
          notice: data.noticeCount || '0'
        }
        this.growth = {
          user: data.userGrowthRate || '+0.0%',
          role: data.roleGrowthRate || '+0.0%',
          permission: data.permissionGrowthRate || '+0.0%',
          notice: data.noticeGrowthRate || '+0.0%'
        }
      } catch (error) {
        console.error(error)
      }
    },
    async fetchTrend() {
      try {
        const data = await getDashboardAccessTrend(this.trendDays)
        this.trendLabels = (data || []).map(item => item.date)
        this.trendValues = (data || []).map(item => Number(item.count || 0))
      } catch (error) {
        console.error(error)
      }
    },
    setTrendDays(days) {
      if (this.trendDays === days) {
        return
      }
      this.trendDays = days
      this.fetchTrend()
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
  gap: 18px;
}

.dashboard > * {
  animation: dashboardFade 0.4s ease both;
}

.dashboard > *:nth-child(2) {
  animation-delay: 0.04s;
}

.dashboard > *:nth-child(3) {
  animation-delay: 0.08s;
}

.dashboard > *:nth-child(4) {
  animation-delay: 0.12s;
}

.hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 20px 24px;
  border-radius: var(--radius-medium);
  border: 1px solid var(--brand-border);
  background: linear-gradient(135deg, rgba(79, 112, 255, 0.14) 0%, rgba(255, 255, 255, 0.9) 48%, rgba(248, 250, 255, 0.95) 100%);
  box-shadow: var(--shadow-soft);
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hero-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.hero-subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

.hero-quick {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  align-items: stretch;
}

.hero-quick-item {
  padding: 14px;
  min-width: 0;
}

.hero-quick-item .quick-desc {
  line-height: 1.4;
}

.stats-row .stat-card {
  background: var(--surface);
  border: 1px solid var(--brand-border);
  box-shadow: none;
}

.stat-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-soft);
  color: var(--brand-primary);
  font-size: 16px;
}

.stat-title {
  color: var(--text-secondary);
  font-size: 14px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-meta {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: var(--text-primary);
}

.card-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.trend-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-chart {
  height: 220px;
  width: 100%;
}

.trend-legend {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 12px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--brand-primary);
}

.tips-card .tips-list {
  padding-left: 38px;
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 15px;
}

.intro-text {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 16px;
  margin-bottom: 10px;
}

.intro-text p {
  margin: 0 0 8px 0;
}

.quick-item {
  border: 1px solid var(--brand-border);
  border-radius: 12px;
  padding: 16px;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-item i {
  font-size: 18px;
  color: var(--brand-primary);
}

.quick-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(31, 45, 61, 0.08);
  border-color: rgba(79, 112, 255, 0.45);
}

.quick-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.quick-desc {
  font-size: 12px;
  color: var(--text-muted);
}

@keyframes dashboardFade {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .hero-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-quick {
    width: 100%;
  }

}

@media (max-width: 768px) {
  .hero-quick {
    grid-template-columns: 1fr;
  }
}
</style>
