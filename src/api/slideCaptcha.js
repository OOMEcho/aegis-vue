import {getRequest,postRequest} from "@/utils/request"

export function generateCaptcha() {
  return getRequest('/user/captcha/generate')
}

export function verifyCaptcha(captchaKey, slideX) {
  return postRequest('/user/captcha/verify', {captchaKey, slideX})
}
