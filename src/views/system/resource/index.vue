<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>资源管理</span>
        </div>
      </template>

      <el-form :inline="true" :model="queryParams" class="search-form">
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
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <el-button type="primary" icon="Plus" v-perm="PERMS.resource.add" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="requestMethod" label="请求方法" width="100"/>
        <el-table-column prop="requestUri" label="URI" min-width="220"/>
        <el-table-column prop="permCode" label="权限编码" min-width="200"/>
        <el-table-column prop="remark" label="备注" min-width="160"/>
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="140" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip v-if="hasPerm(PERMS.resource.update)" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-if="hasPerm(PERMS.resource.delete)" content="删除" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Delete"
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="520px">
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
          <el-input
            v-model="permLabel"
            placeholder="请选择权限编码"
            readonly
            class="perm-input"
            @click="togglePermPanel">
            <template #suffix>
              <span class="dept-query-suffix">
                <el-icon class="dept-query-clear" v-if="permLabel"
                  @click.stop="clearPermSelect"><CircleCloseFilled /></el-icon>
                <el-icon class="dept-query-arrow"><ArrowDown /></el-icon>
              </span>
            </template>
          </el-input>
          <div v-show="permPanelVisible" class="perm-panel">
            <div class="perm-select">
              <div class="perm-toolbar">
                <el-input
                  v-model="permKeyword"
                  placeholder="搜索权限名称或编码"

                  clearable
                  prefix-icon="Search"/>
              </div>
              <el-collapse v-model="permCollapseActive" class="perm-collapse">
                <el-collapse-item name="A">
                  <template #title>
                    <div class="perm-collapse-title">
                      <el-icon><Link /></el-icon>
                      <span>API</span>
                      <span class="perm-count">{{ permStats.total }}</span>
                      <span v-if="permStats.checked" class="perm-selected">已选 {{ permStats.checked }}</span>
                    </div>
                  </template>
                  <div class="perm-group">
                    <div class="perm-grid">
                      <button
                        v-for="perm in permApiOptions"
                        :key="perm.permCode"
                        type="button"
                        class="perm-item"
                        :class="{ 'is-active': perm.permCode === form.permCode }"
                        @click="selectPermCode(perm)">
                        <span class="perm-name">{{ perm.permName }}</span>
                        <span class="perm-code">{{ perm.permCode }}</span>
                      </button>
                    </div>
                    <div v-if="!permApiOptions.length" class="perm-empty">暂无匹配权限</div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addResource,
  deleteResource,
  getResourceDetail,
  getResourcePageList,
  updateResource
} from '@/api/resource'
import { getPermissionList } from '@/api/permission'
import { PERMS } from '@/utils/permCode'
import { usePermission } from '@/composables/usePermission'
import { useDict } from '@/composables/useDict'

const { dicts, loadDictOptions, dictLabel } = useDict()
const { hasPerm } = usePermission()

const loading = ref(false)
const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  requestMethod: '',
  requestUri: '',
  permCode: '',
  status: ''
})
const tableData = ref<any[]>([])
const permOptions = ref<any[]>([])
const permKeyword = ref('')
const permPanelVisible = ref(false)
const permLabel = ref('')
const permCollapseActive = ref(['A'])
const dialogVisible = ref(false)
const dialogTitle = ref('')

const formRef = ref<FormInstance>()

function getDefaultForm() {
  return {
    id: null as number | null,
    requestMethod: 'GET',
    requestUri: '',
    permCode: '',
    status: '0',
    remark: ''
  }
}

const form = ref(getDefaultForm())

const rules = {
  requestMethod: [{ required: true, message: '请选择请求方法', trigger: 'change' }],
  requestUri: [{ required: true, message: '请输入URI', trigger: 'blur' }],
  permCode: [{ required: true, message: '请选择权限编码', trigger: 'change' }]
}

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

const permApiOptions = computed(() => {
  return filteredPermOptions.value.filter(item => (item.permType || 'A') === 'A')
})

const permStats = computed(() => {
  const current = form.value.permCode
  return {
    total: permApiOptions.value.length,
    checked: current && permApiOptions.value.some(item => item.permCode === current) ? 1 : 0
  }
})

async function fetchList() {
  loading.value = true
  try {
    const data = await getResourcePageList(queryParams.value)
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
    permOptions.value = await getPermissionList({ permType: 'A' })
    syncPermLabel()
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
    requestMethod: '',
    requestUri: '',
    permCode: '',
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
  dialogTitle.value = '新增资源'
  form.value = getDefaultForm()
  permLabel.value = ''
  permKeyword.value = ''
  permCollapseActive.value = ['A']
  permPanelVisible.value = false
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

async function handleEdit(row: any) {
  dialogTitle.value = '编辑资源'
  try {
    const detail = await getResourceDetail(row.id)
    form.value = {
      id: detail.id,
      requestMethod: detail.requestMethod,
      requestUri: detail.requestUri,
      permCode: detail.permCode,
      status: detail.status,
      remark: detail.remark
    }
    permKeyword.value = ''
    permCollapseActive.value = ['A']
    permPanelVisible.value = false
    syncPermLabel()
    dialogVisible.value = true
    nextTick(() => formRef.value?.clearValidate())
  } catch (error) {
    console.error(error)
  }
}

function togglePermPanel() {
  permPanelVisible.value = !permPanelVisible.value
}

function selectPermCode(perm: any) {
  form.value.permCode = perm.permCode
  permLabel.value = `${perm.permName} (${perm.permCode})`
  permPanelVisible.value = false
}

function clearPermSelect() {
  form.value.permCode = ''
  permLabel.value = ''
  permKeyword.value = ''
  permPanelVisible.value = false
}

function syncPermLabel() {
  if (!form.value.permCode) {
    permLabel.value = ''
    return
  }
  const match = (permOptions.value || []).find(item => item.permCode === form.value.permCode)
  if (match) {
    permLabel.value = `${match.permName} (${match.permCode})`
  }
}

function submitForm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      if (form.value.id) {
        await updateResource(form.value)
        ElMessage.success('修改成功')
      } else {
        await addResource(form.value)
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
  ElMessageBox.confirm(`确认删除资源 ${row.requestUri} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteResource(row.id)
      ElMessage.success('删除成功')
      fetchList()
    })
    .catch(() => {
    })
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
</style>

<style>
.perm-select {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.perm-input {
  cursor: pointer;
}

.perm-panel {
  margin-top: 8px;
  background: #ffffff;
  border: 1px solid #e1e8ff;
  border-radius: 12px;
  padding: 10px 12px 12px;
  max-height: 60vh;
  overflow: auto;
}

.perm-toolbar {
  display: flex;
  align-items: center;
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

.perm-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.perm-item {
  border: 1px solid #e1e8ff;
  border-radius: 10px;
  padding: 8px 10px;
  background: #ffffff;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.perm-item:hover {
  border-color: #4f70ff;
  box-shadow: 0 8px 16px rgba(79, 112, 255, 0.16);
}

.perm-item.is-active {
  border-color: #4f70ff;
  background: #eef3ff;
}

.perm-name {
  font-size: 13px;
  color: #1f2d3d;
}

.perm-code {
  font-size: 12px;
  color: #8b97ad;
}

.perm-empty {
  padding: 12px 0 4px;
  text-align: center;
  color: #9aa6bf;
  font-size: 12px;
}
</style>
