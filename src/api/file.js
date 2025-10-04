import {getRequest, postRequest, deleteRequest} from "@/api/index"

/**
 * 文件删除
 * @param {string} filePath 文件路径
 */
export function deleteFile(filePath) {
  return deleteRequest('/file/delete', {filePath})
}

/**
 * 文件下载
 * @param {string} filePath 文件路径
 */
export function downloadFile(filePath) {
  return getRequest('/file/download', {filePath})
}

/**
 * 本地文件临时下载
 * @param {string} path 文件路径参数
 */
export function localDownloadFile(path) {
  return getRequest(`/file/localDownload/${path}`)
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
