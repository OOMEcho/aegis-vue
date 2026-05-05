<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文件管理</span>
        </div>
      </template>

      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="原始名称">
          <el-input v-model="queryParams.originalFileName" placeholder="原始名称" clearable/>
        </el-form-item>
        <el-form-item label="平台">
          <el-select v-model="queryParams.platform" placeholder="存储平台" clearable>
            <el-option label="LOCAL" value="LOCAL"/>
            <el-option label="MINIO" value="MINIO"/>
            <el-option label="ALIYUN_OSS" value="ALIYUN_OSS"/>
            <el-option label="TENCENT_COS" value="TENCENT_COS"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="upload-section">
        <div class="upload-row">
          <el-input v-model="uploadDirectory" placeholder="上传目录(可选)" class="dir-input"/>
          <el-select v-model="uploadPlatform" placeholder="存储平台" clearable class="platform-select">
            <el-option label="LOCAL" value="LOCAL"/>
            <el-option label="MINIO" value="MINIO"/>
            <el-option label="ALIYUN_OSS" value="ALIYUN_OSS"/>
            <el-option label="TENCENT_COS" value="TENCENT_COS"/>
          </el-select>
          <el-upload
            action="#"
            :show-file-list="false"
            :http-request="handleSingleUpload">
            <el-button type="primary" v-perm="PERMS.file.upload">单文件上传</el-button>
          </el-upload>
          <el-upload
            action="#"
            :show-file-list="false"
            :http-request="handlePresignedUpload">
            <el-button type="warning" v-perm="PERMS.file.upload">预签名上传</el-button>
          </el-upload>
        </div>
        <div class="upload-row">
          <el-upload
            ref="batchUploadRef"
            action="#"
            multiple
            :auto-upload="false"
            :file-list="batchFileList"
            :on-change="handleBatchChange"
            :on-remove="handleBatchRemove">
            <el-button v-perm="PERMS.file.uploadBatch">选择批量文件</el-button>
          </el-upload>
          <el-button type="success" v-perm="PERMS.file.uploadBatch" @click="submitBatchUpload">
            批量上传
          </el-button>
        </div>
      </div>

      <div v-if="failedUploads.length" class="upload-failed">
        <el-alert title="以下文件上传失败，可重试或移除" type="warning" show-icon :closable="false"/>
        <el-table :data="failedUploads" border size="small" class="failed-table">
          <el-table-column prop="name" label="文件名" min-width="200"/>
          <el-table-column prop="reason" label="失败原因" min-width="200"/>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <div class="action-buttons">
                <el-tooltip content="重试" placement="top" popper-class="action-tooltip">
                  <el-button
                    type="text"
                    size="small"
                    icon="Refresh"
                    class="action-icon is-neutral"
                    @click="retryFailed(scope.row)"/>
                </el-tooltip>
                <el-tooltip content="移除" placement="top" popper-class="action-tooltip">
                  <el-button
                    type="text"
                    size="small"
                    icon="Close"
                    class="action-icon is-neutral"
                    @click="removeFailed(scope.row)"/>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="failed-actions">
          <el-button size="small" type="primary" @click="retryAllFailed">全部重试</el-button>
          <el-button size="small" @click="clearFailed">清空列表</el-button>
        </div>
      </div>

      <el-table :data="fileRecords" border stripe v-loading="loading">
        <el-table-column prop="fileName" label="文件名称" min-width="180"/>
        <el-table-column prop="originalFileName" label="原始名称" min-width="180"/>
        <el-table-column prop="filePath" label="文件路径" min-width="220"/>
        <el-table-column prop="contentType" label="文件类型" min-width="130"/>
        <el-table-column prop="fileSize" label="大小(bytes)" width="120"/>
        <el-table-column prop="platform" label="平台" width="120"/>
        <el-table-column prop="uploadTime" label="上传时间" min-width="160"/>
        <el-table-column label="操作" min-width="260" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip content="预览" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="View"
                  class="action-icon is-neutral"
                  @click="handlePreview(scope.row)"/>
              </el-tooltip>
              <el-tooltip content="复制路径" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="DocumentCopy"
                  class="action-icon is-neutral"
                  @click="copyPath(scope.row.filePath)"/>
              </el-tooltip>
              <el-tooltip v-if="hasPerm(PERMS.file.tempDownload)" content="临时下载" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Link"
                  class="action-icon is-neutral"
                  @click="handleTempDownload(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-if="hasPerm(PERMS.file.download)" content="下载" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Download"
                  class="action-icon is-neutral"
                  @click="handleDownload(scope.row)"/>
              </el-tooltip>
              <el-dropdown v-if="hasPerm(PERMS.file.delete)" trigger="click" popper-class="action-dropdown">
                <span class="action-dropdown-trigger">
                  <el-tooltip content="更多操作" placement="top" popper-class="action-tooltip">
                    <el-button type="text" size="small" icon="MoreFilled" class="action-icon is-neutral"/>
                  </el-tooltip>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item class="danger-item" @click="handleDelete(scope.row)">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadInstance } from 'element-plus'
