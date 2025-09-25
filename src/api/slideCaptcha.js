import {getRequest} from "@/api/request"

export function generateCaptcha() {
  return getRequest('/profile/generate/captcha')
}
