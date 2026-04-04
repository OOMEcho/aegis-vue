<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>白名单管理</span>
        </div>
      </template>

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
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <el-button type="primary" size="small" icon="Plus" v-perm="PERMS.whitelist.add" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="requestMethod" label="请求方法" width="100"/>
        <el-table-column prop="requestUri" label="请求地址" min-width="220"/>
        <el-table-column prop="description" label="描述" min-width="160"/>
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
              <el-tooltip v-if="hasPerm(PERMS.whitelist.update)" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-if="hasPerm(PERMS.whitelist.delete)" content="删除" placement="top" popper-class="action-tooltip">
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
  addWhitelist,
  deleteWhitelist,
  getWhitelistDetail,
  getWhitelistPageList,
  updateWhitelist
} from '@/api/whitelist'
import { PERMS } from '@/utils/permCode'
import { usePermission } from '@/composables/usePermission'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDict } from '@/composables/useDict'
import type { FormInstance } from 'element-plus'

const { dicts, loadDictOptions, dictLabel } = useDict()
const { hasPerm } = usePermission()

const loading = ref(false)
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  requestMethod: '',
  requestUri: '',
  status: ''
})
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()

function getDefaultForm() {
  return {
    id: null as number | null,
    requestMethod: 'GET',
    requestUri: '',
    description: '',
    status: '0'
  }
}

const form = reactive(getDefaultForm())

const rules = {
  requestMethod: [{ required: true, message: '请选择请求方法', trigger: 'change' }],
  requestUri: [{ required: true, message: '请输入请求地址', trigger: 'blur' }]
}

async function fetchList() {
  loading.value = true
  try {
    const data = await getWhitelistPageList(queryParams)
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
  queryParams.requestMethod = ''
  queryParams.requestUri = ''
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
  dialogTitle.value = '新增白名单'
  Object.assign(form, getDefaultForm())
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

async function handleEdit(row: any) {
  dialogTitle.value = '编辑白名单'
  try {
    const detail = await getWhitelistDetail(row.id)
    Object.assign(form, {
      id: detail.id,
      requestMethod: detail.requestMethod,
      requestUri: detail.requestUri,
      description: detail.description,
      status: detail.status
    })
    dialogVisible.value = true
    nextTick(() => formRef.value?.clearValidate())
  } catch (error) {
    console.error(error)
  }
}

function submitForm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      if (form.id) {
        await updateWhitelist(form)
        ElMessage.success('修改成功')
      } else {
        await addWhitelist(form)
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
  ElMessageBox.confirm(`确认删除白名单 ${row.requestUri} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteWhitelist(row.id)
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
</script>

<style scoped>

.page-pagination {
  margin-top: 12px;
  text-align: right;
}
</style>