import {
  completePresignedUpload,
  deleteFile,
  downloadFile,
  getFilePageList,
  getPresignedUploadUrl,
  getTemporaryDownloadUrl,
  localDownloadFile,
  uploadFile,
  uploadFilesBatch,
  uploadFileToPlatform,
  uploadToPresignedUrl
} from '@/api/file'
import { PERMS } from '@/utils/permCode'
import { usePermission } from '@/composables/usePermission'

const { hasPerm } = usePermission()

const loading = ref(false)
const total = ref(0)
const uploadDirectory = ref('')
const uploadPlatform = ref('')
const batchFileList = ref<any[]>([])
const fileRecords = ref<any[]>([])
const failedUploads = ref<any[]>([])
const batchUploadRef = ref<UploadInstance>()

function getDefaultQueryParams() {
  return {
    pageNum: 1,
    pageSize: 10,
    originalFileName: '',
    platform: ''
  }
}

const queryParams = reactive(getDefaultQueryParams())

function normalizeRecord(record: any) {
  if (!record) {
    return record
  }
  const result = { ...record }
  if (!result.accessUrl && result.id) {
    result.accessUrl = buildPreviewUrl(result.id)
  }
  return result
}

async function fetchList() {
  loading.value = true
  try {
    const data = await getFilePageList(queryParams)
    const records = Array.isArray(data?.records) ? data.records : []
    fileRecords.value = records.map((item: any) => normalizeRecord(item))
    total.value = Number(data?.total || 0)
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
  Object.assign(queryParams, getDefaultQueryParams())
  fetchList()
}

function handlePageChange(page: number) {
  queryParams.pageNum = page
  fetchList()
}

function handleSizeChange(size: number) {
  queryParams.pageNum = 1
  queryParams.pageSize = size
  fetchList()
}

async function uploadOneFile(file: File, platform: string, directory: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (platform) {
    return uploadFileToPlatform(formData, platform, directory)
  }
  return uploadFile(formData, directory)
}

async function uploadOneFileByPresigned(file: File, directory: string) {
  const response = await getPresignedUploadUrl(file.name, directory)
  const uploadUrl = response?.uploadUrl
  const filePath = response?.filePath
  if (!uploadUrl || !filePath) {
    throw new Error('当前存储平台不支持预签名上传')
  }

  await uploadToPresignedUrl(uploadUrl, file)

  return completePresignedUpload({
    filePath,
    originalFileName: file.name,
    fileSize: file.size,
    contentType: file.type || 'application/octet-stream'
  })
}

function addFailedUpload(file: any, reason: string, mode = 'normal') {
  if (!file) {
    return
  }
  const uid = file.uid || `${file.name}_${file.size}_${file.lastModified}_${mode}`
  if (failedUploads.value.some((item: any) => item.uid === uid)) {
    return
  }
  failedUploads.value.push({
    uid,
    name: file.name,
    file,
    platform: uploadPlatform.value,
    directory: uploadDirectory.value,
    mode,
    reason: reason || '上传失败'
  })
}

async function handleSingleUpload(option: any) {
  try {
    const record = await uploadOneFile(option.file, uploadPlatform.value, uploadDirectory.value)
    if (record) {
      await fetchList()
      ElMessage.success('上传成功')
    }
    if (option.onSuccess) {
      option.onSuccess(record)
    }
  } catch (error) {
    console.error(error)
    ElMessage.error(`上传失败：${option.file?.name || ''}`)
    addFailedUpload(option.file, '单文件上传失败', 'normal')
    if (option.onError) {
      option.onError(error)
    }
  }
}

async function handlePresignedUpload(option: any) {
  try {
    if (uploadPlatform.value) {
      ElMessage.warning('预签名上传使用系统默认存储平台，已忽略当前手动平台选择')
    }
    const record = await uploadOneFileByPresigned(option.file, uploadDirectory.value)
    if (record) {
      await fetchList()
      ElMessage.success('预签名上传成功')
    }
    if (option.onSuccess) {
      option.onSuccess(record)
    }
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error?.message || `预签名上传失败：${option.file?.name || ''}`)
    addFailedUpload(option.file, '预签名上传失败', 'presigned')
    if (option.onError) {
      option.onError(error)
    }
  }
}

function handleBatchChange(_file: any, fileList: any[]) {
  batchFileList.value = fileList
}

