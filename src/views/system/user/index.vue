<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>

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
            v-model:visible="deptQueryPopoverVisible"
            placement="bottom-start"
            trigger="click"
            :width="280"
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
                ref="deptQueryTreeRef"
                v-loading="deptTreeLoading"
                :data="deptTreeData"
                :props="deptTreeProps"
                node-key="id"
                highlight-current
                :expand-on-click-node="false"
                :filter-node-method="filterDeptNode"
                @node-click="handleDeptQuerySelect"/>
            </div>
            <template #reference>
              <el-input
                v-model="deptQueryLabel"
                placeholder="部门"
                readonly
              >
                <template #suffix>
                  <span class="dept-query-suffix">
                    <el-icon
                      v-if="deptQueryLabel"
                      class="dept-query-clear"
                      @click.stop="clearDeptQuery"><CircleCloseFilled /></el-icon>
                    <el-icon class="dept-query-arrow"><ArrowDown /></el-icon>
                  </span>
                </template>
              </el-input>
            </template>
          </el-popover>
        </el-form-item>
        <el-form-item label="创建时间">
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
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <el-button type="primary" size="small" icon="Plus" v-perm="PERMS.user.add" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="username" label="用户名" min-width="120"/>
        <el-table-column prop="nickname" label="昵称" min-width="120"/>
        <el-table-column prop="deptName" label="部门" min-width="120"/>
        <el-table-column label="角色" min-width="160">
          <template #default="scope">
            <span v-if="scope.row.roleList && scope.row.roleList.length">
              {{ scope.row.roleList.map((item: any) => item.roleName).join('、') }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="140"/>
        <el-table-column prop="email" label="邮箱" min-width="180"/>
        <el-table-column label="状态" min-width="90">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="在线" min-width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.online" type="success" size="small">在线</el-tag>
            <el-tag v-else type="info" size="small">离线</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录时间" min-width="160"/>
        <el-table-column prop="lastLoginIp" label="最后登录IP" min-width="140"/>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip v-if="hasPerm(PERMS.user.update)" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-if="hasPerm(PERMS.user.resetPwd)" content="重置密码" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Key"
                  class="action-icon is-primary"
                  @click="handleResetPwd(scope.row)"/>
              </el-tooltip>
              <el-tooltip
                v-if="hasPerm(PERMS.user.status)"
                :content="scope.row.status === '0' ? '停用' : '启用'"
                placement="top"
                popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  :icon="scope.row.status === '0' ? Close : Check"
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
                      size="small"
                      icon="MoreFilled"
                      class="action-icon is-neutral"/>
                  </el-tooltip>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="hasPerm(PERMS.user.delete)" command="delete" class="danger-item">
                      <span class="danger-dot"></span>
                      删除
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="scope.row.online && hasPerm(PERMS.user.kick)"
                      command="kick"
                      class="danger-item">
                      <span class="danger-dot"></span>
                      踢下线
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="部门" prop="deptId">
          <el-popover
            v-model:visible="deptFormPopoverVisible"
            placement="bottom-start"
            trigger="click"
            :width="280"
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
                ref="deptFormTreeRef"
                v-loading="deptTreeLoading"
                :data="deptTreeData"
                :props="deptTreeProps"
                node-key="id"
                highlight-current
                :expand-on-click-node="false"
                :filter-node-method="filterDeptNode"
                @node-click="handleDeptFormSelect"/>
            </div>
            <template #reference>
              <el-input
                v-model="deptFormLabel"
                placeholder="请选择部门"
                clearable
                readonly
                suffix-icon="ArrowDown"
                @clear="clearDeptForm"/>
            </template>
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
              :value="item.dictValue">
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
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
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
import { getRolePageList } from '@/api/role'
import { getDeptTree } from '@/api/dept'
import { PERMS } from '@/utils/permCode'
import { usePermission } from '@/composables/usePermission'
import { useDict } from '@/composables/useDict'
import { usePermissionStore } from '@/stores/permission'
import { Close, Check } from '@element-plus/icons-vue'

const { dicts, loadDictOptions, dictLabel } = useDict()
const { hasPerm } = usePermission()
const permissionStore = usePermissionStore()

const loading = ref(false)
const total = ref(0)
const dateRange = ref<string[]>([])
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  username: '',
  phone: '',
  status: '',
  deptId: ''
})
const tableData = ref<any[]>([])
const roleOptions = ref<any[]>([])
const deptTreeData = ref<any[]>([])
const deptTreeLoading = ref(false)
const deptTreeProps = { children: 'children', label: 'label' }
const deptQueryLabel = ref('')
const deptQueryFilter = ref('')
const deptQueryPopoverVisible = ref(false)
const deptFormLabel = ref('')
const deptFormFilter = ref('')
const deptFormPopoverVisible = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')

