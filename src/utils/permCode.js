// Centralized permission map for v-perm usage and permission checks.
export const PERMS = Object.freeze({
  // User management
  user: {
    page: 'system:user:page',
    add: 'system:user:add',
    update: 'system:user:update',
    delete: 'system:user:delete',
    status: 'system:user:status',
    resetPwd: 'system:user:resetPwd',
    kick: 'system:user:kick'
  },
  // Role management
  role: {
    page: 'system:role:page',
    add: 'system:role:add',
    update: 'system:role:update',
    delete: 'system:role:delete',
    status: 'system:role:status',
    permList: 'system:role:perm:list',
    dataScope: 'system:role:dataScope'
  },
  // Menu management
  menu: {
    page: 'system:menu:page',
    add: 'system:menu:add',
    update: 'system:menu:update',
    delete: 'system:menu:delete',
    permList: 'system:menu:perm:list'
  },
  // Department management
  dept: {
    add: 'system:dept:add',
    update: 'system:dept:update',
    delete: 'system:dept:delete'
  },
  // Permission management
  permission: {
    page: 'system:permission:page',
    add: 'system:permission:add',
    update: 'system:permission:update',
    effective: 'system:permission:effective'
  },
  // Resource management
  resource: {
    add: 'system:resource:add',
    update: 'system:resource:update',
    delete: 'system:resource:delete'
  },
  // Dictionary management
  dict: {
    add: 'system:dict:add',
    update: 'system:dict:update',
    delete: 'system:dict:delete'
  },
  // Whitelist management
  whitelist: {
    add: 'system:whitelist:add',
    update: 'system:whitelist:update',
    delete: 'system:whitelist:delete'
  },
  // Notice management
  notice: {
    page: 'system:notice:page',
    add: 'system:notice:add',
    update: 'system:notice:update',
    delete: 'system:notice:delete',
    publish: 'system:notice:publish',
    revoke: 'system:notice:revoke'
  },
  // File management
  file: {
    upload: 'system:file:upload',
    uploadBatch: 'system:file:uploadBatch',
    tempDownload: 'system:file:tempDownload',
    download: 'system:file:download',
    delete: 'system:file:delete'
  },
  // Log management
  log: {
    loginPage: 'system:loginLog:page',
    loginExport: 'system:loginLog:export',
    operateExport: 'system:operateLog:export'
  }
})
