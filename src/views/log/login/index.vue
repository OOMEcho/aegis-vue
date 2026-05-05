<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>登录日志</span>
        </div>
      </template>

      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="登录名">
          <el-input v-model="queryParams.loginUsername" placeholder="登录名" clearable/>
        </el-form-item>
        <el-form-item label="登录地址">
          <el-input v-model="queryParams.loginLocal" placeholder="登录地址" clearable/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.loginStatus" placeholder="状态" clearable>
            <el-option
              v-for="item in dicts.OPERATION_STATUS || []"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"/>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
          <el-button type="success" icon="Download" v-perm="PERMS.log.loginExport" @click="handleExport">
            导出
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="loginUsername" label="用户名" min-width="140"/>
        <el-table-column prop="loginIp" label="登录IP" min-width="120"/>
        <el-table-column prop="loginLocal" label="登录地点" min-width="140"/>
        <el-table-column prop="loginBrowser" label="浏览器" min-width="120"/>
        <el-table-column prop="loginOs" label="操作系统" min-width="120"/>
        <el-table-column prop="loginTime" label="登录时间" min-width="160"/>
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.loginStatus)" size="small">
              {{ dictLabel('OPERATION_STATUS', scope.row.loginStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="errorMessage" label="错误信息" min-width="200"/>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { exportLoginLog, getLoginLogPageList } from '@/api/loginLog'
import { PERMS } from '@/utils/permCode'
import { useDict } from '@/composables/useDict'

const { dicts, loadDictOptions, dictLabel } = useDict()

const loading = ref(false)
const total = ref(0)
const dateRange = ref<string[]>([])
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  loginUsername: '',
  loginLocal: '',
  loginStatus: ''
})
const tableData = ref<any[]>([])

async function fetchList() {
  loading.value = true
  try {
    const params: any = { ...queryParams }
    if (dateRange.value && dateRange.value.length === 2) {
      params.beginTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    const data = await getLoginLogPageList(params)
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
  dateRange.value = []
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.loginUsername = ''
  queryParams.loginLocal = ''
  queryParams.loginStatus = ''
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

async function handleExport() {
  try {
    const params: any = { ...queryParams }
    if (dateRange.value && dateRange.value.length === 2) {
      params.beginTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    const blob = await exportLoginLog(params)
    downloadBlob(blob, 'login_log.xlsx')
  } catch (error) {
    console.error(error)
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function statusTagType(value: string) {
  return value === '0' ? 'success' : 'danger'
}

// created
loadDictOptions('OPERATION_STATUS')
fetchList()
</script>

<style scoped>

.page-pagination {
  margin-top: 12px;
  text-align: right;
}
</style>
