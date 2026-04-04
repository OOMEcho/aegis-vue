<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
        </div>
      </template>

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
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <el-button type="primary" size="small" icon="Plus" v-perm="PERMS.permission.add" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="permName" label="权限名称" min-width="160"/>
        <el-table-column prop="permCode" label="权限编码" min-width="200"/>
        <el-table-column label="类型" width="80">
          <template #default="scope">
            {{ permTypeText(scope.row.permType) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160"/>
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip v-if="hasPerm(PERMS.permission.update)" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip
                v-if="hasPerm(PERMS.permission.effective)"
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
import { ref, reactive, nextTick } from 'vue'
import {
  addPermission,
  effectivePermission,
  getPermissionPageList,
  updatePermission
} from '@/api/permission'
import { PERMS } from '@/utils/permCode'
import { usePermission } from '@/composables/usePermission'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDict } from '@/composables/useDict'
import type { FormInstance } from 'element-plus'
import { Close, Check } from '@element-plus/icons-vue'

const { dicts, loadDictOptions, dictLabel } = useDict()
const { hasPerm } = usePermission()

const loading = ref(false)
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  permName: '',
  permCode: '',
  permType: '',
  status: ''
})
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()

function getDefaultForm() {
  return {
    id: null as number | null,
    permName: '',
    permCode: '',
    permType: 'A',
    status: '0',
    remark: ''
  }
}

const form = reactive(getDefaultForm())

const rules = {
  permName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  permCode: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
  permType: [{ required: true, message: '请选择权限类型', trigger: 'change' }]
}

function permTypeText(type: string) {
  const map: Record<string, string> = { M: '页面', B: '按钮', A: 'API' }
  return map[type] || type
}

async function fetchList() {
  loading.value = true
  try {
    const data = await getPermissionPageList(queryParams)
    tableData.value = data.records || []
    total.value = Number(data.total || 0)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryParams.pageNum = 1
  fetchList()
}

function handleReset() {
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.permName = ''
  queryParams.permCode = ''
  queryParams.permType = ''
  queryParams.status = ''
  fetchList()
}

function handlePageChange(page: number) {
  queryParams.pageNum = page
  fetchList()
}

function handleSizeChange(size: number) {
  queryParams.pageSize = size
  queryParams.pageNum = 1
  fetchList()
}

function handleAdd() {
  dialogTitle.value = '新增权限'
  Object.assign(form, getDefaultForm())
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function handleEdit(row: any) {
  dialogTitle.value = '编辑权限'
  Object.assign(form, {
    id: row.id,
    permName: row.permName,
    permCode: row.permCode,
    permType: row.permType,
    status: row.status,
    remark: row.remark
  })
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function submitForm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      if (form.id) {
        await updatePermission(form)
        ElMessage.success('修改成功')
      } else {
        await addPermission(form)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      fetchList()
    } catch (error) {
      console.error(error)
    }
  })
}

function handleStatus(row: any) {
  const actionText = row.status === '0' ? '停用' : '启用'
  ElMessageBox.confirm(`确认${actionText}权限 ${row.permName} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await effectivePermission(row.id)
      ElMessage.success('操作成功')
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
</script>

<style scoped>

.page-pagination {
  margin-top: 12px;
  text-align: right;
}
</style>
