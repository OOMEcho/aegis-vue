<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>操作日志</span>
      </div>

      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="模块标题">
          <el-input v-model="queryParams.moduleTitle" placeholder="模块标题" clearable/>
        </el-form-item>
        <el-form-item label="操作人员">
          <el-input v-model="queryParams.operateUser" placeholder="操作人员" clearable/>
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="queryParams.businessType" placeholder="业务类型" clearable>
            <el-option
              v-for="item in dicts.BUSINESS_TYPE || []"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="Number(item.dictValue)"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.operateStatus" placeholder="状态" clearable>
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
            value-format="yyyy-MM-dd"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
          <el-button type="success" icon="el-icon-download" v-perm="PERMS.log.operateExport" @click="handleExport">
            导出
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="moduleTitle" label="模块标题" min-width="160"/>
        <el-table-column prop="operateUser" label="操作人员" min-width="120"/>
        <el-table-column label="业务类型" width="80">
          <template slot-scope="scope">
            {{ dictLabel('BUSINESS_TYPE', scope.row.businessType) }}
          </template>
        </el-table-column>
        <el-table-column prop="requestUrl" label="请求地址" min-width="200"/>
        <el-table-column prop="requestType" label="请求方式" width="100"/>
        <el-table-column prop="operateTime" label="操作时间" min-width="160"/>
        <el-table-column prop="depleteTime" label="耗时(ms)" width="100"/>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.operateStatus)" size="mini">
              {{ dictLabel('OPERATION_STATUS', scope.row.operateStatus) }}
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

<script>
import {exportOperateLog, getOperateLogPageList} from '@/api/operateLog'
import {PERMS} from '@/utils/permCode'
import dictMixin from '@/mixins/dict'

export default {
  name: 'OperateLogPage',
  mixins: [dictMixin],
  data() {
    return {
      loading: false,
      total: 0,
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        moduleTitle: '',
        operateUser: '',
        businessType: undefined,
        operateStatus: ''
      },
      tableData: [],
      PERMS
    }
  },
  created() {
    this.loadDictOptions('BUSINESS_TYPE')
    this.loadDictOptions('OPERATION_STATUS')
    this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const params = {...this.queryParams}
        if (this.dateRange && this.dateRange.length === 2) {
          params.beginTime = this.dateRange[0]
          params.endTime = this.dateRange[1]
        }
        const data = await getOperateLogPageList(params)
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
      this.dateRange = []
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        moduleTitle: '',
        operateUser: '',
        businessType: undefined,
        operateStatus: ''
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
    async handleExport() {
      try {
        const params = {...this.queryParams}
        if (this.dateRange && this.dateRange.length === 2) {
          params.beginTime = this.dateRange[0]
          params.endTime = this.dateRange[1]
        }
        const blob = await exportOperateLog(params)
        this.downloadBlob(blob, 'operate_log.xlsx')
      } catch (error) {
        console.error(error)
      }
    },
    downloadBlob(blob, filename) {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
    statusTagType(value) {
      return value === '0' ? 'success' : 'danger'
    }
  }
}
</script>

<style scoped>

.page-pagination {
  margin-top: 12px;
  text-align: right;
}
</style>
