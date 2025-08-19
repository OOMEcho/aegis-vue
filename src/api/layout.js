import {getRequest} from "@/utils/request"

export function getLayout() {
  return getRequest('/hello')
}
