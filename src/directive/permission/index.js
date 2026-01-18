import Vue from 'vue'
import store from '@/store'

function hasPermission(value) {
  if (!value) {
    return true
  }
  const permissions = store.state.permission.permissions || []
  const required = Array.isArray(value) ? value : [value]
  // 只要匹配到任一权限即可显示
  return required.some(item => permissions.includes(item))
}

Vue.directive('perm', {
  inserted(el, binding) {
    if (!hasPermission(binding.value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
})
