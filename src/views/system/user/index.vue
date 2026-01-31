<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>用户管理</span>
      </div>

      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="用户名" clearable/>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="queryParams.phone" placeholder="手机号" clearable/>
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
        <el-form-item label="部门">
          <el-popover
            v-model="deptQueryPopoverVisible"
            placement="bottom-start"
            trigger="click"
            width="280"
            popper-class="dept-tree-popover">
            <div class="dept-tree-search">
              <el-input
                v-model="deptQueryFilter"
                size="small"
                placeholder="搜索部门"
                clearable/>
            </div>
            <div class="dept-tree-panel">
              <el-tree
                ref="deptQueryTree"
                v-loading="deptTreeLoading"
                :data="deptTreeData"
                :props="deptTreeProps"
                node-key="id"
                highlight-current
                :expand-on-click-node="false"
                :filter-node-method="filterDeptNode"
                @node-click="handleDeptQuerySelect"/>
            </div>
            <el-input
              slot="reference"
              v-model="deptQueryLabel"
              placeholder="部门"
              clearable
              readonly
              suffix-icon="el-icon-arrow-down"
              @clear="clearDeptQuery"/>
          </el-popover>
        </el-form-item>
        <el-form-item label="创建时间">
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
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <el-button type="primary" size="small" icon="el-icon-plus" v-perm="'system:user:add'" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="username" label="用户名" min-width="120"/>
        <el-table-column prop="nickname" label="昵称" min-width="120"/>
        <el-table-column prop="deptName" label="部门" min-width="120"/>
        <el-table-column label="角色" min-width="160">
          <template slot-scope="scope">
            <span v-if="scope.row.roleList && scope.row.roleList.length">
              {{ scope.row.roleList.map(item => item.roleName).join('、') }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="140"/>
        <el-table-column prop="email" label="邮箱" min-width="180"/>
        <el-table-column label="状态" min-width="90">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="mini">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="在线" min-width="80">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.online" type="success" size="mini">在线</el-tag>
            <el-tag v-else type="info" size="mini">离线</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录时间" min-width="160"/>
        <el-table-column prop="lastLoginIp" label="最后登录IP" min-width="140"/>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-tooltip v-perm="'system:user:update'" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-perm="'system:user:resetPwd'" content="重置密码" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-key"
                  class="action-icon is-primary"
                  @click="handleResetPwd(scope.row)"/>
              </el-tooltip>
              <el-tooltip
                v-perm="'system:user:status'"
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
              <el-dropdown
                v-if="hasMoreActions(scope.row)"
                trigger="click"
                popper-class="action-dropdown"
                @command="handleActionCommand(scope.row, $event)">
                <span class="action-dropdown-trigger">
                  <el-tooltip content="更多操作" placement="top" popper-class="action-tooltip">
                    <el-button
                      type="text"
                      size="mini"
                      icon="el-icon-more"
                      class="action-icon is-neutral"/>
                  </el-tooltip>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-perm="'system:user:delete'" command="delete" class="danger-item">
                    <span class="danger-dot"></span>
                    删除
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="scope.row.online"
                    v-perm="'system:user:kick'"
                    command="kick"
                    class="danger-item">
                    <span class="danger-dot"></span>
                    踢下线
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="部门" prop="deptId">
          <el-popover
            v-model="deptFormPopoverVisible"
            placement="bottom-start"
            trigger="click"
            width="280"
            popper-class="dept-tree-popover">
            <div class="dept-tree-search">
              <el-input
                v-model="deptFormFilter"
                size="small"
                placeholder="搜索部门"
                clearable/>
            </div>
            <div class="dept-tree-panel">
              <el-tree
                ref="deptFormTree"
                v-loading="deptTreeLoading"
                :data="deptTreeData"
                :props="deptTreeProps"
                node-key="id"
                highlight-current
                :expand-on-click-node="false"
                :filter-node-method="filterDeptNode"
                @node-click="handleDeptFormSelect"/>
            </div>
            <el-input
              slot="reference"
              v-model="deptFormLabel"
              placeholder="请选择部门"
              clearable
              readonly
              suffix-icon="el-icon-arrow-down"
              @clear="clearDeptForm"/>
          </el-popover>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!!form.id"/>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"/>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号"/>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="form.sex">
            <el-radio
              v-for="item in dicts.USER_GENDER || []"
              :key="item.dictValue"
              :label="item.dictValue">
              {{ item.dictLabel }}
            </el-radio>
          </el-radio-group>
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
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="form.roleIds" placeholder="请选择角色" multiple clearable>
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.roleName"
              :value="role.id"/>
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
  addUser,
  deleteUser,
  getUserDetail,
  getUserPageList,
  resetUserPassword,
  updateUser,
  updateUserStatus,
  kickUser
} from '@/api/user'
import {getRolePageList} from '@/api/role'
import {getDeptTree} from '@/api/dept'
import {Message} from 'element-ui'
import dictMixin from '@/mixins/dict'

