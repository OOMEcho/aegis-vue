import axios from 'axios'
import {getRequest, postRequest, deleteRequest} from "@/utils/request"

/**
 * 文件分页列表
 * @param {Object} params 查询参数
 */
export function getFilePageList(params) {
  return getRequest('/file/pageList', params)
}

/**
 * 文件删除
 * @param {string} filePath 文件路径
 */
export function deleteFile(filePath) {
  return deleteRequest('/file/delete', null, {params: {filePath}})
}

/**
 * 文件下载
 * @param {string} filePath 文件路径
 */
export function downloadFile(filePath) {
  return getRequest('/file/download', {filePath}, {responseType: 'blob'})
}

/**
 * 本地文件临时下载
 * @param {string} path 文件路径参数
 */
export function localDownloadFile(path) {
  if (!path) {
    return null
  }
  const isFullUrl = /^https?:\/\//.test(path)
  const isLocalPath = path.startsWith('/file/localDownload')
  if (isFullUrl || isLocalPath) {
    return getRequest(path, {}, {responseType: 'blob'})
  }
  return getTemporaryDownloadUrl(path).then(data => {
    const url = data?.downloadUrl || data?.url || Object.values(data || {})[0]
    if (!url) {
      return null
    }
    return getRequest(url, {}, {responseType: 'blob'})
  })
}

/**
 * 获取预签名上传URL
 * @param {string} fileName 文件名
 * @param {string} directory 目录（可选）
 */
export function getPresignedUploadUrl(fileName, directory) {
  const params = {fileName}
  if (directory) {
    params.directory = directory
  }
  return getRequest('/file/presigned-upload-url', params)
}

/**
 * 预签名上传完成入库
 * @param {Object} data 完成信息
 */
export function completePresignedUpload(data) {
  return postRequest('/file/presigned-upload-complete', data)
}

/**
 * 直传文件到预签名URL
 * @param {string} uploadUrl 预签名上传URL
 * @param {File|Blob} file 文件对象
 */
export function uploadToPresignedUrl(uploadUrl, file) {
  return axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file?.type || 'application/octet-stream'
    }
  })
}

/**
 * 获取临时下载URL
 * @param {string} filePath 文件路径
 * @param {number} expirationSeconds 过期时间（秒）
 */
export function getTemporaryDownloadUrl(filePath, expirationSeconds) {
  const params = {filePath}
  if (expirationSeconds) {
    params.expirationSeconds = expirationSeconds
  }
  return getRequest('/file/temporary-download-url', params)
}

/**
 * 文件上传
 * @param {FormData} formData 包含文件的表单数据
 * @param {string} directory 目录（可选）
 */
export function uploadFile(formData, directory) {
  if (directory) {
    formData.append('directory', directory)
  }
  return postRequest('/file/upload', formData)
}

/**
 * 批量文件上传
 * @param {FormData} formData 包含多个文件的表单数据
 * @param {string} directory 目录（可选）
 */
export function uploadFilesBatch(formData, directory) {
  if (directory) {
    formData.append('directory', directory)
  }
  return postRequest('/file/upload/batch', formData)
}

/**
 * 指定存储平台上传文件
 * @param {FormData} formData 包含文件的表单数据
 * @param {string} platform 存储平台 (LOCAL,MINIO,ALIYUN_OSS,TENCENT_COS)
 * @param {string} directory 目录（可选）
 */
export function uploadFileToPlatform(formData, platform, directory) {
  if (directory) {
    formData.append('directory', directory)
  }
  return postRequest(`/file/upload/${platform}`, formData)
}