const deptQueryTreeRef = ref<InstanceType<any>>()
const deptFormTreeRef = ref<InstanceType<any>>()
const formRef = ref<FormInstance>()

function getDefaultForm() {
  return {
    id: null as number | null,
    deptId: null as number | null,
    username: '',
    nickname: '',
    email: '',
    phone: '',
    sex: '0',
    status: '0',
    roleIds: [] as number[]
  }
}

const form = ref(getDefaultForm())

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
}

watch(deptQueryFilter, (value) => {
  deptQueryTreeRef.value?.filter(value)
})

watch(deptFormFilter, (value) => {
  deptFormTreeRef.value?.filter(value)
})

async function fetchList() {
  loading.value = true
  try {
    const params: any = { ...queryParams.value }
    if (dateRange.value && dateRange.value.length === 2) {
      params.beginTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    const data = await getUserPageList(params)
    tableData.value = data.records || []
    total.value = Number(data.total || 0)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function fetchRoles() {
  try {
    const data = await getRolePageList({ pageNum: 1, pageSize: 1000 })
    roleOptions.value = data.records || []
  } catch (error) {
    console.error(error)
  }
}

async function fetchDeptTree() {
  deptTreeLoading.value = true
  try {
    const data = await getDeptTree({})
    deptTreeData.value = Array.isArray(data) ? data : []
    syncDeptQueryLabel()
    syncDeptFormLabel()
  } catch (error) {
    console.error(error)
  } finally {
    deptTreeLoading.value = false
  }
}

function handleSearch() {
  queryParams.value.pageNum = 1
  fetchList()
}

function handleReset() {
  dateRange.value = []
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    username: '',
    phone: '',
    status: '',
    deptId: ''
  }
  deptQueryLabel.value = ''
  deptQueryFilter.value = ''
  deptQueryPopoverVisible.value = false
  nextTick(() => {
    deptQueryTreeRef.value?.setCurrentKey(null)
  })
  fetchList()
}

function handlePageChange(page: number) {
  queryParams.value.pageNum = page
  fetchList()
}

function handleSizeChange(size: number) {
  queryParams.value.pageSize = size
  queryParams.value.pageNum = 1
  fetchList()
}

function handleAdd() {
  dialogTitle.value = '新增用户'
  form.value = getDefaultForm()
  deptFormLabel.value = ''
  deptFormFilter.value = ''
  deptFormPopoverVisible.value = false
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
    deptFormTreeRef.value?.setCurrentKey(null)
  })
}

