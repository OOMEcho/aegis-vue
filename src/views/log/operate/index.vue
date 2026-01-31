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
        <el-form-item label="操作类型">
          <el-select v-model="queryParams.businessType" placeholder="操作类型" clearable>
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
        <el-table-column label="操作类型" width="100">
          <template slot-scope="scope">
            {{ dictLabel('BUSINESS_TYPE', scope.row.businessType) }}
          </template>
        </el-table-column>
        <el-table-column prop="operateUser" label="操作人员" min-width="120"/>
        <el-table-column prop="requestIp" label="操作地址" min-width="140"/>
        <el-table-column label="操作地点" min-width="140">
          <template slot-scope="scope">
            {{ scope.row.requestLocal || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作状态" width="90">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.operateStatus)" size="mini">
              {{ dictLabel('OPERATION_STATUS', scope.row.operateStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operateTime" label="操作时间" min-width="160"/>
        <el-table-column label="消耗时间" width="110">
          <template slot-scope="scope">
            {{ formatDepleteTime(scope.row.depleteTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
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

      <el-dialog title="操作日志详情" :visible.sync="detailVisible" width="760px">
        <div class="detail-grid">
          <div v-for="item in detailGridItems" :key="item.label" class="detail-item">
            <span class="detail-label">{{ item.label }}：</span>
            <span class="detail-value">{{ item.value }}</span>
          </div>
        </div>
        <div v-for="item in detailBlockItems" :key="item.label" class="detail-block">
          <div class="detail-label">{{ item.label }}：</div>
          <pre class="detail-pre">{{ item.value }}</pre>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </div>
      </el-dialog>

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
      detailVisible: false,
      detailRecord: {},
      PERMS
    }
  },
  computed: {
    detailGridItems() {
      const record = this.detailRecord || {}
      const items = [
        {label: '模块标题', value: record.moduleTitle},
        {label: '操作类型', value: this.dictLabel('BUSINESS_TYPE', record.businessType)},
        {label: '操作人员', value: record.operateUser},
        {label: '操作地址', value: record.requestIp},
        {label: '操作地点', value: record.requestLocal},
        {label: '请求地址', value: record.requestUrl},
        {label: '请求方式', value: record.requestType},
        {label: '操作方法', value: record.requestMethod},
        {label: '操作状态', value: this.dictLabel('OPERATION_STATUS', record.operateStatus)},
        {label: '操作时间', value: record.operateTime},
        {label: '消耗时间', value: this.formatDepleteTime(record.depleteTime)},
        {label: 'traceId', value: record.traceId},
        {label: 'ID', value: record.id}
      ]
      return items.filter(item => !this.isEmpty(item.value))
    },
    detailBlockItems() {
      const record = this.detailRecord || {}
      const items = [
        {label: '请求参数', value: record.requestArgs},
        {label: '返回参数', value: record.responseResult},
        {label: '错误信息', value: record.errorMessage}
      ]
      return items.filter(item => !this.isEmpty(item.value))
    }
  },
  created() {
    this.loadDictOptions('BUSINESS_TYPE')
    this.loadDictOptions('OPERATION_STATUS')
    this.fetchList()
  },
  methods: {
    isEmpty(value) {
      return value === null || value === undefined || value === ''
    },
    formatDepleteTime(value) {
      if (this.isEmpty(value)) {
        return ''
      }
      const text = String(value)
      return text.includes('毫秒') ? text : `${text} 毫秒`
    },
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
    handleDetail(row) {
      this.detailRecord = row || {}
      this.detailVisible = true
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

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 24px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: #5b6b84;
  font-size: 13px;
}

.detail-label {
  color: #1f2d3d;
  font-weight: 600;
  white-space: nowrap;
}

.detail-value {
  color: #5b6b84;
  word-break: break-all;
}

.detail-block {
  margin-top: 12px;
}

.detail-pre {
  margin: 6px 0 0;
  padding: 10px 12px;
  background: #f8faff;
  border: 1px solid #e1e8ff;
  border-radius: 10px;
  color: #5b6b84;
  white-space: pre-wrap;
  word-break: break-word;
}

.page-pagination {
  margin-top: 12px;
  text-align: right;
}
</style>