function handleBatchRemove(_file: any, fileList: any[]) {
  batchFileList.value = fileList
}

async function submitBatchUpload() {
  if (!batchFileList.value.length) {
    ElMessage.warning('请先选择文件')
    return
  }
  const formData = new FormData()
  batchFileList.value.forEach(item => {
    formData.append('files', item.raw)
  })
  try {
    await uploadFilesBatch(formData, uploadDirectory.value)
    await fetchList()
    batchFileList.value = []
    if (batchUploadRef.value) {
      batchUploadRef.value.clearFiles()
    }
    ElMessage.success('批量上传成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('批量上传失败')
    batchFileList.value.forEach(item => addFailedUpload(item.raw || item, '批量上传失败', 'normal'))
    batchFileList.value = []
    if (batchUploadRef.value) {
      batchUploadRef.value.clearFiles()
    }
  }
}

async function retryFailed(item: any) {
  try {
    let record = null
    if (item.mode === 'presigned') {
      record = await uploadOneFileByPresigned(item.file, item.directory)
    } else {
      record = await uploadOneFile(item.file, item.platform, item.directory)
    }

    if (record) {
      await fetchList()
    }
    removeFailed(item)
    ElMessage.success('重试成功')
  } catch (error) {
    console.error(error)
    ElMessage.error(`重试失败：${item.name}`)
  }
}

async function retryAllFailed() {
  const queue = [...failedUploads.value]
  for (const item of queue) {
    await retryFailed(item)
  }
}

function removeFailed(item: any) {
  failedUploads.value = failedUploads.value.filter((row: any) => row.uid !== item.uid)
}

function clearFailed() {
  failedUploads.value = []
}

async function handleTempDownload(row: any) {
  try {
    const data = await getTemporaryDownloadUrl(row.filePath)
    const url = data?.downloadUrl || data?.url || Object.values(data || {})[0]
    if (!url) {
      const blob = await localDownloadFile(row.filePath)
      if (blob) {
        downloadBlob(blob, row.originalFileName || row.fileName || 'download')
        return
      }
      ElMessage.warning('临时下载链接获取失败')
      return
    }

    if (/^https?:\/\//.test(url as string)) {
      window.open(url as string)
      return
    }

    const blob = await localDownloadFile(url as string)
    if (blob) {
      downloadBlob(blob, row.originalFileName || row.fileName || 'download')
      return
    }

    window.open(toBrowserOpenUrl(url as string))
  } catch (error) {
    console.error(error)
  }
}

async function handleDownload(row: any) {
  try {
    const blob = await downloadFile(row.filePath)
    downloadBlob(blob, row.originalFileName || row.fileName || 'download')
  } catch (error) {
    console.error(error)
  }
}

function handlePreview(row: any) {
  if (!row?.id) {
    ElMessage.warning('文件信息不完整')
    return
  }
  if (!row.contentType || !row.contentType.startsWith('image/')) {
    ElMessage.warning('仅支持图片文件预览')
    return
  }

  const previewUrl = row.accessUrl || buildPreviewUrl(row.id)
  if (!previewUrl) {
    ElMessage.warning('预览地址不存在')
    return
  }
  window.open(toBrowserOpenUrl(previewUrl), '_blank')
}

function buildPreviewUrl(fileId: string) {
  if (!fileId) {
    return ''
  }
  const baseApi = (import.meta.env.VITE_BASE_API || '').replace(/\/$/, '')
  if (!baseApi) {
    return `/file/preview/${fileId}`
  }
  return `${baseApi}/file/preview/${fileId}`
}

function toBrowserOpenUrl(url: string) {
  if (!url) {
    return ''
  }
  if (/^https?:\/\//.test(url)) {
    return url
  }
  if (!url.startsWith('/')) {
    return url
  }
  if (import.meta.env.DEV) {
    const prefix = (import.meta.env.VITE_BASE_PRE || '/api').replace(/\/$/, '')
    return `${prefix}${url}`
  }
  return url
}

async function handleDelete(row: any) {
  ElMessageBox.confirm(`确认删除文件 ${row.fileName} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteFile(row.filePath)
      await fetchList()
      ElMessage.success('删除成功')
    })
    .catch(() => {
    })
}

function copyPath(path: string) {
  if (!path) {
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = path
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  ElMessage.success('已复制')
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// created
fetchList()
</script>

<style scoped>
.search-form {
  margin-bottom: 12px;
}

.upload-section {
  margin-bottom: 16px;
}

.upload-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.dir-input {
  width: 240px;
}

.platform-select {
  width: 180px;
}

.upload-failed {
  margin-bottom: 16px;
}

.failed-table {
  margin-top: 10px;
}

.failed-actions {
  margin-top: 10px;
  text-align: right;
}

.page-pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
