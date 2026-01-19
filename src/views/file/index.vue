<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>文件管理</span>
      </div>

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
            <el-button type="primary" size="small" v-perm="'system:file:upload'">单文件上传</el-button>
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
            <el-button size="small" v-perm="'system:file:uploadBatch'">选择批量文件</el-button>
          </el-upload>
          <el-button type="success" size="small" v-perm="'system:file:uploadBatch'" @click="submitBatchUpload">
            批量上传
          </el-button>
        </div>
      </div>

      <div v-if="failedUploads.length" class="upload-failed">
        <el-alert title="以下文件上传失败，可重试或移除" type="warning" show-icon :closable="false"/>
        <el-table :data="failedUploads" border size="mini" class="failed-table">
          <el-table-column prop="name" label="文件名" min-width="200"/>
          <el-table-column prop="reason" label="失败原因" min-width="200"/>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="retryFailed(scope.row)">重试</el-button>
              <el-button size="mini" @click="removeFailed(scope.row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="failed-actions">
          <el-button size="mini" type="primary" @click="retryAllFailed">全部重试</el-button>
          <el-button size="mini" @click="clearFailed">清空列表</el-button>
        </div>
      </div>

      <el-table :data="fileRecords" border stripe>
        <el-table-column prop="fileName" label="文件名称" min-width="180"/>
        <el-table-column prop="originalFileName" label="原始名称" min-width="180"/>
        <el-table-column prop="filePath" label="文件路径" min-width="220"/>
        <el-table-column prop="fileSize" label="大小(bytes)" width="120"/>
        <el-table-column prop="platform" label="平台" width="120"/>
        <el-table-column prop="uploadTime" label="上传时间" min-width="160"/>
        <el-table-column label="操作" min-width="220" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="copyPath(scope.row.filePath)">复制路径</el-button>
            <el-button size="mini" v-perm="'system:file:tempDownload'" @click="handleTempDownload(scope.row)">临时下载</el-button>
            <el-button size="mini" v-perm="'system:file:download'" @click="handleDownload(scope.row)">下载</el-button>
            <el-button size="mini" type="danger" v-perm="'system:file:delete'" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import {
  deleteFile,
  downloadFile,
  getTemporaryDownloadUrl,
  localDownloadFile,
  uploadFile,
  uploadFilesBatch,
  uploadFileToPlatform
} from '@/api/file'
import {Message} from 'element-ui'

export default {
  name: 'FilePage',
  data() {
    return {
      uploadDirectory: '',
      uploadPlatform: '',
      batchFileList: [],
      fileRecords: [],
      failedUploads: []
    }
  },
  methods: {
    async uploadOneFile(file, platform, directory) {
      const formData = new FormData()
      formData.append('file', file)
      if (platform) {
        return uploadFileToPlatform(formData, platform, directory)
      }
      return uploadFile(formData, directory)
    },
    addFailedUpload(file, reason) {
      if (!file) {
        return
      }
      const uid = file.uid || `${file.name}_${file.size}_${file.lastModified}`
      if (this.failedUploads.some(item => item.uid === uid)) {
        return
      }
      this.failedUploads.push({
        uid,
        name: file.name,
        file,
        platform: this.uploadPlatform,
        directory: this.uploadDirectory,
        reason: reason || '上传失败'
      })
    },
    async handleSingleUpload(option) {
      try {
        const record = await this.uploadOneFile(option.file, this.uploadPlatform, this.uploadDirectory)
        if (record) {
          this.fileRecords.unshift(record)
          Message.success('上传成功')
        }
        if (option.onSuccess) {
          option.onSuccess(record)
        }
      } catch (error) {
        console.error(error)
        Message.error(`上传失败：${option.file?.name || ''}`)
        this.addFailedUpload(option.file, '单文件上传失败')
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
        const records = await uploadFilesBatch(formData, this.uploadDirectory)
        if (Array.isArray(records)) {
          this.fileRecords = records.concat(this.fileRecords)
        }
        this.batchFileList = []
        if (this.$refs.batchUpload) {
          this.$refs.batchUpload.clearFiles()
        }
        Message.success('批量上传成功')
      } catch (error) {
        console.error(error)
        Message.error('批量上传失败')
        this.batchFileList.forEach(item => this.addFailedUpload(item.raw || item, '批量上传失败'))
        this.batchFileList = []
        if (this.$refs.batchUpload) {
          this.$refs.batchUpload.clearFiles()
        }
      }
    },
    async retryFailed(item) {
      try {
        const record = await this.uploadOneFile(item.file, item.platform, item.directory)
        if (record) {
          this.fileRecords.unshift(record)
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
        // 逐个重试，避免并发导致失败
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
        if (url) {
          window.open(url)
        } else {
          const blob = await localDownloadFile(row.filePath)
          if (blob) {
            this.downloadBlob(blob, row.originalFileName || row.fileName || 'download')
          } else {
            Message.warning('临时下载链接获取失败')
          }
        }
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
    async handleDelete(row) {
      this.$confirm(`确认删除文件 ${row.fileName} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await deleteFile(row.filePath)
          this.fileRecords = this.fileRecords.filter(item => item.filePath !== row.filePath)
          Message.success('删除成功')
        })
        .catch(() => {})
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
.page-container {
  padding: 10px;
}

.card-header {
  font-weight: 600;
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
</style>
