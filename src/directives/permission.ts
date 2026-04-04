import type { Directive } from 'vue'
import { usePermissionStore } from '@/stores/permission'

export const permDirective: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    if (!binding.value) return
    const permissionStore = usePermissionStore()
    const permissions = permissionStore.permissions
    const required = Array.isArray(binding.value) ? binding.value : [binding.value]
    if (!required.some(item => permissions.includes(item))) {
      el.parentNode?.removeChild(el)
    }
  }
}