export default {
  name: 'UserPage',
  mixins: [dictMixin],
  data() {
    return {
      loading: false,
      total: 0,
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        username: '',
        phone: '',
        status: '',
        deptId: ''
      },
      tableData: [],
      roleOptions: [],
      deptTreeData: [],
      deptTreeLoading: false,
      deptTreeProps: {
        children: 'children',
        label: 'label'
      },
      deptQueryLabel: '',
      deptQueryFilter: '',
      deptQueryPopoverVisible: false,
      deptFormLabel: '',
      deptFormFilter: '',
      deptFormPopoverVisible: false,
      dialogVisible: false,
      dialogTitle: '',
      form: this.getDefaultForm(),
      rules: {
        username: [{required: true, message: '请输入用户名', trigger: 'blur'}],
        nickname: [{required: true, message: '请输入昵称', trigger: 'blur'}]
      }
    }
  },
  created() {
    this.loadDictOptions('DATA_STATUS')
    this.loadDictOptions('USER_GENDER')
    this.fetchList()
    this.fetchRoles()
    this.fetchDeptTree()
  },
  watch: {
    deptQueryFilter(value) {
      if (this.$refs.deptQueryTree) {
        this.$refs.deptQueryTree.filter(value)
      }
    },
    deptFormFilter(value) {
      if (this.$refs.deptFormTree) {
        this.$refs.deptFormTree.filter(value)
      }
    }
  },
  methods: {
    getDefaultForm() {
      return {
        id: null,
        deptId: null,
        username: '',
        nickname: '',
        email: '',
        phone: '',
        sex: '0',
        status: '0',
        roleIds: []
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const params = {...this.queryParams}
        if (this.dateRange && this.dateRange.length === 2) {
          params.beginTime = this.dateRange[0]
          params.endTime = this.dateRange[1]
        }
        const data = await getUserPageList(params)
        this.tableData = data.records || []
        this.total = Number(data.total || 0)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async fetchRoles() {
      try {
        const data = await getRolePageList({pageNum: 1, pageSize: 1000})
        this.roleOptions = data.records || []
      } catch (error) {
        console.error(error)
      }
    },
    async fetchDeptTree() {
      this.deptTreeLoading = true
      try {
        const data = await getDeptTree({})
        this.deptTreeData = Array.isArray(data) ? data : []
        this.syncDeptQueryLabel()
        this.syncDeptFormLabel()
      } catch (error) {
        console.error(error)
      } finally {
        this.deptTreeLoading = false
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
        username: '',
        phone: '',
        status: '',
        deptId: ''
      }
      this.deptQueryLabel = ''
      this.deptQueryFilter = ''
      this.deptQueryPopoverVisible = false
      this.$nextTick(() => {
        if (this.$refs.deptQueryTree) {
          this.$refs.deptQueryTree.setCurrentKey(null)
        }
      })
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
      this.dialogTitle = '新增用户'
      this.form = this.getDefaultForm()
      this.deptFormLabel = ''
      this.deptFormFilter = ''
      this.deptFormPopoverVisible = false
      this.dialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
        if (this.$refs.deptFormTree) {
          this.$refs.deptFormTree.setCurrentKey(null)
        }
      })
    },
    async handleEdit(row) {
      this.dialogTitle = '编辑用户'
      try {
        const detail = await getUserDetail(row.id)
        const roleIds = (detail.roleList || []).map(item => item.id)
        this.form = {
          id: detail.id,
          deptId: detail.deptId,
          username: detail.username,
          nickname: detail.nickname,
          email: detail.email,
          phone: detail.phone,
          sex: detail.sex || '0',
          status: detail.status,
          roleIds
        }
        this.deptFormLabel = detail.deptName || this.findDeptLabelById(this.deptTreeData, detail.deptId) || ''
        this.deptFormFilter = ''
        this.deptFormPopoverVisible = false
        this.dialogVisible = true
        this.$nextTick(() => {
          if (this.$refs.formRef) {
            this.$refs.formRef.clearValidate()
          }
          if (this.$refs.deptFormTree) {
            this.$refs.deptFormTree.setCurrentKey(detail.deptId)
          }
        })
      } catch (error) {
        console.error(error)
      }
    },
    filterDeptNode(value, data) {
      const keyword = (value || '').trim()
      if (!keyword) {
        return true
      }
      const label = (data.label || '')
      return label.toLowerCase().includes(keyword.toLowerCase())
    },
    handleDeptQuerySelect(node) {
      this.queryParams.deptId = node.id
      this.deptQueryLabel = node.label
      this.deptQueryPopoverVisible = false
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    handleDeptFormSelect(node) {
      this.form.deptId = node.id
      this.deptFormLabel = node.label
      this.deptFormPopoverVisible = false
    },
    clearDeptQuery() {
      this.queryParams.deptId = ''
      this.deptQueryLabel = ''
      this.deptQueryFilter = ''
      this.deptQueryPopoverVisible = false
      this.$nextTick(() => {
        if (this.$refs.deptQueryTree) {
          this.$refs.deptQueryTree.setCurrentKey(null)
        }
      })
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    clearDeptForm() {
      this.form.deptId = null
      this.deptFormLabel = ''
      this.deptFormFilter = ''
      this.deptFormPopoverVisible = false
      this.$nextTick(() => {
        if (this.$refs.deptFormTree) {
          this.$refs.deptFormTree.setCurrentKey(null)
        }
      })
    },
    syncDeptQueryLabel() {
      if (!this.queryParams.deptId) {
        this.deptQueryLabel = ''
        return
      }
      const label = this.findDeptLabelById(this.deptTreeData, this.queryParams.deptId)
      if (label) {
        this.deptQueryLabel = label
      }
    },
    syncDeptFormLabel() {
      if (!this.form.deptId) {
        this.deptFormLabel = ''
        return
      }
      const label = this.findDeptLabelById(this.deptTreeData, this.form.deptId)
      if (label) {
        this.deptFormLabel = label
      }
    },
    findDeptLabelById(tree = [], id) {
      if (!id) {
        return ''
      }
      for (const node of tree) {
        if (String(node.id) === String(id)) {
          return node.label || ''
        }
        if (node.children && node.children.length) {
          const childLabel = this.findDeptLabelById(node.children, id)
          if (childLabel) {
            return childLabel
          }
        }
      }
      return ''
    },
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) {
          return
        }
        try {
          if (this.form.id) {
            await updateUser(this.form)
            Message.success('修改成功')
          } else {
            await addUser(this.form)
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
      this.$confirm(`确认删除用户 ${row.username} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await deleteUser(row.id)
          Message.success('删除成功')
          this.fetchList()
        })
        .catch(() => {
        })
    },
    handleResetPwd(row) {
      this.$confirm(`确认重置 ${row.username} 的密码吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await resetUserPassword(row.id)
          Message.success('重置成功')
        })
        .catch(() => {
        })
    },
    handleStatus(row) {
      const actionText = row.status === '0' ? '停用' : '启用'
      this.$confirm(`确认${actionText}用户 ${row.username} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await updateUserStatus(row.id)
          Message.success('操作成功')
          this.fetchList()
        })
        .catch(() => {
        })
    },
    handleKick(row) {
      this.$confirm(`确认踢下线用户 ${row.username} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await kickUser(row.id)
          Message.success('已踢下线')
          this.fetchList()
        })
        .catch(() => {
        })
    },
    handleActionCommand(row, command) {
      if (command === 'delete') {
        this.handleDelete(row)
        return
      }
      if (command === 'kick') {
        this.handleKick(row)
      }
    },
    hasMoreActions(row) {
      const permissions = this.$store.state.permission.permissions || []
      const canDelete = permissions.includes('system:user:delete')
      const canKick = permissions.includes('system:user:kick') && row && row.online
      return canDelete || canKick
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

<style>
.dept-tree-popover {
  padding: 8px 10px 10px;
}

.dept-tree-popover .dept-tree-search {
  margin-bottom: 8px;
}

.dept-tree-popover .dept-tree-panel {
  max-height: 260px;
  overflow: auto;
}
</style>
