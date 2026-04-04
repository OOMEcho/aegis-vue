import { getRequest, postRequest, putRequest } from '@/utils/request'

export function generateCaptcha() {
  return getRequest('/profile/generate/captcha')
}

export function getUserInfo() {
  return getRequest('/profile/info')
}

export function getAvatarPreview() {
  return getRequest('/profile/avatar/preview', null, { responseType: 'blob' })
}

export function getPublicKey() {
  return getRequest('/profile/publicKey')
}

export function register(data: Record<string, unknown>) {
  return postRequest('/profile/register', data)
}

export function sendEmailCode(email: string) {
  return getRequest('/profile/sendEmailCode', { email })
}

export function updatePassword(data: Record<string, unknown>) {
  return putRequest('/profile/updatePassword', data)
}

export function updateProfile(data: Record<string, unknown>) {
  return putRequest('/profile/updateProfile', data)
}

export function uploadAvatar(formData: FormData) {
  return postRequest('/profile/upload/avatar', formData)
}

export function logout() {
  return postRequest('/logout')
}