async function handleEdit(row: any) {
  dialogTitle.value = '编辑用户'
  try {
    const detail = await getUserDetail(row.id)
    const roleIds = (detail.roleList || []).map((item: any) => item.id)
    form.value = {
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
    deptFormLabel.value = detail.deptName || findDeptLabelById(deptTreeData.value, detail.deptId) || ''
    deptFormFilter.value = ''
    deptFormPopoverVisible.value = false
    dialogVisible.value = true
    nextTick(() => {
      formRef.value?.clearValidate()
      deptFormTreeRef.value?.setCurrentKey(detail.deptId)
    })
  } catch (error) {
    console.error(error)
  }
}

function filterDeptNode(value: string, data: any) {
  const keyword = (value || '').trim()
  if (!keyword) {
    return true
  }
  const label = (data.label || '')
  return label.toLowerCase().includes(keyword.toLowerCase())
}

function handleDeptQuerySelect(node: any) {
  queryParams.value.deptId = node.id
  deptQueryLabel.value = node.label
  deptQueryPopoverVisible.value = false
  queryParams.value.pageNum = 1
  fetchList()
}

function handleDeptFormSelect(node: any) {
  form.value.deptId = node.id
  deptFormLabel.value = node.label
  deptFormPopoverVisible.value = false
}

function clearDeptQuery() {
  queryParams.value.deptId = ''
  deptQueryLabel.value = ''
  deptQueryFilter.value = ''
  deptQueryPopoverVisible.value = false
  nextTick(() => {
    deptQueryTreeRef.value?.setCurrentKey(null)
  })
  queryParams.value.pageNum = 1
  fetchList()
}

function clearDeptForm() {
  form.value.deptId = null
  deptFormLabel.value = ''
  deptFormFilter.value = ''
  deptFormPopoverVisible.value = false
  nextTick(() => {
    deptFormTreeRef.value?.setCurrentKey(null)
  })
}

function syncDeptQueryLabel() {
  if (!queryParams.value.deptId) {
    deptQueryLabel.value = ''
    return
  }
  const label = findDeptLabelById(deptTreeData.value, queryParams.value.deptId)
  if (label) {
    deptQueryLabel.value = label
  }
}

function syncDeptFormLabel() {
  if (!form.value.deptId) {
    deptFormLabel.value = ''
    return
  }
  const label = findDeptLabelById(deptTreeData.value, form.value.deptId)
  if (label) {
    deptFormLabel.value = label
  }
}

function findDeptLabelById(tree: any[] = [], id: any): string {
  if (!id) {
    return ''
  }
  for (const node of tree) {
    if (String(node.id) === String(id)) {
      return node.label || ''
    }
    if (node.children && node.children.length) {
      const childLabel = findDeptLabelById(node.children, id)
      if (childLabel) {
        return childLabel
      }
    }
  }
  return ''
}

function submitForm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      if (form.value.id) {
        await updateUser(form.value)
        ElMessage.success('修改成功')
      } else {
        await addUser(form.value)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      fetchList()
    } catch (error) {
      console.error(error)
    }
  })
}

function handleDelete(row: any) {
  ElMessageBox.confirm(`确认删除用户 ${row.username} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      fetchList()
    })
    .catch(() => {
    })
}

function handleResetPwd(row: any) {
  ElMessageBox.confirm(`确认重置 ${row.username} 的密码吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await resetUserPassword(row.id)
      ElMessage.success('重置成功')
    })
    .catch(() => {
    })
}

function handleStatus(row: any) {
  const actionText = row.status === '0' ? '停用' : '启用'
  ElMessageBox.confirm(`确认${actionText}用户 ${row.username} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await updateUserStatus(row.id)
      ElMessage.success('操作成功')
      fetchList()
    })
    .catch(() => {
    })
}

function handleKick(row: any) {
  ElMessageBox.confirm(`确认踢下线用户 ${row.username} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await kickUser(row.id)
      ElMessage.success('已踢下线')
      fetchList()
    })
    .catch(() => {
    })
}

function handleActionCommand(row: any, command: string) {
  if (command === 'delete') {
    handleDelete(row)
    return
  }
  if (command === 'kick') {
    handleKick(row)
  }
}

function hasMoreActions(row: any) {
  const permissions = permissionStore.permissions || []
  const canDelete = permissions.includes(PERMS.user.delete)
  const canKick = permissions.includes(PERMS.user.kick) && row && row.online
  return canDelete || canKick
}

function statusTagType(value: string) {
  return value === '0' ? 'success' : 'info'
}

// created
loadDictOptions('DATA_STATUS')
loadDictOptions('USER_GENDER')
fetchList()
fetchRoles()
fetchDeptTree()
</script>

<style scoped>

.page-pagination {
  margin-top: 12px;
  text-align: right;
}
</style>
