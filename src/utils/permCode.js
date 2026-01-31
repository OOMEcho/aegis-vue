// v-perm 使用和权限检查的集中权限映射.
export const PERMS = Object.freeze({
  // 用户管理
  user: {
    page: 'system:user:page',
    add: 'system:user:add',
    update: 'system:user:update',
    delete: 'system:user:delete',
    status: 'system:user:status',
    resetPwd: 'system:user:resetPwd',
    kick: 'system:user:kick'
  },
  // 角色管理
  role: {
    page: 'system:role:page',
    add: 'system:role:add',
    update: 'system:role:update',
    delete: 'system:role:delete',
    status: 'system:role:status',
    permList: 'system:role:perm:list',
    dataScope: 'system:role:dataScope'
  },
  // 菜单管理
  menu: {
    page: 'system:menu:page',
    add: 'system:menu:add',
    update: 'system:menu:update',
    delete: 'system:menu:delete',
    permList: 'system:menu:perm:list'
  },
  // 部门管理
  dept: {
    add: 'system:dept:add',
    update: 'system:dept:update',
    delete: 'system:dept:delete'
  },
  // 权限管理
  permission: {
    page: 'system:permission:page',
    add: 'system:permission:add',
    update: 'system:permission:update',
    effective: 'system:permission:effective'
  },
  // 资源管理
  resource: {
    add: 'system:resource:add',
    update: 'system:resource:update',
    delete: 'system:resource:delete'
  },
  // 字典管理
  dict: {
    add: 'system:dict:add',
    update: 'system:dict:update',
    delete: 'system:dict:delete'
  },
  // 白名单管理
  whitelist: {
    add: 'system:whitelist:add',
    update: 'system:whitelist:update',
    delete: 'system:whitelist:delete'
  },
  // 通知管理
  notice: {
    page: 'system:notice:page',
    add: 'system:notice:add',
    update: 'system:notice:update',
    delete: 'system:notice:delete',
    publish: 'system:notice:publish',
    revoke: 'system:notice:revoke'
  },
  // 文件管理
  file: {
    upload: 'system:file:upload',
    uploadBatch: 'system:file:uploadBatch',
    tempDownload: 'system:file:tempDownload',
    download: 'system:file:download',
    delete: 'system:file:delete'
  },
  // 日志管理
  log: {
    loginPage: 'system:loginLog:page',
    loginExport: 'system:loginLog:export',
    operateExport: 'system:operateLog:export'
  }
})
