<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>文件管理</span>
      </div>

      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
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
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
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
            <el-button type="primary" size="small" v-perm="PERMS.file.upload">单文件上传</el-button>
          </el-upload>
          <el-upload
            action="#"
            :show-file-list="false"
            :http-request="handlePresignedUpload">
            <el-button type="warning" size="small" v-perm="PERMS.file.upload">预签名上传</el-button>
          </el-upload>
        </div>
        <div class="upload-row">
          <el-upload
            ref="batchUpload"
            action="#"
            multiple
            :auto-upload="false"
            :file-list="batchFileList"
            :on-change="handleBatchChange"
            :on-remove="handleBatchRemove">
            <el-button size="small" v-perm="PERMS.file.uploadBatch">选择批量文件</el-button>
          </el-upload>
          <el-button type="success" size="small" v-perm="PERMS.file.uploadBatch" @click="submitBatchUpload">
            批量上传
          </el-button>
        </div>
      </div>

      <div v-if="failedUploads.length" class="upload-failed">
        <el-alert title="以下文件上传失败，可重试或移除" type="warning" show-icon :closable="false"/>
        <el-table :data="failedUploads" border size="mini" class="failed-table">
          <el-table-column prop="name" label="文件名" min-width="200"/>
          <el-table-column prop="reason" label="失败原因" min-width="200"/>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-tooltip content="重试" placement="top" popper-class="action-tooltip">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-refresh"
                    class="action-icon is-neutral"
                    @click="retryFailed(scope.row)"/>
                </el-tooltip>
                <el-tooltip content="移除" placement="top" popper-class="action-tooltip">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-close"
                    class="action-icon is-neutral"
                    @click="removeFailed(scope.row)"/>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="failed-actions">
          <el-button size="mini" type="primary" @click="retryAllFailed">全部重试</el-button>
          <el-button size="mini" @click="clearFailed">清空列表</el-button>
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
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-tooltip content="预览" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-view"
                  class="action-icon is-neutral"
                  @click="handlePreview(scope.row)"/>
              </el-tooltip>
              <el-tooltip content="复制路径" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-document-copy"
                  class="action-icon is-neutral"
                  @click="copyPath(scope.row.filePath)"/>
              </el-tooltip>
              <el-tooltip v-perm="PERMS.file.tempDownload" content="临时下载" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-link"
                  class="action-icon is-neutral"
                  @click="handleTempDownload(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-perm="PERMS.file.download" content="下载" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-download"
                  class="action-icon is-neutral"
                  @click="handleDownload(scope.row)"/>
              </el-tooltip>
              <el-dropdown v-perm="PERMS.file.delete" trigger="click" popper-class="action-dropdown">
                <span class="action-dropdown-trigger">
                  <el-tooltip content="更多操作" placement="top" popper-class="action-tooltip">
                    <el-button type="text" size="mini" icon="el-icon-more" class="action-icon is-neutral"/>
                  </el-tooltip>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item class="danger-item" @click.native="handleDelete(scope.row)">
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
  </div>
</template>

<script>
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
import {PERMS} from '@/utils/permCode'
import {Message} from 'element-ui'

