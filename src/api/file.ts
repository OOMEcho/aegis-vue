import axios from 'axios'
import { getRequest, postRequest, deleteRequest } from '@/utils/request'

export function getFilePageList(params: Record<string, unknown>) {
  return getRequest('/file/pageList', params)
}

export function deleteFile(filePath: string) {
  return deleteRequest('/file/delete', null, { params: { filePath } })
}

export function downloadFile(filePath: string) {
  return getRequest('/file/download', { filePath }, { responseType: 'blob' })
}

export function localDownloadFile(path: string) {
  if (!path) return null
  const isFullUrl = /^https?:\/\//.test(path)
  const isLocalPath = path.startsWith('/file/localDownload')
  if (isFullUrl || isLocalPath) {
    return getRequest(path, {}, { responseType: 'blob' })
  }
  return getTemporaryDownloadUrl(path).then((data: Record<string, string>) => {
    const url = data?.downloadUrl || data?.url || Object.values(data || {})[0]
    if (!url) return null
    return getRequest(url, {}, { responseType: 'blob' })
  })
}

export function getPresignedUploadUrl(fileName: string, directory?: string) {
  const params: Record<string, string> = { fileName }
  if (directory) params.directory = directory
  return getRequest('/file/presigned-upload-url', params)
}

export function completePresignedUpload(data: Record<string, unknown>) {
  return postRequest('/file/presigned-upload-complete', data)
}

export function uploadToPresignedUrl(uploadUrl: string, file: File | Blob) {
  return axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file?.type || 'application/octet-stream' }
  })
}

export function getTemporaryDownloadUrl(filePath: string, expirationSeconds?: number) {
  const params: Record<string, unknown> = { filePath }
  if (expirationSeconds) params.expirationSeconds = expirationSeconds
  return getRequest('/file/temporary-download-url', params)
}

export function uploadFile(formData: FormData, directory?: string) {
  if (directory) formData.append('directory', directory)
  return postRequest('/file/upload', formData)
}

export function uploadFilesBatch(formData: FormData, directory?: string) {
  if (directory) formData.append('directory', directory)
  return postRequest('/file/upload/batch', formData)
}

export function uploadFileToPlatform(formData: FormData, platform: string, directory?: string) {
  if (directory) formData.append('directory', directory)
  return postRequest(`/file/upload/${platform}`, formData)
}
