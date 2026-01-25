<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>角色管理</span>
      </div>

      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="角色名称">
          <el-input v-model="queryParams.roleName" placeholder="角色名称" clearable/>
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="queryParams.roleCode" placeholder="角色编码" clearable/>
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
        <el-button type="primary" size="small" icon="el-icon-plus" v-perm="'system:role:add'" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="roleName" label="角色名称" min-width="140"/>
        <el-table-column prop="roleCode" label="角色编码" min-width="120"/>
        <el-table-column prop="orderNum" label="排序" width="80"/>
        <el-table-column label="数据范围" min-width="120">
          <template slot-scope="scope">
            {{ dataScopeText(scope.row.dataScope) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="mini">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="260" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" v-perm="'system:role:update'" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" v-perm="'system:role:status'" @click="handleStatus(scope.row)">
              {{ scope.row.status === '0' ? '停用' : '启用' }}
            </el-button>
            <el-button size="mini" v-perm="'system:role:perm:list'" @click="openPermDialog(scope.row)">权限配置</el-button>
            <el-button size="mini" v-perm="'system:role:dataScope'" @click="openDataScopeDialog(scope.row)">数据权限</el-button>
            <el-button size="mini" type="danger" v-perm="'system:role:delete'" @click="handleDelete(scope.row)">删除</el-button>
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
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称"/>
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="form.roleCode" placeholder="请输入角色编码"/>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0"/>
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

    <el-dialog title="权限配置" :visible.sync="permDialogVisible" width="600px">
      <el-checkbox-group v-model="permChecked" class="perm-checkbox-group">
        <el-checkbox
          v-for="perm in permOptions"
          :key="perm.permCode"
          :label="perm.permCode">
          {{ perm.permName }} ({{ perm.permCode }})
        </el-checkbox>
      </el-checkbox-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRolePermissions">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog title="数据权限" :visible.sync="dataScopeDialogVisible" width="600px">
      <el-form label-width="100px">
        <el-form-item label="数据范围">
          <el-select v-model="dataScopeForm.dataScope" placeholder="请选择">
            <el-option label="全部数据权限" value="1"/>
            <el-option label="自定数据权限" value="2"/>
            <el-option label="本部门数据权限" value="3"/>
            <el-option label="本部门及以下" value="4"/>
          </el-select>
        </el-form-item>
      </el-form>
      <el-tree
        ref="deptTree"
        :data="deptTreeData"
        node-key="id"
        show-checkbox
        default-expand-all
        :check-strictly="dataScopeForm.deptCheckStrictly === 1"
        :default-checked-keys="deptChecked"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dataScopeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDataScope">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addRole,
  deleteRole,
  getRolePageList,
  updateRole,
  updateRoleStatus,
  getRoleWithDeptTree,
  updateRoleDataScope,
  getRolePermissions,
  assignRolePermissions
} from '@/api/role'
import {getPermissionList} from '@/api/permission'
import {Message} from 'element-ui'
import dictMixin from '@/mixins/dict'

export default {
  name: 'RolePage',
  mixins: [dictMixin],
  data() {
    return {
      loading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleName: '',
        roleCode: '',
        status: ''
      },
      tableData: [],
      dialogVisible: false,
      dialogTitle: '',
      form: this.getDefaultForm(),
      rules: {
        roleName: [{required: true, message: '请输入角色名称', trigger: 'blur'}],
        roleCode: [{required: true, message: '请输入角色编码', trigger: 'blur'}]
      },
      permDialogVisible: false,
      permOptions: [],
      permChecked: [],
      currentRoleId: null,
      dataScopeDialogVisible: false,
      deptTreeData: [],
      deptChecked: [],
      dataScopeForm: {
        id: null,
        dataScope: '1',
        deptCheckStrictly: 1
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
        roleName: '',
        roleCode: '',
        orderNum: 0,
        status: '0',
        remark: ''
      }
    },
    dataScopeText(value) {
      const map = {
        '1': '全部数据',
        '2': '自定数据',
        '3': '本部门',
        '4': '本部门及以下'
      }
      return map[value] || '-'
    },
    async fetchList() {
      this.loading = true
      try {
        const data = await getRolePageList(this.queryParams)
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
        roleName: '',
        roleCode: '',
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
      this.dialogTitle = '新增角色'
      this.form = this.getDefaultForm()
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
    },
    handleEdit(row) {
      this.dialogTitle = '编辑角色'
      this.form = {
        id: row.id,
        roleName: row.roleName,
        roleCode: row.roleCode,
        orderNum: row.orderNum || 0,
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
            await updateRole(this.form)
            Message.success('修改成功')
          } else {
            await addRole(this.form)
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
      this.$confirm(`确认删除角色 ${row.roleName} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await deleteRole(row.id)
          Message.success('删除成功')
          this.fetchList()
        })
        .catch(() => {})
    },
    handleStatus(row) {
      const actionText = row.status === '0' ? '停用' : '启用'
      this.$confirm(`确认${actionText}角色 ${row.roleName} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await updateRoleStatus(row.id)
          Message.success('操作成功')
          this.fetchList()
        })
        .catch(() => {})
    },
    async openPermDialog(row) {
      this.currentRoleId = row.id
      try {
        this.permChecked = await getRolePermissions(row.id)
        this.permDialogVisible = true
      } catch (error) {
        console.error(error)
      }
    },
    async saveRolePermissions() {
      try {
        await assignRolePermissions(this.currentRoleId, this.permChecked)
        Message.success('权限配置成功')
        this.permDialogVisible = false
      } catch (error) {
        console.error(error)
      }
    },
    async openDataScopeDialog(row) {
      try {
        const data = await getRoleWithDeptTree(row.id)
        this.deptTreeData = data.trees || []
        this.deptChecked = data.checkedKeys || []
        this.dataScopeForm = {
          id: row.id,
          dataScope: row.dataScope || '1',
          deptCheckStrictly: row.deptCheckStrictly == null ? 1 : row.deptCheckStrictly
        }
        this.dataScopeDialogVisible = true
        this.$nextTick(() => {
          if (this.$refs.deptTree) {
            this.$refs.deptTree.setCheckedKeys(this.deptChecked)
          }
        })
      } catch (error) {
        console.error(error)
      }
    },
    async saveDataScope() {
      try {
        const checkedKeys = this.$refs.deptTree ? this.$refs.deptTree.getCheckedKeys() : []
        const payload = {
          id: this.dataScopeForm.id,
          dataScope: this.dataScopeForm.dataScope,
          deptIds: checkedKeys,
          deptCheckStrictly: this.dataScopeForm.deptCheckStrictly
        }
        await updateRoleDataScope(payload)
        Message.success('数据权限已更新')
        this.dataScopeDialogVisible = false
        this.fetchList()
      } catch (error) {
        console.error(error)
      }
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

.perm-checkbox-group {
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow: auto;
}
</style>
