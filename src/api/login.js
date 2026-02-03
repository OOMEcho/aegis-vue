import {postRequest, getRequest} from "@/utils/request"

/**
 * 登录接口 - 按类型统一提交
 * @param {Object} params
 *   loginType: 'password' | 'email' | 'phone'
 *   username/email/phone: 根据类型填写
 *   password/code: 根据类型填写
 *   captchaKey: 验证码 key
 *   slideX: 滑块位置
 */
export function login(params) {
  const {loginType, username, password, email, code, phone, captchaKey, slideX} = params;

  const payload = {
    loginType,
    captchaKey,
    slideX
  };

  switch (loginType) {
    case 'password':
      payload.username = username;
      payload.password = password;
      break;
    case 'email':
      payload.email = email;
      payload.code = code;
      break;
    case 'sms':
      payload.phone = phone;
      payload.code = code;
      break;
    default:
      throw new Error('不支持的登录类型');
  }

  return postRequest('/login', payload);
}

/**
 * 获取重置倒计时信息
 */
export function getDemoResetCountdown() {
  return getRequest('/demo/reset/countdown')
}
