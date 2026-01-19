<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>资源管理</span>
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
        <el-form-item label="URI">
          <el-input v-model="queryParams.requestUri" placeholder="URI" clearable/>
        </el-form-item>
        <el-form-item label="权限编码">
          <el-input v-model="queryParams.permCode" placeholder="权限编码" clearable/>
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
        <el-button type="primary" size="small" icon="el-icon-plus" v-perm="'system:resource:add'" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="requestMethod" label="请求方法" width="100"/>
        <el-table-column prop="requestUri" label="URI" min-width="220"/>
        <el-table-column prop="permCode" label="权限编码" min-width="200"/>
        <el-table-column prop="remark" label="备注" min-width="160"/>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="mini">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" v-perm="'system:resource:update'" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" v-perm="'system:resource:delete'" @click="handleDelete(scope.row)">删除</el-button>
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
        <el-form-item label="URI" prop="requestUri">
          <el-input v-model="form.requestUri" placeholder="请输入URI"/>
        </el-form-item>
        <el-form-item label="权限编码" prop="permCode">
          <el-select v-model="form.permCode" placeholder="请选择权限编码" filterable>
            <el-option
              v-for="perm in permOptions"
              :key="perm.permCode"
              :label="perm.permName + ' (' + perm.permCode + ')'"
              :value="perm.permCode"/>
          </el-select>
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
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" rows="3"/>
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
  addResource,
  deleteResource,
  getResourceDetail,
  getResourcePageList,
  updateResource
} from '@/api/resource'
import {getPermissionList} from '@/api/permission'
import {Message} from 'element-ui'
import dictMixin from '@/mixins/dict'

export default {
  name: 'ResourcePage',
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
        permCode: '',
        status: ''
      },
      tableData: [],
      permOptions: [],
      dialogVisible: false,
      dialogTitle: '',
      form: this.getDefaultForm(),
      rules: {
        requestMethod: [{required: true, message: '请选择请求方法', trigger: 'change'}],
        requestUri: [{required: true, message: '请输入URI', trigger: 'blur'}],
        permCode: [{required: true, message: '请选择权限编码', trigger: 'change'}]
      }
    }
  },
  created() {
    this.loadDictOptions('DATA_STATUS')
    this.fetchList()
    this.fetchPermissionOptions()
  },
  methods: {
    getDefaultForm() {
      return {
        id: null,
        requestMethod: 'GET',
        requestUri: '',
        permCode: '',
        status: '0',
        remark: ''
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const data = await getResourcePageList(this.queryParams)
        this.tableData = data.records || []
        this.total = Number(data.total || 0)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async fetchPermissionOptions() {
      try {
        this.permOptions = await getPermissionList({})
      } catch (error) {
        console.error(error)
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
        permCode: '',
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
      this.dialogTitle = '新增资源'
      this.form = this.getDefaultForm()
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
    },
    async handleEdit(row) {
      this.dialogTitle = '编辑资源'
      try {
        const detail = await getResourceDetail(row.id)
        this.form = {
          id: detail.id,
          requestMethod: detail.requestMethod,
          requestUri: detail.requestUri,
          permCode: detail.permCode,
          status: detail.status,
          remark: detail.remark
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
            await updateResource(this.form)
            Message.success('修改成功')
          } else {
            await addResource(this.form)
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
      this.$confirm(`确认删除资源 ${row.requestUri} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await deleteResource(row.id)
          Message.success('删除成功')
          this.fetchList()
        })
        .catch(() => {})
    },
    statusTagType(value) {
      return value === '0' ? 'success' : 'info'
    }
  }
}
</script>

<style scoped>
.page-container {
  padding: 10px;
}

.card-header {
  font-weight: 600;
}

.search-form {
  margin-bottom: 10px;
}

.table-toolbar {
  margin: 10px 0;
}

.page-pagination {
  margin-top: 12px;
  text-align: right;
}
</style>