export default {
  name: 'FilePage',
  data() {
    return {
      loading: false,
      total: 0,
      queryParams: this.getDefaultQueryParams(),
      uploadDirectory: '',
      uploadPlatform: '',
      batchFileList: [],
      fileRecords: [],
      failedUploads: [],
      PERMS
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    getDefaultQueryParams() {
      return {
        pageNum: 1,
        pageSize: 10,
        originalFileName: '',
        platform: ''
      }
    },
    normalizeRecord(record) {
      if (!record) {
        return record
      }
      const result = {...record}
      if (!result.accessUrl && result.id) {
        result.accessUrl = this.buildPreviewUrl(result.id)
      }
      return result
    },
    async fetchList() {
      this.loading = true
      try {
        const data = await getFilePageList(this.queryParams)
        const records = Array.isArray(data?.records) ? data.records : []
        this.fileRecords = records.map(item => this.normalizeRecord(item))
        this.total = Number(data?.total || 0)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    handleReset() {
      this.queryParams = this.getDefaultQueryParams()
      this.fetchList()
    },
    handlePageChange(page) {
      this.queryParams.pageNum = page
      this.fetchList()
    },
    handleSizeChange(size) {
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = size
      this.fetchList()
    },
    async uploadOneFile(file, platform, directory) {
      const formData = new FormData()
      formData.append('file', file)
      if (platform) {
        return uploadFileToPlatform(formData, platform, directory)
      }
      return uploadFile(formData, directory)
    },
    async uploadOneFileByPresigned(file, directory) {
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
    },
    addFailedUpload(file, reason, mode = 'normal') {
      if (!file) {
        return
      }
      const uid = file.uid || `${file.name}_${file.size}_${file.lastModified}_${mode}`
      if (this.failedUploads.some(item => item.uid === uid)) {
        return
      }
      this.failedUploads.push({
        uid,
        name: file.name,
        file,
        platform: this.uploadPlatform,
        directory: this.uploadDirectory,
        mode,
        reason: reason || '上传失败'
      })
    },
    async handleSingleUpload(option) {
      try {
        const record = await this.uploadOneFile(option.file, this.uploadPlatform, this.uploadDirectory)
        if (record) {
          await this.fetchList()
          Message.success('上传成功')
        }
        if (option.onSuccess) {
          option.onSuccess(record)
        }
      } catch (error) {
        console.error(error)
        Message.error(`上传失败：${option.file?.name || ''}`)
        this.addFailedUpload(option.file, '单文件上传失败', 'normal')
        if (option.onError) {
          option.onError(error)
        }
      }
    },
    async handlePresignedUpload(option) {
      try {
        if (this.uploadPlatform) {
          Message.warning('预签名上传使用系统默认存储平台，已忽略当前手动平台选择')
        }
        const record = await this.uploadOneFileByPresigned(option.file, this.uploadDirectory)
        if (record) {
          await this.fetchList()
          Message.success('预签名上传成功')
        }
        if (option.onSuccess) {
          option.onSuccess(record)
        }
      } catch (error) {
        console.error(error)
        Message.error(error?.message || `预签名上传失败：${option.file?.name || ''}`)
        this.addFailedUpload(option.file, '预签名上传失败', 'presigned')
        if (option.onError) {
          option.onError(error)
        }
      }
    },
    handleBatchChange(file, fileList) {
      this.batchFileList = fileList
    },
    handleBatchRemove(file, fileList) {
      this.batchFileList = fileList
    },
    async submitBatchUpload() {
      if (!this.batchFileList.length) {
        Message.warning('请先选择文件')
        return
      }
      const formData = new FormData()
      this.batchFileList.forEach(item => {
        formData.append('files', item.raw)
      })
      try {
        await uploadFilesBatch(formData, this.uploadDirectory)
        await this.fetchList()
        this.batchFileList = []
        if (this.$refs.batchUpload) {
          this.$refs.batchUpload.clearFiles()
        }
        Message.success('批量上传成功')
      } catch (error) {
        console.error(error)
        Message.error('批量上传失败')
        this.batchFileList.forEach(item => this.addFailedUpload(item.raw || item, '批量上传失败', 'normal'))
        this.batchFileList = []
        if (this.$refs.batchUpload) {
          this.$refs.batchUpload.clearFiles()
        }
      }
    },
    async retryFailed(item) {
      try {
        let record = null
        if (item.mode === 'presigned') {
          record = await this.uploadOneFileByPresigned(item.file, item.directory)
        } else {
          record = await this.uploadOneFile(item.file, item.platform, item.directory)
        }

        if (record) {
          await this.fetchList()
        }
        this.removeFailed(item)
        Message.success('重试成功')
      } catch (error) {
        console.error(error)
        Message.error(`重试失败：${item.name}`)
      }
    },
    async retryAllFailed() {
      const queue = [...this.failedUploads]
      for (const item of queue) {
        await this.retryFailed(item)
      }
    },
    removeFailed(item) {
      this.failedUploads = this.failedUploads.filter(row => row.uid !== item.uid)
    },
    clearFailed() {
      this.failedUploads = []
    },
    async handleTempDownload(row) {
      try {
        const data = await getTemporaryDownloadUrl(row.filePath)
        const url = data?.downloadUrl || data?.url || Object.values(data || {})[0]
        if (!url) {
          const blob = await localDownloadFile(row.filePath)
          if (blob) {
            this.downloadBlob(blob, row.originalFileName || row.fileName || 'download')
            return
          }
          Message.warning('临时下载链接获取失败')
          return
        }

        if (/^https?:\/\//.test(url)) {
          window.open(url)
          return
        }

        const blob = await localDownloadFile(url)
        if (blob) {
          this.downloadBlob(blob, row.originalFileName || row.fileName || 'download')
          return
        }

        window.open(this.toBrowserOpenUrl(url))
      } catch (error) {
        console.error(error)
      }
    },
    async handleDownload(row) {
      try {
        const blob = await downloadFile(row.filePath)
        this.downloadBlob(blob, row.originalFileName || row.fileName || 'download')
      } catch (error) {
        console.error(error)
      }
    },
    handlePreview(row) {
      if (!row?.id) {
        Message.warning('文件信息不完整')
        return
      }
      if (!row.contentType || !row.contentType.startsWith('image/')) {
        Message.warning('仅支持图片文件预览')
        return
      }

      const previewUrl = row.accessUrl || this.buildPreviewUrl(row.id)
      if (!previewUrl) {
        Message.warning('预览地址不存在')
        return
      }
      window.open(this.toBrowserOpenUrl(previewUrl), '_blank')
    },
    buildPreviewUrl(fileId) {
      if (!fileId) {
        return ''
      }
      const baseApi = (process.env.VUE_APP_BASE_API || '').replace(/\/$/, '')
      if (!baseApi) {
        return `/file/preview/${fileId}`
      }
      return `${baseApi}/file/preview/${fileId}`
    },
    toBrowserOpenUrl(url) {
      if (!url) {
        return ''
      }
      if (/^https?:\/\//.test(url)) {
        return url
      }
      if (!url.startsWith('/')) {
        return url
      }
      if (process.env.NODE_ENV === 'development') {
        const prefix = (process.env.VUE_APP_BASE_PRE || '/api').replace(/\/$/, '')
        return `${prefix}${url}`
      }
      return url
    },
    async handleDelete(row) {
      this.$confirm(`确认删除文件 ${row.fileName} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await deleteFile(row.filePath)
          await this.fetchList()
          Message.success('删除成功')
        })
        .catch(() => {
        })
    },
    copyPath(path) {
      if (!path) {
        return
      }
      const textarea = document.createElement('textarea')
      textarea.value = path
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      Message.success('已复制')
    },
    downloadBlob(blob, filename) {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  }
}
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
