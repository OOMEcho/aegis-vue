<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
        </div>
      </template>

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
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <el-button type="primary" size="small" icon="Plus" v-perm="PERMS.role.add" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="roleName" label="角色名称" min-width="140"/>
        <el-table-column prop="roleCode" label="角色编码" min-width="120"/>
        <el-table-column prop="orderNum" label="排序" width="80"/>
        <el-table-column label="数据范围" min-width="120">
          <template #default="scope">
            {{ dataScopeText(scope.row.dataScope) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="220" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip v-if="hasPerm(PERMS.role.update)" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip
                v-if="hasPerm(PERMS.role.status)"
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
              <el-tooltip v-if="hasPerm(PERMS.role.permList)" content="权限配置" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Lock"
                  class="action-icon is-primary"
                  @click="openPermDialog(scope.row)"/>
              </el-tooltip>
              <el-dropdown
                v-if="hasPerm([PERMS.role.assignUser, PERMS.role.dataScope, PERMS.role.delete])"
                trigger="click"
                popper-class="action-dropdown">
                <span class="action-dropdown-trigger">
                  <el-tooltip content="更多操作" placement="top" popper-class="action-tooltip">
                    <el-button type="text" size="small" icon="MoreFilled" class="action-icon is-neutral"/>
                  </el-tooltip>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="hasPerm(PERMS.role.assignUser)" @click="openAssignUser(scope.row)">
                      分配用户
                    </el-dropdown-item>
                    <el-dropdown-item v-if="hasPerm(PERMS.role.dataScope)" @click="openDataScopeDialog(scope.row)">
                      数据权限
                    </el-dropdown-item>
                    <el-dropdown-item v-if="hasPerm(PERMS.role.delete)" class="danger-item" @click="handleDelete(scope.row)">
                      <span class="danger-dot"></span>
                      删除
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="520px">
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
          <el-input v-model="form.remark" type="textarea" :rows="3"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="权限配置" v-model="permDialogVisible" width="680px">
      <div class="perm-dialog">
        <div class="perm-toolbar">
          <el-input
            v-model="permKeyword"
            placeholder="搜索权限名称或编码"
            size="small"
            clearable
            prefix-icon="Search"/>
        </div>
        <el-collapse v-model="permCollapseActive" class="perm-collapse">
          <el-collapse-item name="M">
            <template #title>
              <div class="perm-collapse-title">
                <el-icon><Document /></el-icon>
                <span>页面</span>
                <span class="perm-count">{{ permGroupStats.M.total }}</span>
                <span v-if="permGroupStats.M.checked" class="perm-selected">已选 {{ permGroupStats.M.checked }}</span>
              </div>
            </template>
            <div class="perm-group">
              <div class="perm-group-actions">
                <el-button type="text" size="small" :disabled="!permGroupStats.M.total" @click="selectPermGroup('M')">全选</el-button>
                <el-button type="text" size="small" :disabled="!permGroupStats.M.total" @click="clearPermGroup('M')">清空</el-button>
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
            <template #title>
              <div class="perm-collapse-title">
                <el-icon><Operation /></el-icon>
                <span>按钮</span>
                <span class="perm-count">{{ permGroupStats.B.total }}</span>
                <span v-if="permGroupStats.B.checked" class="perm-selected">已选 {{ permGroupStats.B.checked }}</span>
              </div>
            </template>
            <div class="perm-group">
              <div class="perm-group-actions">
                <el-button type="text" size="small" :disabled="!permGroupStats.B.total" @click="selectPermGroup('B')">全选</el-button>
                <el-button type="text" size="small" :disabled="!permGroupStats.B.total" @click="clearPermGroup('B')">清空</el-button>
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
            <template #title>
              <div class="perm-collapse-title">
                <el-icon><Link /></el-icon>
                <span>API</span>
                <span class="perm-count">{{ permGroupStats.A.total }}</span>
                <span v-if="permGroupStats.A.checked" class="perm-selected">已选 {{ permGroupStats.A.checked }}</span>
              </div>
            </template>
            <div class="perm-group">
              <div class="perm-group-actions">
                <el-button type="text" size="small" :disabled="!permGroupStats.A.total" @click="selectPermGroup('A')">全选</el-button>
                <el-button type="text" size="small" :disabled="!permGroupStats.A.total" @click="clearPermGroup('A')">清空</el-button>
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
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRolePermissions">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="分配数据权限" v-model="dataScopeDialogVisible" width="600px">
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
              ref="deptTreeRef"
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
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dataScopeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveDataScope">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :title="assignDialogTitle" v-model="assignDialogVisible" width="900px">
      <el-tabs v-model="assignActiveTab" @tab-click="handleAssignTabClick">
        <el-tab-pane label="已分配" name="allocated">
          <div class="assign-toolbar">
            <el-form :inline="true" :model="allocatedQuery" size="small">
              <el-form-item label="用户名">
                <el-input v-model="allocatedQuery.username" placeholder="用户名" clearable/>
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="allocatedQuery.phone" placeholder="手机号" clearable/>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleAllocatedSearch">查询</el-button>
                <el-button icon="Refresh" @click="handleAllocatedReset">重置</el-button>
                <el-button
                  type="danger"
                  icon="Close"
                  :disabled="!allocatedSelection.length"
                  @click="handleCancelAuthAll">
                  批量取消
                </el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table
            :data="allocatedList"
            border
            stripe
            v-loading="allocatedLoading"
            @selection-change="handleAllocatedSelectionChange">
            <el-table-column type="selection" width="50"/>
            <el-table-column prop="username" label="用户名" min-width="120"/>
            <el-table-column label="昵称" min-width="120">
              <template #default="scope">
                {{ scope.row.nickname || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="手机号" min-width="120"/>
            <el-table-column label="状态" width="80">
              <template #default="scope">
                <el-tag :type="statusTagType(scope.row.status)" size="small">
                  {{ dictLabel('DATA_STATUS', scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" min-width="160">
              <template #default="scope">
                {{ scope.row.createTime || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <div class="action-buttons">
                  <el-tooltip content="取消授权" placement="top" popper-class="action-tooltip">
                    <el-button
                      type="text"
                      size="small"
                      icon="Close"
                      class="action-icon is-danger"
                      @click="handleCancelAuth(scope.row)"/>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="page-pagination">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next"
              :total="allocatedTotal"
              :current-page="allocatedQuery.pageNum"
              :page-size="allocatedQuery.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              @current-change="handleAllocatedPageChange"
              @size-change="handleAllocatedSizeChange"/>
          </div>
        </el-tab-pane>
        <el-tab-pane label="未分配" name="unallocated">
          <div class="assign-toolbar">
            <el-form :inline="true" :model="unallocatedQuery" size="small">
              <el-form-item label="用户名">
                <el-input v-model="unallocatedQuery.username" placeholder="用户名" clearable/>
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="unallocatedQuery.phone" placeholder="手机号" clearable/>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleUnallocatedSearch">查询</el-button>
                <el-button icon="Refresh" @click="handleUnallocatedReset">重置</el-button>
                <el-button
                  type="primary"
                  icon="Check"
                  :disabled="!unallocatedSelection.length"
                  @click="handleSelectAuthAll">
                  批量授权
                </el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table
            :data="unallocatedList"
            border
            stripe
            v-loading="unallocatedLoading"
            @selection-change="handleUnallocatedSelectionChange">
            <el-table-column type="selection" width="50"/>
            <el-table-column prop="username" label="用户名" min-width="120"/>
            <el-table-column label="昵称" min-width="120">
              <template #default="scope">
                {{ scope.row.nickname || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="手机号" min-width="120"/>
            <el-table-column label="状态" width="80">
              <template #default="scope">
                <el-tag :type="statusTagType(scope.row.status)" size="small">
                  {{ dictLabel('DATA_STATUS', scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" min-width="160">
              <template #default="scope">
                {{ scope.row.createTime || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <div class="action-buttons">
                  <el-tooltip content="授权" placement="top" popper-class="action-tooltip">
                    <el-button
                      type="text"
                      size="small"
                      icon="Check"
                      class="action-icon is-primary"
                      @click="handleSelectAuth(scope.row)"/>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="page-pagination">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next"
              :total="unallocatedTotal"
              :current-page="unallocatedQuery.pageNum"
              :page-size="unallocatedQuery.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              @current-change="handleUnallocatedPageChange"
              @size-change="handleUnallocatedSizeChange"/>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="assignDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addRole,
  cancelAuth,
  cancelAuthAll,
  deleteRole,
  getAllocatedList,
  getRolePageList,
  updateRole,
  updateRoleStatus,
  getRoleWithDeptTree,
  getUnallocatedList,
  updateRoleDataScope,
  getRolePermissions,
  assignRolePermissions,
  selectAuthAll
} from '@/api/role'
import { getPermissionList } from '@/api/permission'
import { PERMS } from '@/utils/permCode'
import { usePermission } from '@/composables/usePermission'
import { useDict } from '@/composables/useDict'
import { Close, Check } from '@element-plus/icons-vue'

const { dicts, loadDictOptions, dictLabel } = useDict()
const { hasPerm } = usePermission()

const loading = ref(false)
const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  roleName: '',
  roleCode: '',
  status: ''
})
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')

const formRef = ref<FormInstance>()
const deptTreeRef = ref<InstanceType<any>>()

function getDefaultForm() {
  return {
    id: null as number | null,
    roleName: '',
    roleCode: '',
    orderNum: 0,
    status: '0',
    remark: ''
  }
}

const form = ref(getDefaultForm())

const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

// Permission dialog
const permDialogVisible = ref(false)
const permOptions = ref<any[]>([])
const permChecked = ref<string[]>([])
const permKeyword = ref('')
const permCollapseActive = ref(['M'])
const currentRoleId = ref<number | null>(null)

// Data scope dialog
const dataScopeDialogVisible = ref(false)
const deptTreeData = ref<any[]>([])
const deptChecked = ref<number[]>([])
const dataScopeExpandAll = ref(true)
const dataScopeCheckAll = ref(false)
const dataScopeCheckHalf = ref(false)
const dataScopeForm = ref({
  id: null as number | null,
  dataScope: '1',
  deptCheckStrictly: 1
})

// Assign users dialog
const assignDialogVisible = ref(false)
const assignActiveTab = ref('allocated')
const assignRole = ref({
  id: null as number | null,
  roleName: ''
})
const allocatedLoading = ref(false)
const allocatedTotal = ref(0)
const allocatedList = ref<any[]>([])
const allocatedSelection = ref<any[]>([])
const allocatedQuery = ref({
  pageNum: 1,
  pageSize: 10,
  username: '',
  phone: ''
})
const unallocatedLoading = ref(false)
const unallocatedTotal = ref(0)
const unallocatedList = ref<any[]>([])
const unallocatedSelection = ref<any[]>([])
const unallocatedQuery = ref({
  pageNum: 1,
  pageSize: 10,
  username: '',
  phone: ''
})

// Computed
const assignDialogTitle = computed(() => {
  return assignRole.value.roleName ? `分配用户 - ${assignRole.value.roleName}` : '分配用户'
})

const parentChildLink = computed({
  get() {
    return dataScopeForm.value.deptCheckStrictly === 1
  },
  set(value: boolean) {
    dataScopeForm.value.deptCheckStrictly = value ? 1 : 0
  }
})

const filteredPermOptions = computed(() => {
  const keyword = permKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return permOptions.value
  }
  return permOptions.value.filter(item => {
    const name = (item.permName || '').toLowerCase()
    const code = (item.permCode || '').toLowerCase()
    return name.includes(keyword) || code.includes(keyword)
  })
})

const permGrouped = computed(() => {
  const groups: Record<string, any[]> = { M: [], B: [], A: [] }
  filteredPermOptions.value.forEach(item => {
    const type = item.permType || 'M'
    if (groups[type]) {
      groups[type].push(item)
    }
  })
  return groups
})

const permGroupStats = computed(() => {
  const checkedSet = new Set(permChecked.value || [])
  const stats: Record<string, { total: number; checked: number }> = {
    M: { total: 0, checked: 0 },
    B: { total: 0, checked: 0 },
    A: { total: 0, checked: 0 }
  }
  Object.keys(stats).forEach(type => {
    const list = permGrouped.value[type] || []
    stats[type].total = list.length
    stats[type].checked = list.reduce((count: number, item: any) => count + (checkedSet.has(item.permCode) ? 1 : 0), 0)
  })
  return stats
})

// Methods
function dataScopeText(value: string) {
  const map: Record<string, string> = {
    '1': '全部数据',
    '2': '自定数据',
    '3': '本部门',
    '4': '本部门及以下',
    '5': '仅本人数据权限'
  }
  return map[value] || '-'
}

async function fetchList() {
  loading.value = true
  try {
    const data = await getRolePageList(queryParams.value)
    tableData.value = data.records || []
    total.value = Number(data.total || 0)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function fetchPermissionOptions() {
  try {
    permOptions.value = await getPermissionList({})
  } catch (error) {
    console.error(error)
  }
}

function handleSearch() {
  queryParams.value.pageNum = 1
  fetchList()
}

function handleReset() {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    roleName: '',
    roleCode: '',
    status: ''
  }
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
  dialogTitle.value = '新增角色'
  form.value = getDefaultForm()
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function handleEdit(row: any) {
  dialogTitle.value = '编辑角色'
  form.value = {
    id: row.id,
    roleName: row.roleName,
    roleCode: row.roleCode,
    orderNum: row.orderNum || 0,
    status: row.status,
    remark: row.remark
  }
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function submitForm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      if (form.value.id) {
        await updateRole(form.value)
        ElMessage.success('修改成功')
      } else {
        await addRole(form.value)
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
  ElMessageBox.confirm(`确认删除角色 ${row.roleName} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteRole(row.id)
      ElMessage.success('删除成功')
      fetchList()
    })
    .catch(() => {
    })
}

function handleStatus(row: any) {
  const actionText = row.status === '0' ? '停用' : '启用'
  ElMessageBox.confirm(`确认${actionText}角色 ${row.roleName} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await updateRoleStatus(row.id)
      ElMessage.success('操作成功')
      fetchList()
    })
    .catch(() => {
    })
}

async function openPermDialog(row: any) {
  currentRoleId.value = row.id
  try {
    permChecked.value = await getRolePermissions(row.id)
    permKeyword.value = ''
    permCollapseActive.value = ['M']
    permDialogVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

async function saveRolePermissions() {
  try {
    await assignRolePermissions(currentRoleId.value!, permChecked.value)
    ElMessage.success('权限配置成功')
    permDialogVisible.value = false
  } catch (error) {
    console.error(error)
  }
}

function selectPermGroup(type: string) {
  const list = permGrouped.value[type] || []
  const next = new Set(permChecked.value || [])
  list.forEach((item: any) => next.add(item.permCode))
  permChecked.value = Array.from(next)
}

function clearPermGroup(type: string) {
  const list = permGrouped.value[type] || []
  const next = new Set(permChecked.value || [])
  list.forEach((item: any) => next.delete(item.permCode))
  permChecked.value = Array.from(next)
}

async function openDataScopeDialog(row: any) {
  try {
    const data = await getRoleWithDeptTree(row.id)
    deptTreeData.value = data.trees || []
    deptChecked.value = data.checkedKeys || []
    dataScopeForm.value = {
      id: row.id,
      dataScope: row.dataScope || '1',
      deptCheckStrictly: row.deptCheckStrictly == null ? 1 : row.deptCheckStrictly
    }
    dataScopeExpandAll.value = true
    dataScopeDialogVisible.value = true
    nextTick(() => {
      if (deptTreeRef.value) {
        deptTreeRef.value.setCheckedKeys(deptChecked.value)
        updateTreeExpand(true)
        updateCheckAllState()
      }
    })
  } catch (error) {
    console.error(error)
  }
}

function openAssignUser(row: any) {
  assignRole.value = {
    id: row.id,
    roleName: row.roleName
  }
  assignActiveTab.value = 'allocated'
  resetAllocatedQuery()
  resetUnallocatedQuery()
  allocatedList.value = []
  unallocatedList.value = []
  allocatedTotal.value = 0
  unallocatedTotal.value = 0
  assignDialogVisible.value = true
  fetchAllocatedList()
}

async function fetchAllocatedList() {
  if (!assignRole.value.id) {
    return
  }
  allocatedLoading.value = true
  try {
    const data = await getAllocatedList({
      ...allocatedQuery.value,
      roleId: assignRole.value.id
    })
    allocatedList.value = data.records || []
    allocatedTotal.value = Number(data.total || 0)
    allocatedSelection.value = []
  } catch (error) {
    console.error(error)
  } finally {
    allocatedLoading.value = false
  }
}

async function fetchUnallocatedList() {
  if (!assignRole.value.id) {
    return
  }
  unallocatedLoading.value = true
  try {
    const data = await getUnallocatedList({
      ...unallocatedQuery.value,
      roleId: assignRole.value.id
    })
    unallocatedList.value = data.records || []
    unallocatedTotal.value = Number(data.total || 0)
    unallocatedSelection.value = []
  } catch (error) {
    console.error(error)
  } finally {
    unallocatedLoading.value = false
  }
}

function handleAssignTabClick(tab: any) {
  if (tab.paneName === 'allocated') {
    fetchAllocatedList()
  } else if (tab.paneName === 'unallocated') {
    fetchUnallocatedList()
  }
}

function handleAllocatedSearch() {
  allocatedQuery.value.pageNum = 1
  fetchAllocatedList()
}

function handleAllocatedReset() {
  resetAllocatedQuery()
  fetchAllocatedList()
}

function handleUnallocatedSearch() {
  unallocatedQuery.value.pageNum = 1
  fetchUnallocatedList()
}

function handleUnallocatedReset() {
  resetUnallocatedQuery()
  fetchUnallocatedList()
}

function handleAllocatedPageChange(page: number) {
  allocatedQuery.value.pageNum = page
  fetchAllocatedList()
}

function handleAllocatedSizeChange(size: number) {
  allocatedQuery.value.pageSize = size
  allocatedQuery.value.pageNum = 1
  fetchAllocatedList()
}

function handleUnallocatedPageChange(page: number) {
  unallocatedQuery.value.pageNum = page
  fetchUnallocatedList()
}

function handleUnallocatedSizeChange(size: number) {
  unallocatedQuery.value.pageSize = size
  unallocatedQuery.value.pageNum = 1
  fetchUnallocatedList()
}

function handleAllocatedSelectionChange(selection: any[]) {
  allocatedSelection.value = selection || []
}

function handleUnallocatedSelectionChange(selection: any[]) {
  unallocatedSelection.value = selection || []
}

function handleCancelAuth(row: any) {
  const roleId = assignRole.value.id
  const userId = row ? (row.id || row.userId) : null
  if (!roleId || !userId) {
    return
  }
  ElMessageBox.confirm(`确认取消用户 ${row.username || row.nickname || ''} 的授权吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await cancelAuth({ roleId, userId })
      ElMessage.success('取消授权成功')
      fetchAllocatedList()
    })
    .catch(() => {
    })
}

function handleCancelAuthAll() {
  const roleId = assignRole.value.id
  const userIds = allocatedSelection.value.map(item => item.id || item.userId).filter(Boolean)
  if (!roleId || userIds.length === 0) {
    return
  }
  ElMessageBox.confirm('确认批量取消授权吗？', '提示', { type: 'warning' })
    .then(async () => {
      await cancelAuthAll({ roleId, userIds })
      ElMessage.success('批量取消成功')
      fetchAllocatedList()
    })
    .catch(() => {
    })
}

async function handleSelectAuth(row: any) {
  const roleId = assignRole.value.id
  const userId = row ? (row.id || row.userId) : null
  if (!roleId || !userId) {
    return
  }
  await selectAuthAll({ roleId, userIds: [userId] })
  ElMessage.success('授权成功')
  fetchUnallocatedList()
}

async function handleSelectAuthAll() {
  const roleId = assignRole.value.id
  const userIds = unallocatedSelection.value.map(item => item.id || item.userId).filter(Boolean)
  if (!roleId || userIds.length === 0) {
    return
  }
  await selectAuthAll({ roleId, userIds })
  ElMessage.success('批量授权成功')
  fetchUnallocatedList()
}

function resetAllocatedQuery() {
  allocatedQuery.value = {
    pageNum: 1,
    pageSize: 10,
    username: '',
    phone: ''
  }
}

function resetUnallocatedQuery() {
  unallocatedQuery.value = {
    pageNum: 1,
    pageSize: 10,
    username: '',
    phone: ''
  }
}

async function saveDataScope() {
  try {
    const tree = deptTreeRef.value
    const checkedKeys = tree ? tree.getCheckedKeys() : []
    const halfCheckedKeys = tree ? tree.getHalfCheckedKeys() : []
    const deptIds = dataScopeForm.value.deptCheckStrictly === 1
      ? Array.from(new Set([...checkedKeys, ...halfCheckedKeys]))
      : checkedKeys
    const payload = {
      id: dataScopeForm.value.id,
      dataScope: dataScopeForm.value.dataScope,
      deptIds,
      deptCheckStrictly: dataScopeForm.value.deptCheckStrictly
    }
    await updateRoleDataScope(payload)
    ElMessage.success('数据权限已更新')
    dataScopeDialogVisible.value = false
    fetchList()
  } catch (error) {
    console.error(error)
  }
}

function handleExpandChange(value: any) {
  dataScopeExpandAll.value = value
  updateTreeExpand(value)
}

function handleCheckAllChange(value: any) {
  const tree = deptTreeRef.value
  if (!tree) {
    return
  }
  if (value) {
    const allKeys = collectDeptIds(deptTreeData.value)
    tree.setCheckedKeys(allKeys)
    dataScopeCheckHalf.value = false
  } else {
    tree.setCheckedKeys([])
    dataScopeCheckHalf.value = false
  }
}

function handleDeptCheckChange() {
  updateCheckAllState()
}

function updateCheckAllState() {
  const tree = deptTreeRef.value
  if (!tree) {
    dataScopeCheckAll.value = false
    dataScopeCheckHalf.value = false
    return
  }
  const checkedKeys = tree.getCheckedKeys() || []
  const allKeys = collectDeptIds(deptTreeData.value)
  if (allKeys.length === 0) {
    dataScopeCheckAll.value = false
    dataScopeCheckHalf.value = false
    return
  }
  dataScopeCheckAll.value = checkedKeys.length === allKeys.length
  dataScopeCheckHalf.value = checkedKeys.length > 0 && checkedKeys.length < allKeys.length
}

function updateTreeExpand(expand: boolean) {
  const tree = deptTreeRef.value
  if (!tree || !tree.store) {
    return
  }
  const nodes = typeof tree.store._getAllNodes === 'function'
    ? tree.store._getAllNodes()
    : Object.values(tree.store.nodesMap || {})
  ;(nodes as any[]).forEach(node => {
    node.expanded = !!expand
  })
}

function collectDeptIds(tree: any[] = []) {
  const ids: number[] = []
  const walk = (nodes: any[]) => {
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children && node.children.length) {
        walk(node.children)
      }
    })
  }
  walk(tree)
  return ids
}

function statusTagType(value: string) {
  return value === '0' ? 'success' : 'info'
}

// created
loadDictOptions('DATA_STATUS')
fetchList()
fetchPermissionOptions()
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

.assign-toolbar {
  margin-bottom: 8px;
}
</style>
