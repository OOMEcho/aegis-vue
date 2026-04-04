<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的通知</span>
        </div>
      </template>

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
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="noticeTitle" label="通知标题" min-width="180"/>
        <el-table-column label="通知类型" width="100">
          <template #default="scope">
            {{ noticeTypeText(scope.row.noticeType) }}
          </template>
        </el-table-column>
        <el-table-column label="阅读状态" width="90">
          <template #default="scope">
            <el-tag v-if="scope.row.readFlag === 1" type="success" size="small">已读</el-tag>
            <el-tag v-else type="info" size="small">未读</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" min-width="160"/>
        <el-table-column prop="readTime" label="阅读时间" min-width="160"/>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip content="详情" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="View"
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

    <el-dialog title="通知详情" v-model="detailVisible" width="600px">
      <div class="notice-detail">
        <div class="detail-header">
          <div class="detail-title">{{ detail.noticeTitle }}</div>
          <el-tag size="small" type="info">{{ noticeTypeText(detail.noticeType) }}</el-tag>
        </div>
        <div class="detail-meta">
          <span>发布时间：{{ detail.publishTime || '-' }}</span>
        </div>
        <div class="detail-content-box">
          <div class="detail-content" v-html="sanitizedContent"></div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import DOMPurify from 'dompurify'
import { getUserNoticeDetail, getUserNoticePageList } from '@/api/notice'

const loading = ref(false)
const total = ref(0)
const tableData = ref<any[]>([])
const detailVisible = ref(false)
const detail = ref<any>({})

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  noticeTitle: '',
  noticeType: '',
  readFlag: undefined as number | undefined
})

const sanitizedContent = computed(() => {
  const content = detail.value.noticeContent || ''
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^https?:\/\//i
  })
})

function noticeTypeText(value: string | number) {
  const map: Record<string | number, string> = { 1: '系统通知', 2: '公告', 3: '提醒' }
  return map[value] || value
}

async function fetchList() {
  loading.value = true
  try {
    const data = await getUserNoticePageList(queryParams)
    tableData.value = data.records || []
    total.value = Number(data.total || 0)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryParams.pageNum = 1
  fetchList()
}

function handleReset() {
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.noticeTitle = ''
  queryParams.noticeType = ''
  queryParams.readFlag = undefined
  fetchList()
}

function handlePageChange(page: number) {
  queryParams.pageNum = page
  fetchList()
}

function handleSizeChange(size: number) {
  queryParams.pageSize = size
  queryParams.pageNum = 1
  fetchList()
}

async function handleDetail(row: any) {
  try {
    detail.value = await getUserNoticeDetail(row.id)
    detailVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

// created
fetchList()
</script>

<style scoped>

.page-pagination {
  margin-top: 12px;
  text-align: right;
}

.notice-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: var(--text-muted);
  font-size: 12px;
}

.detail-content-box {
  background: #f8faff;
  border: 1px solid #e1e8ff;
  border-radius: 12px;
  padding: 12px 14px;
}

.detail-content {
  white-space: pre-line;
  line-height: 1.7;
  color: var(--text-secondary);
}

:deep(.detail-content p) {
  margin: 0 0 8px;
}

:deep(.detail-content ul),
:deep(.detail-content ol) {
  padding-left: 18px;
  margin: 0 0 8px;
}

:deep(.detail-content a) {
  color: #4f70ff;
  text-decoration: none;
}

:deep(.detail-content a:hover) {
  text-decoration: underline;
}

:deep(.detail-content blockquote) {
  margin: 0 0 8px;
  padding: 6px 12px;
  border-left: 3px solid #4f70ff;
  background: #f4f7ff;
  color: #5b6b84;
}

:deep(.detail-content code),
:deep(.detail-content pre) {
  font-family: "Fira Code", "JetBrains Mono", Consolas, monospace;
}

:deep(.detail-content pre) {
  background: #f7f9ff;
  border: 1px solid #e1e8ff;
  border-radius: 10px;
  padding: 10px 12px;
  overflow: auto;
}
</style>
