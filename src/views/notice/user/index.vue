<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>我的通知</span>
      </div>

      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="通知标题">
          <el-input v-model="queryParams.noticeTitle" placeholder="通知标题" clearable/>
        </el-form-item>
        <el-form-item label="通知类型">
          <el-select v-model="queryParams.noticeType" placeholder="通知类型" clearable>
            <el-option label="系统通知" value="1"/>
            <el-option label="公告" value="2"/>
            <el-option label="提醒" value="3"/>
          </el-select>
        </el-form-item>
        <el-form-item label="已读状态">
          <el-select v-model="queryParams.readFlag" placeholder="已读状态" clearable>
            <el-option label="未读" :value="0"/>
            <el-option label="已读" :value="1"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="noticeTitle" label="通知标题" min-width="180"/>
        <el-table-column label="通知类型" width="100">
          <template slot-scope="scope">
            {{ noticeTypeText(scope.row.noticeType) }}
          </template>
        </el-table-column>
        <el-table-column label="阅读状态" width="90">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.readFlag === 1" type="success" size="mini">已读</el-tag>
            <el-tag v-else type="info" size="mini">未读</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" min-width="160"/>
        <el-table-column prop="readTime" label="阅读时间" min-width="160"/>
        <el-table-column label="操作" width="90" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-tooltip content="详情" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-view"
                  class="action-icon is-primary"
                  @click="handleDetail(scope.row)"/>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="page-pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"/>
      </div>
    </el-card>

    <el-dialog title="通知详情" :visible.sync="detailVisible" width="600px">
      <div class="notice-detail">
        <h3>{{ detail.noticeTitle }}</h3>
        <p class="detail-meta">{{ noticeTypeText(detail.noticeType) }} | {{ detail.publishTime || '-' }}</p>
        <div class="detail-content">
          {{ detail.noticeContent }}
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {getUserNoticeDetail, getUserNoticePageList} from '@/api/notice'

export default {
  name: 'NoticeUserPage',
  data() {
    return {
      loading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        noticeTitle: '',
        noticeType: '',
        readFlag: undefined
      },
      tableData: [],
      detailVisible: false,
      detail: {}
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    noticeTypeText(value) {
      const map = {1: '系统通知', 2: '公告', 3: '提醒'}
      return map[value] || value
    },
    async fetchList() {
      this.loading = true
      try {
        const data = await getUserNoticePageList(this.queryParams)
        this.tableData = data.records || []
        this.total = Number(data.total || 0)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    handleReset() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        noticeTitle: '',
        noticeType: '',
        readFlag: undefined
      }
      this.fetchList()
    },
    handlePageChange(page) {
      this.queryParams.pageNum = page
      this.fetchList()
    },
    handleSizeChange(size) {
      this.queryParams.pageSize = size
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    async handleDetail(row) {
      try {
        this.detail = await getUserNoticeDetail(row.id)
        this.detailVisible = true
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>

.page-pagination {
  margin-top: 12px;
  text-align: right;
}

.notice-detail h3 {
  margin: 0 0 8px;
}

.detail-meta {
  color: #999;
  margin-bottom: 12px;
}

.detail-content {
  white-space: pre-line;
  line-height: 1.6;
}
</style>
