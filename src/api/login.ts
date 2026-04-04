import { postRequest, getRequest } from '@/utils/request'

export interface LoginParams {
  loginType: 'password' | 'email' | 'sms'
  username?: string
  password?: string
  email?: string
  code?: string
  phone?: string
  captchaKey: string
  slideX: number
}

export function login(params: LoginParams) {
  const { loginType, username, password, email, code, phone, captchaKey, slideX } = params

  const payload: Record<string, unknown> = { loginType, captchaKey, slideX }

  switch (loginType) {
    case 'password':
      payload.username = username
      payload.password = password
      break
    case 'email':
      payload.email = email
      payload.code = code
      break
    case 'sms':
      payload.phone = phone
      payload.code = code
      break
    default:
      throw new Error('不支持的登录类型')
  }

  return postRequest('/login', payload)
}

export function getDemoResetCountdown() {
  return getRequest('/demo/reset/countdown')
}
