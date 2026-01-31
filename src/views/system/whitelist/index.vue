<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>白名单管理</span>
      </div>

      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="请求方法">
          <el-select v-model="queryParams.requestMethod" placeholder="请求方法" clearable>
            <el-option label="GET" value="GET"/>
            <el-option label="POST" value="POST"/>
            <el-option label="PUT" value="PUT"/>
            <el-option label="DELETE" value="DELETE"/>
            <el-option label="ALL" value="ALL"/>
          </el-select>
        </el-form-item>
        <el-form-item label="请求地址">
          <el-input v-model="queryParams.requestUri" placeholder="请求地址" clearable/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="状态" clearable>
            <el-option
              v-for="item in dicts.DATA_STATUS || []"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <el-button type="primary" size="small" icon="el-icon-plus" v-perm="PERMS.whitelist.add" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="requestMethod" label="请求方法" width="100"/>
        <el-table-column prop="requestUri" label="请求地址" min-width="220"/>
        <el-table-column prop="description" label="描述" min-width="160"/>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="mini">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="140" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-tooltip v-perm="PERMS.whitelist.update" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-perm="PERMS.whitelist.delete" content="删除" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-delete"
                  class="action-icon is-danger"
                  @click="handleDelete(scope.row)"/>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="请求方法" prop="requestMethod">
          <el-select v-model="form.requestMethod" placeholder="请选择请求方法">
            <el-option label="GET" value="GET"/>
            <el-option label="POST" value="POST"/>
            <el-option label="PUT" value="PUT"/>
            <el-option label="DELETE" value="DELETE"/>
            <el-option label="ALL" value="ALL"/>
          </el-select>
        </el-form-item>
        <el-form-item label="请求地址" prop="requestUri">
          <el-input v-model="form.requestUri" placeholder="请输入请求地址"/>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入描述"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option
              v-for="item in dicts.DATA_STATUS || []"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addWhitelist,
  deleteWhitelist,
  getWhitelistDetail,
  getWhitelistPageList,
  updateWhitelist
} from '@/api/whitelist'
import {PERMS} from '@/utils/permCode'
import {Message} from 'element-ui'
import dictMixin from '@/mixins/dict'

export default {
  name: 'WhitelistPage',
  mixins: [dictMixin],
  data() {
    return {
      loading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        requestMethod: '',
        requestUri: '',
        status: ''
      },
      tableData: [],
      dialogVisible: false,
      dialogTitle: '',
      form: this.getDefaultForm(),
      rules: {
        requestMethod: [{required: true, message: '请选择请求方法', trigger: 'change'}],
        requestUri: [{required: true, message: '请输入请求地址', trigger: 'blur'}]
      },
      PERMS
    }
  },
  created() {
    this.loadDictOptions('DATA_STATUS')
    this.fetchList()
  },
  methods: {
    getDefaultForm() {
      return {
        id: null,
        requestMethod: 'GET',
        requestUri: '',
        description: '',
        status: '0'
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const data = await getWhitelistPageList(this.queryParams)
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
        requestMethod: '',
        requestUri: '',
        status: ''
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
    handleAdd() {
      this.dialogTitle = '新增白名单'
      this.form = this.getDefaultForm()
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
    },
    async handleEdit(row) {
      this.dialogTitle = '编辑白名单'
      try {
        const detail = await getWhitelistDetail(row.id)
        this.form = {
          id: detail.id,
          requestMethod: detail.requestMethod,
          requestUri: detail.requestUri,
          description: detail.description,
          status: detail.status
        }
        this.dialogVisible = true
        this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
      } catch (error) {
        console.error(error)
      }
    },
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) {
          return
        }
        try {
          if (this.form.id) {
            await updateWhitelist(this.form)
            Message.success('修改成功')
          } else {
            await addWhitelist(this.form)
            Message.success('新增成功')
          }
          this.dialogVisible = false
          this.fetchList()
        } catch (error) {
          console.error(error)
        }
      })
    },
    handleDelete(row) {
      this.$confirm(`确认删除白名单 ${row.requestUri} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await deleteWhitelist(row.id)
          Message.success('删除成功')
          this.fetchList()
        })
        .catch(() => {
        })
    },
    statusTagType(value) {
      return value === '0' ? 'success' : 'info'
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
