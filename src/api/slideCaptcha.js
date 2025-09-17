import {getRequest,postRequest} from "@/api/request"

export function generateCaptcha() {
  return getRequest('/profile/generate/captcha')
}

export function verifyCaptcha(captchaKey, slideX) {
  return postRequest('/profile/captcha/verify', {captchaKey, slideX})
}
