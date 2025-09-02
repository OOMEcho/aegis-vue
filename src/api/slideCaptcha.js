import {getRequest,postRequest} from "@/utils/request"

export function generateCaptcha() {
  return getRequest('/captcha/generate')
}

export function verifyCaptcha(captchaKey, slideX) {
  return postRequest('/captcha/verify', {captchaKey, slideX})
}
