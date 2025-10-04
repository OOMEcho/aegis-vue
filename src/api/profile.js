import {getRequest, postRequest, putRequest} from "@/api/index"

/**
 * 生成验证码
 */
export function generateCaptcha() {
  return getRequest('/profile/generate/captcha')
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return getRequest('/profile/info')
}

/**
 * 获取RSA公钥
 */
export function getPublicKey() {
  return getRequest('/profile/publicKey')
}

/**
 * 刷新token
 */
export function refreshToken() {
  return getRequest('/profile/refreshToken')
}

/**
 * 注册用户
 * @param {Object} data 用户注册数据
 * @param {string} data.captchaKey 验证码key
 * @param {string} data.code 验证码
 * @param {string} data.confirmPassword 确认密码
 * @param {string} data.email 邮箱
 * @param {string} data.password 密码
 * @param {number} data.slideX 滑块X轴位置
 * @param {string} data.username 用户名
 */
export function register(data) {
  return postRequest('/profile/register', data)
}

/**
 * 获取路由
 */
export function getRouters() {
  return getRequest('/profile/routers')
}

/**
 * 发送注册验证码
 * @param {string} email 邮箱
 */
export function sendEmailCode(email) {
  return getRequest('/profile/sendEmailCode', {email})
}

/**
 * 修改用户密码
 * @param {Object} data 修改密码数据
 * @param {string} data.confirmPassword 确认密码
 * @param {string} data.email 邮箱
 * @param {string} data.nickname 呢称
 * @param {string} data.oldPassword 旧密码
 * @param {string} data.password 密码
 * @param {string} data.phone 电话
 * @param {string} data.sex 性别
 */
export function updatePassword(data) {
  return putRequest('/profile/updatePassword', data)
}

/**
 * 修改个人信息
 * @param {Object} data 修改信息数据
 * @param {string} data.confirmPassword 确认密码
 * @param {string} data.email 邮箱
 * @param {string} data.nickname 呢称
 * @param {string} data.oldPassword 旧密码
 * @param {string} data.password 密码
 * @param {string} data.phone 电话
 * @param {string} data.sex 性别
 */
export function updateProfile(data) {
  return putRequest('/profile/updateProfile', data)
}

/**
 * 上传用户头像
 * @param {FormData} formData 包含文件的表单数据
 */
export function uploadAvatar(formData) {
  return postRequest('/profile/upload/avatar', formData)
}
