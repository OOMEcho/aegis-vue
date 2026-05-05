<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>通知公告</span>
        </div>
      </template>

      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="通知标题">
          <el-input v-model="queryParams.noticeTitle" placeholder="通知标题" clearable/>
        </el-form-item>
        <el-form-item label="通知类型">
          <el-select v-model="queryParams.noticeType" placeholder="通知类型" clearable>
            <el-option label="系统通知" value="1"/>
            <el-option label="公告" value="2"/>
            <el-option label="提醒" value="3"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="状态" clearable>
            <el-option label="待发布" value="0"/>
            <el-option label="已发布" value="1"/>
            <el-option label="已撤回" value="2"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <el-button type="primary" icon="Plus" v-perm="PERMS.notice.add" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="noticeTitle" label="通知标题" min-width="160"/>
        <el-table-column label="通知类型" width="100">
          <template #default="scope">
            {{ noticeTypeText(scope.row.noticeType) }}
          </template>
        </el-table-column>
        <el-table-column label="目标类型" width="120">
          <template #default="scope">
            {{ targetTypeText(scope.row.targetType) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '0'" size="small">待发布</el-tag>
            <el-tag v-else-if="scope.row.status === '1'" type="success" size="small">已发布</el-tag>
            <el-tag v-else type="info" size="small">已撤回</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" min-width="160"/>
        <el-table-column label="操作" min-width="220" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip v-if="hasPerm(PERMS.notice.update)" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip
                v-if="scope.row.status === '0' && hasPerm(PERMS.notice.publish)"
                content="发布"
                placement="top"
                popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Upload"
                  class="action-icon is-success"
                  @click="handlePublish(scope.row)"/>
              </el-tooltip>
              <el-tooltip
                v-if="scope.row.status === '1' && hasPerm(PERMS.notice.revoke)"
                content="撤销"
                placement="top"
                popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Refresh"
                  class="action-icon is-warning"
                  @click="handleRevoke(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-if="hasPerm(PERMS.notice.delete)" content="删除" placement="top" popper-class="action-tooltip">
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="640px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="通知标题" prop="noticeTitle">
          <el-input v-model="form.noticeTitle" placeholder="请输入通知标题"/>
        </el-form-item>
        <el-form-item label="通知类型" prop="noticeType">
          <el-select v-model="form.noticeType" placeholder="请选择通知类型">
            <el-option label="系统通知" value="1"/>
            <el-option label="公告" value="2"/>
            <el-option label="提醒" value="3"/>
          </el-select>
        </el-form-item>
        <el-form-item label="目标类型" prop="targetType">
          <el-select v-model="form.targetType" placeholder="请选择目标类型">
            <el-option label="全部用户" :value="1"/>
            <el-option label="指定用户" :value="2"/>
            <el-option label="指定角色" :value="3"/>
            <el-option label="指定部门" :value="4"/>
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.targetType !== 1" label="目标对象" prop="targetIds">
          <el-select v-model="form.targetIds" multiple filterable placeholder="请选择目标对象">
            <el-option
              v-for="item in targetOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="通知内容" prop="noticeContent">
          <div class="notice-editor">
            <Toolbar
              class="notice-editor-toolbar"
              :editor="editorInstance"
              :default-config="toolbarConfig"
              mode="simple"
            />
            <WangEditor
              class="notice-editor-body"
              v-model="form.noticeContent"
              :default-config="editorConfig"
              mode="simple"
              @onCreated="handleEditorCreated"
            />
          </div>
        </el-form-item>
        <el-form-item label="发布时间" prop="publishTime">
          <el-date-picker
            v-model="form.publishTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="为空则立即发布"/>
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
import { ref, reactive, computed, watch, nextTick, onBeforeUnmount, shallowRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Editor as WangEditor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'
import {
  addNotice,
  deleteNotice,
  getNoticeDetail,
  getNoticePageList,
  publishNotice,
  revokeNotice,
  updateNotice
} from '@/api/notice'
import { getUserPageList } from '@/api/user'
import { getRolePageList } from '@/api/role'
import { getDeptList } from '@/api/dept'
import { PERMS } from '@/utils/permCode'
import { usePermission } from '@/composables/usePermission'

const { hasPerm } = usePermission()

const loading = ref(false)
const total = ref(0)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const userOptions = ref<any[]>([])
const roleOptions = ref<any[]>([])
const deptOptions = ref<any[]>([])

const formRef = ref<FormInstance>()
const editorInstance = shallowRef<IDomEditor>()

const toolbarConfig = {
  excludeKeys: ['uploadImage', 'uploadVideo', 'fullScreen', 'group-image', 'group-video']
}

const editorConfig = {
  placeholder: '请输入通知内容...'
}

function handleEditorCreated(editor: IDomEditor) {
  editorInstance.value = editor
}

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  noticeTitle: '',
  noticeType: '',
  status: ''
})

function getDefaultForm() {
  return {
    id: null as number | null,
    noticeTitle: '',
    noticeType: '1',
    noticeContent: '',
    targetType: 1,
    targetIds: [] as number[],
    publishTime: ''
  }
}

const form = reactive(getDefaultForm())

const rules = {
  noticeTitle: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  noticeType: [{ required: true, message: '请选择通知类型', trigger: 'change' }],
  targetType: [{ required: true, message: '请选择目标类型', trigger: 'change' }],
  noticeContent: [{ required: true, message: '请输入通知内容', trigger: 'blur' }]
}

const targetOptions = computed(() => {
  if (form.targetType === 2) {
    return userOptions.value
  }
  if (form.targetType === 3) {
    return roleOptions.value
  }
  if (form.targetType === 4) {
    return deptOptions.value
  }
  return []
})

watch(() => form.targetType, (value) => {
  if (value === 1) {
    form.targetIds = []
  }
})

function noticeTypeText(value: string | number) {
  const map: Record<string | number, string> = { 1: '系统通知', 2: '公告', 3: '提醒' }
  return map[value] || value
}

function targetTypeText(value: string | number) {
  const map: Record<string | number, string> = { 1: '全部用户', 2: '指定用户', 3: '指定角色', 4: '指定部门' }
  return map[value] || value
}

async function fetchList() {
  loading.value = true
  try {
    const data = await getNoticePageList(queryParams)
    tableData.value = data.records || []
    total.value = Number(data.total || 0)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function fetchTargets() {
  try {
    const userData = await getUserPageList({ pageNum: 1, pageSize: 1000 })
    userOptions.value = (userData.records || []).map((item: any) => ({
      label: item.nickname || item.username,
      value: item.id
    }))
    const roleData = await getRolePageList({ pageNum: 1, pageSize: 1000 })
    roleOptions.value = (roleData.records || []).map((item: any) => ({
      label: item.roleName,
      value: item.id
    }))
    const deptData = await getDeptList({})
    deptOptions.value = (deptData || []).map((item: any) => ({
      label: item.deptName,
      value: item.id
    }))
  } catch (error) {
    console.error(error)
  }
}

function handleSearch() {
  queryParams.pageNum = 1
  fetchList()
}

function handleReset() {
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  queryParams.noticeTitle = ''
  queryParams.noticeType = ''
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
  dialogTitle.value = '新增通知'
  Object.assign(form, getDefaultForm())
  dialogVisible.value = true
  nextTick(() => {
    if (formRef.value) {
      formRef.value.clearValidate()
    }
  })
}

async function handleEdit(row: any) {
  dialogTitle.value = '编辑通知'
  try {
    const detail = await getNoticeDetail(row.id)
    let targetIds: number[] = []
    if (Array.isArray(detail.targetIds)) {
      targetIds = detail.targetIds
    } else if (detail.targetIds) {
      targetIds = detail.targetIds.split(',').map((item: string) => Number(item))
    }
    Object.assign(form, {
      id: detail.id,
      noticeTitle: detail.noticeTitle,
      noticeType: detail.noticeType,
      noticeContent: detail.noticeContent,
      targetType: detail.targetType,
      targetIds,
      publishTime: detail.publishTime || ''
    })
    dialogVisible.value = true
    nextTick(() => {
      if (formRef.value) {
        formRef.value.clearValidate()
      }
    })
  } catch (error) {
    console.error(error)
  }
}

function submitForm() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    try {
      if (form.id) {
        await updateNotice(form)
        ElMessage.success('修改成功')
      } else {
        await addNotice(form)
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
  ElMessageBox.confirm(`确认删除通知 ${row.noticeTitle} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteNotice(row.id)
      ElMessage.success('删除成功')
      fetchList()
    })
    .catch(() => {
    })
}

function handlePublish(row: any) {
  ElMessageBox.confirm(`确认发布通知 ${row.noticeTitle} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await publishNotice(row.id)
      ElMessage.success('发布成功')
      fetchList()
    })
    .catch(() => {
    })
}

function handleRevoke(row: any) {
  ElMessageBox.confirm(`确认撤销通知 ${row.noticeTitle} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await revokeNotice(row.id)
      ElMessage.success('撤销成功')
      fetchList()
    })
    .catch(() => {
    })
}

onBeforeUnmount(() => {
  if (editorInstance.value) {
    editorInstance.value.destroy()
  }
})

// created
fetchList()
fetchTargets()
</script>

<style scoped>

.page-pagination {
  margin-top: 12px;
  text-align: right;
}

.notice-editor {
  border: 1px solid #e1e8ff;
  border-radius: 12px;
  overflow: hidden;
}

.notice-editor-toolbar {
  border-bottom: 1px solid #e1e8ff;
}

.notice-editor-body {
  min-height: 220px;
}
</style>
