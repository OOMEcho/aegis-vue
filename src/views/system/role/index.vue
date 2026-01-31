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
        <el-button type="primary" size="small" icon="el-icon-plus" v-perm="PERMS.role.add" @click="handleAdd">
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
        <el-table-column label="操作" min-width="220" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-tooltip v-perm="PERMS.role.update" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip
                v-perm="PERMS.role.status"
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
              <el-tooltip v-perm="PERMS.role.permList" content="权限配置" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-lock"
                  class="action-icon is-primary"
                  @click="openPermDialog(scope.row)"/>
              </el-tooltip>
              <el-dropdown
                v-perm="[PERMS.role.dataScope, PERMS.role.delete]"
                trigger="click"
                popper-class="action-dropdown">
                <span class="action-dropdown-trigger">
                  <el-tooltip content="更多操作" placement="top" popper-class="action-tooltip">
                    <el-button type="text" size="mini" icon="el-icon-more" class="action-icon is-neutral"/>
                  </el-tooltip>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-perm="PERMS.role.dataScope" @click.native="openDataScopeDialog(scope.row)">
                    数据权限
                  </el-dropdown-item>
                  <el-dropdown-item v-perm="PERMS.role.delete" class="danger-item" @click.native="handleDelete(scope.row)">
                    <span class="danger-dot"></span>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
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

    <el-dialog title="权限配置" :visible.sync="permDialogVisible" width="680px">
      <div class="perm-dialog">
        <div class="perm-toolbar">
          <el-input
            v-model="permKeyword"
            placeholder="搜索权限名称或编码"
            size="small"
            clearable
            prefix-icon="el-icon-search"/>
        </div>
        <el-collapse v-model="permCollapseActive" class="perm-collapse">
          <el-collapse-item name="M">
            <template slot="title">
              <div class="perm-collapse-title">
                <i class="el-icon-document"></i>
                <span>页面</span>
                <span class="perm-count">{{ permGroupStats.M.total }}</span>
                <span v-if="permGroupStats.M.checked" class="perm-selected">已选 {{ permGroupStats.M.checked }}</span>
              </div>
            </template>
            <div class="perm-group">
              <div class="perm-group-actions">
                <el-button type="text" size="mini" :disabled="!permGroupStats.M.total" @click="selectPermGroup('M')">全选</el-button>
                <el-button type="text" size="mini" :disabled="!permGroupStats.M.total" @click="clearPermGroup('M')">清空</el-button>
              </div>
              <el-checkbox-group v-model="permChecked" class="perm-grid">
                <el-checkbox
                  v-for="perm in permGrouped.M"
                  :key="perm.permCode"
                  :label="perm.permCode">
                  <span class="perm-name">{{ perm.permName }}</span>
                  <span class="perm-code">{{ perm.permCode }}</span>
                </el-checkbox>
              </el-checkbox-group>
              <div v-if="!permGrouped.M.length" class="perm-empty">暂无匹配权限</div>
            </div>
          </el-collapse-item>
          <el-collapse-item name="B">
            <template slot="title">
              <div class="perm-collapse-title">
                <i class="el-icon-s-operation"></i>
                <span>按钮</span>
                <span class="perm-count">{{ permGroupStats.B.total }}</span>
                <span v-if="permGroupStats.B.checked" class="perm-selected">已选 {{ permGroupStats.B.checked }}</span>
              </div>
            </template>
            <div class="perm-group">
              <div class="perm-group-actions">
                <el-button type="text" size="mini" :disabled="!permGroupStats.B.total" @click="selectPermGroup('B')">全选</el-button>
                <el-button type="text" size="mini" :disabled="!permGroupStats.B.total" @click="clearPermGroup('B')">清空</el-button>
              </div>
              <el-checkbox-group v-model="permChecked" class="perm-grid">
                <el-checkbox
                  v-for="perm in permGrouped.B"
                  :key="perm.permCode"
                  :label="perm.permCode">
                  <span class="perm-name">{{ perm.permName }}</span>
                  <span class="perm-code">{{ perm.permCode }}</span>
                </el-checkbox>
              </el-checkbox-group>
              <div v-if="!permGrouped.B.length" class="perm-empty">暂无匹配权限</div>
            </div>
          </el-collapse-item>
          <el-collapse-item name="A">
            <template slot="title">
              <div class="perm-collapse-title">
                <i class="el-icon-link"></i>
                <span>API</span>
                <span class="perm-count">{{ permGroupStats.A.total }}</span>
                <span v-if="permGroupStats.A.checked" class="perm-selected">已选 {{ permGroupStats.A.checked }}</span>
              </div>
            </template>
            <div class="perm-group">
              <div class="perm-group-actions">
                <el-button type="text" size="mini" :disabled="!permGroupStats.A.total" @click="selectPermGroup('A')">全选</el-button>
                <el-button type="text" size="mini" :disabled="!permGroupStats.A.total" @click="clearPermGroup('A')">清空</el-button>
              </div>
              <el-checkbox-group v-model="permChecked" class="perm-grid">
                <el-checkbox
                  v-for="perm in permGrouped.A"
                  :key="perm.permCode"
                  :label="perm.permCode">
                  <span class="perm-name">{{ perm.permName }}</span>
                  <span class="perm-code">{{ perm.permCode }}</span>
                </el-checkbox>
              </el-checkbox-group>
              <div v-if="!permGrouped.A.length" class="perm-empty">暂无匹配权限</div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRolePermissions">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog title="分配数据权限" :visible.sync="dataScopeDialogVisible" width="600px">
      <el-form label-width="100px">
        <el-form-item label="数据范围">
          <el-select v-model="dataScopeForm.dataScope" placeholder="请选择">
            <el-option label="全部数据权限" value="1"/>
            <el-option label="自定数据权限" value="2"/>
            <el-option label="本部门数据权限" value="3"/>
            <el-option label="本部门及以下" value="4"/>
            <el-option label="仅本人数据权限" value="5"/>
          </el-select>
        </el-form-item>
        <el-form-item v-if="dataScopeForm.dataScope === '2'" label="数据权限">
          <div class="data-scope-box">
            <div class="data-scope-toolbar">
              <el-checkbox v-model="dataScopeExpandAll" @change="handleExpandChange">展开/折叠</el-checkbox>
              <el-checkbox
                v-model="dataScopeCheckAll"
                :indeterminate="dataScopeCheckHalf"
                @change="handleCheckAllChange">
                全选/全不选
              </el-checkbox>
              <el-checkbox v-model="parentChildLink">父子联动</el-checkbox>
            </div>
            <el-tree
              ref="deptTree"
              :data="deptTreeData"
              node-key="id"
              show-checkbox
              :default-expand-all="dataScopeExpandAll"
        :check-strictly="dataScopeForm.deptCheckStrictly !== 1"
              :default-checked-keys="deptChecked"
              @check-change="handleDeptCheckChange"/>
          </div>
        </el-form-item>
      </el-form>
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
import {PERMS} from '@/utils/permCode'
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
      permKeyword: '',
      permCollapseActive: ['M'],
      currentRoleId: null,
      dataScopeDialogVisible: false,
      deptTreeData: [],
      deptChecked: [],
      dataScopeExpandAll: true,
      dataScopeCheckAll: false,
      dataScopeCheckHalf: false,
      dataScopeForm: {
        id: null,
        dataScope: '1',
        deptCheckStrictly: 1
      },
      PERMS
    }
  },
  computed: {
    parentChildLink: {
      get() {
        return this.dataScopeForm.deptCheckStrictly === 1
      },
      set(value) {
        this.dataScopeForm.deptCheckStrictly = value ? 1 : 0
      }
    },
    filteredPermOptions() {
      const keyword = this.permKeyword.trim().toLowerCase()
      if (!keyword) {
        return this.permOptions
      }
      return this.permOptions.filter(item => {
        const name = (item.permName || '').toLowerCase()
        const code = (item.permCode || '').toLowerCase()
        return name.includes(keyword) || code.includes(keyword)
      })
    },
    permGrouped() {
      const groups = {M: [], B: [], A: []}
      this.filteredPermOptions.forEach(item => {
        const type = item.permType || 'M'
        if (groups[type]) {
          groups[type].push(item)
        }
      })
      return groups
    },
    permGroupStats() {
      const checkedSet = new Set(this.permChecked || [])
      const stats = {M: {total: 0, checked: 0}, B: {total: 0, checked: 0}, A: {total: 0, checked: 0}}
      Object.keys(stats).forEach(type => {
        const list = this.permGrouped[type] || []
        stats[type].total = list.length
        stats[type].checked = list.reduce((count, item) => count + (checkedSet.has(item.permCode) ? 1 : 0), 0)
      })
      return stats
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
        '4': '本部门及以下',
        '5': '仅本人数据权限'
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
        .catch(() => {
        })
    },
    handleStatus(row) {
      const actionText = row.status === '0' ? '停用' : '启用'
      this.$confirm(`确认${actionText}角色 ${row.roleName} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await updateRoleStatus(row.id)
          Message.success('操作成功')
          this.fetchList()
        })
        .catch(() => {
        })
    },
    async openPermDialog(row) {
      this.currentRoleId = row.id
      try {
        this.permChecked = await getRolePermissions(row.id)
        this.permKeyword = ''
        this.permCollapseActive = ['M']
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
    selectPermGroup(type) {
      const list = this.permGrouped[type] || []
      const next = new Set(this.permChecked || [])
      list.forEach(item => next.add(item.permCode))
      this.permChecked = Array.from(next)
    },
    clearPermGroup(type) {
      const list = this.permGrouped[type] || []
      const next = new Set(this.permChecked || [])
      list.forEach(item => next.delete(item.permCode))
      this.permChecked = Array.from(next)
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
        this.dataScopeExpandAll = true
        this.dataScopeDialogVisible = true
        this.$nextTick(() => {
          if (this.$refs.deptTree) {
            this.$refs.deptTree.setCheckedKeys(this.deptChecked)
            this.updateTreeExpand(true)
            this.updateCheckAllState()
          }
        })
      } catch (error) {
        console.error(error)
      }
    },
    async saveDataScope() {
      try {
        const tree = this.$refs.deptTree
        const checkedKeys = tree ? tree.getCheckedKeys() : []
        const halfCheckedKeys = tree ? tree.getHalfCheckedKeys() : []
        const deptIds = this.dataScopeForm.deptCheckStrictly === 1
          ? Array.from(new Set([...checkedKeys, ...halfCheckedKeys]))
          : checkedKeys
        const payload = {
          id: this.dataScopeForm.id,
          dataScope: this.dataScopeForm.dataScope,
          deptIds,
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
    handleExpandChange(value) {
      this.dataScopeExpandAll = value
      this.updateTreeExpand(value)
    },
    handleCheckAllChange(value) {
      const tree = this.$refs.deptTree
      if (!tree) {
        return
      }
      if (value) {
        const allKeys = this.collectDeptIds(this.deptTreeData)
        tree.setCheckedKeys(allKeys)
        this.dataScopeCheckHalf = false
      } else {
        tree.setCheckedKeys([])
        this.dataScopeCheckHalf = false
      }
    },
    handleDeptCheckChange() {
      this.updateCheckAllState()
    },
    updateCheckAllState() {
      const tree = this.$refs.deptTree
      if (!tree) {
        this.dataScopeCheckAll = false
        this.dataScopeCheckHalf = false
        return
      }
      const checkedKeys = tree.getCheckedKeys() || []
      const allKeys = this.collectDeptIds(this.deptTreeData)
      if (allKeys.length === 0) {
        this.dataScopeCheckAll = false
        this.dataScopeCheckHalf = false
        return
      }
      this.dataScopeCheckAll = checkedKeys.length === allKeys.length
      this.dataScopeCheckHalf = checkedKeys.length > 0 && checkedKeys.length < allKeys.length
    },
    updateTreeExpand(expand) {
      const tree = this.$refs.deptTree
      if (!tree || !tree.store) {
        return
      }
      const nodes = typeof tree.store._getAllNodes === 'function'
        ? tree.store._getAllNodes()
        : Object.values(tree.store.nodesMap || {})
      nodes.forEach(node => {
        node.expanded = !!expand
      })
    },
    collectDeptIds(tree = []) {
      const ids = []
      const walk = nodes => {
        nodes.forEach(node => {
          ids.push(node.id)
          if (node.children && node.children.length) {
            walk(node.children)
          }
        })
      }
      walk(tree)
      return ids
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

.perm-dialog {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.perm-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.perm-toolbar-hint {
  color: #8b97ad;
  font-size: 12px;
}

.perm-collapse {
  border: none;
}

.perm-collapse-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1f2d3d;
  font-weight: 600;
}

.perm-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #eef3ff;
  color: #4f70ff;
  font-size: 12px;
  font-weight: 500;
}

.perm-selected {
  font-size: 12px;
  color: #8b97ad;
}

.perm-group {
  background: #f8faff;
  border: 1px solid #e1e8ff;
  border-radius: 12px;
  padding: 12px;
}

.perm-group-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 10px;
}

.perm-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.perm-grid .el-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  white-space: normal;
}

.perm-name {
  font-size: 13px;
  color: #1f2d3d;
}

.perm-code {
  display: inline-block;
  margin-left: 6px;
  font-size: 12px;
  color: #8b97ad;
}

.perm-empty {
  padding: 12px 0 4px;
  text-align: center;
  color: #9aa6bf;
  font-size: 12px;
}

.data-scope-box {
  border: 1px solid #e1e8ff;
  border-radius: 12px;
  padding: 10px 12px 12px;
  background: #f8faff;
}

.data-scope-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}
</style>
