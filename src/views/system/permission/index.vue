<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>权限管理</span>
      </div>

      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="权限名称">
          <el-input v-model="queryParams.permName" placeholder="权限名称" clearable/>
        </el-form-item>
        <el-form-item label="权限编码">
          <el-input v-model="queryParams.permCode" placeholder="权限编码" clearable/>
        </el-form-item>
        <el-form-item label="权限类型">
          <el-select v-model="queryParams.permType" placeholder="权限类型" clearable>
            <el-option label="页面" value="M"/>
            <el-option label="按钮" value="B"/>
            <el-option label="API" value="A"/>
          </el-select>
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
        <el-button type="primary" size="small" icon="el-icon-plus" v-perm="PERMS.permission.add" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="permName" label="权限名称" min-width="160"/>
        <el-table-column prop="permCode" label="权限编码" min-width="200"/>
        <el-table-column label="类型" width="80">
          <template slot-scope="scope">
            {{ permTypeText(scope.row.permType) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160"/>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="mini">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-tooltip v-perm="PERMS.permission.update" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip
                v-perm="PERMS.permission.effective"
                :content="scope.row.status === '0' ? '停用' : '启用'"
                placement="top"
                popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  :icon="scope.row.status === '0' ? 'el-icon-close' : 'el-icon-check'"
                  :class="['action-icon', scope.row.status === '0' ? 'is-warning' : 'is-success']"
                  @click="handleStatus(scope.row)"/>
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
        <el-form-item label="权限名称" prop="permName">
          <el-input v-model="form.permName" placeholder="请输入权限名称"/>
        </el-form-item>
        <el-form-item label="权限编码" prop="permCode">
          <el-input v-model="form.permCode" placeholder="请输入权限编码"/>
        </el-form-item>
        <el-form-item label="权限类型" prop="permType">
          <el-select v-model="form.permType" placeholder="请选择权限类型">
            <el-option label="页面" value="M"/>
            <el-option label="按钮" value="B"/>
            <el-option label="API" value="A"/>
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
  addPermission,
  effectivePermission,
  getPermissionPageList,
  updatePermission
} from '@/api/permission'
import {PERMS} from '@/utils/permCode'
import {Message} from 'element-ui'
import dictMixin from '@/mixins/dict'

export default {
  name: 'PermissionPage',
  mixins: [dictMixin],
  data() {
    return {
      loading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        permName: '',
        permCode: '',
        permType: '',
        status: ''
      },
      tableData: [],
      dialogVisible: false,
      dialogTitle: '',
      form: this.getDefaultForm(),
      rules: {
        permName: [{required: true, message: '请输入权限名称', trigger: 'blur'}],
        permCode: [{required: true, message: '请输入权限编码', trigger: 'blur'}],
        permType: [{required: true, message: '请选择权限类型', trigger: 'change'}]
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
        permName: '',
        permCode: '',
        permType: 'A',
        status: '0',
        remark: ''
      }
    },
    permTypeText(type) {
      const map = {M: '页面', B: '按钮', A: 'API'}
      return map[type] || type
    },
    async fetchList() {
      this.loading = true
      try {
        const data = await getPermissionPageList(this.queryParams)
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
        permName: '',
        permCode: '',
        permType: '',
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
      this.dialogTitle = '新增权限'
      this.form = this.getDefaultForm()
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
    },
    handleEdit(row) {
      this.dialogTitle = '编辑权限'
      this.form = {
        id: row.id,
        permName: row.permName,
        permCode: row.permCode,
        permType: row.permType,
        status: row.status,
        remark: row.remark
      }
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
    },
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) {
          return
        }
        try {
          if (this.form.id) {
            await updatePermission(this.form)
            Message.success('修改成功')
          } else {
            await addPermission(this.form)
            Message.success('新增成功')
          }
          this.dialogVisible = false
          this.fetchList()
        } catch (error) {
          console.error(error)
        }
      })
    },
    handleStatus(row) {
      const actionText = row.status === '0' ? '停用' : '启用'
      this.$confirm(`确认${actionText}权限 ${row.permName} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await effectivePermission(row.id)
          Message.success('操作成功')
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
