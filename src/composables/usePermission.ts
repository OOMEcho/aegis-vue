import { usePermissionStore } from '@/stores/permission'

export function usePermission() {
  function hasPerm(value: string | string[]): boolean {
    if (!value) return true
    const permissionStore = usePermissionStore()
    const permissions = permissionStore.permissions || []
    const required = Array.isArray(value) ? value : [value]
    return required.some(item => permissions.includes(item))
  }

  return { hasPerm }
}
