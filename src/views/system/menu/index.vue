<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
        </div>
      </template>

      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="菜单名称">
          <el-input v-model="queryParams.menuName" placeholder="菜单名称" clearable/>
        </el-form-item>
        <el-form-item label="菜单编码">
          <el-input v-model="queryParams.menuCode" placeholder="菜单编码" clearable/>
        </el-form-item>
        <el-form-item label="菜单类型">
          <el-select v-model="queryParams.menuType" placeholder="菜单类型" clearable>
            <el-option label="目录" value="D"/>
            <el-option label="菜单" value="M"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="状态" clearable>
            <el-option
              v-for="item in dicts.DATA_STATUS || []"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="fetchList">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <el-button type="primary" size="small" icon="Plus" v-perm="PERMS.menu.add" @click="handleAdd">
          新增
        </el-button>
        <el-button size="small" icon="Fold" @click="toggleExpand">
          {{ expandAll ? '折叠全部' : '展开全部' }}
        </el-button>
      </div>

      <el-table
        :data="tableData"
        :key="tableKey"
        row-key="id"
        border
        stripe
        v-loading="loading"
        :default-expand-all="expandAll"
        :tree-props="{children: 'children'}">
        <el-table-column prop="menuName" label="菜单名称" min-width="160"/>
        <el-table-column prop="menuCode" label="菜单编码" min-width="160"/>
        <el-table-column label="图标" width="100">
          <template #default="scope">
            <i v-if="scope.row.icon && scope.row.icon !== '#'" class="iconfont table-icon" :class="scope.row.icon"></i>
            <span v-else class="icon-placeholder">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" label="排序" width="80"/>
        <el-table-column prop="name" label="路由名称" min-width="140"/>
        <el-table-column prop="path" label="路由地址" min-width="160"/>
        <el-table-column label="类型" width="80">
          <template #default="scope">
            {{ scope.row.menuType === 'D' ? '目录' : '菜单' }}
          </template>
        </el-table-column>
        <el-table-column label="显示" width="80">
          <template #default="scope">
            <el-tag v-if="!scope.row.hidden" type="success" size="small">显示</el-tag>
            <el-tag v-else type="info" size="small">隐藏</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip v-if="hasPerm(PERMS.menu.update)" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-if="hasPerm(PERMS.menu.permList)" content="权限配置" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Lock"
                  class="action-icon is-primary"
                  @click="openPermDialog(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-if="hasPerm(PERMS.menu.delete)" content="删除" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Delete"
                  class="action-icon is-danger"
                  @click="handleDelete(scope.row)"/>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="form.menuName" placeholder="请输入菜单名称"/>
        </el-form-item>
        <el-form-item label="菜单编码" prop="menuCode">
          <el-input v-model="form.menuCode" placeholder="请输入菜单编码"/>
        </el-form-item>
        <el-form-item label="上级菜单" prop="parentId">
          <el-select v-model="form.parentId" placeholder="请选择上级菜单">
            <el-option :label="'顶级目录'" :value="0"/>
            <el-option
              v-for="item in parentOptions"
              :key="item.id"
              :label="item.menuName"
              :value="item.id"
              :disabled="item.menuType === 'M'"/>
          </el-select>
          <div class="form-hint">菜单不能创建子菜单，请选择目录作为上级</div>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0"/>
        </el-form-item>
        <el-form-item label="路由名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入路由名称"/>
        </el-form-item>
        <el-form-item label="路由地址" prop="path">
          <el-input v-model="form.path" placeholder="如 user 或 /user"/>
          <div class="form-hint">仅支持英文字母；不带"/"将自动拼接父级路径，带"/"视为完整路径</div>
          <div v-if="parentPathHint" class="form-hint">当前父级：{{ parentPathHint }}</div>
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="form.menuType">
            <el-radio value="D">目录</el-radio>
            <el-radio value="M">菜单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <div class="icon-field">
            <div class="icon-preview">
              <i v-if="form.icon && form.icon !== '#'" class="iconfont" :class="form.icon"></i>
              <span v-else>无</span>
            </div>
            <el-button size="small" @click="iconDialogVisible = true">选择图标</el-button>
            <el-input v-model="form.icon" placeholder="请输入图标 class" class="icon-input"/>
          </div>
        </el-form-item>
        <el-form-item label="是否隐藏" prop="hidden">
          <el-switch v-model="form.hidden"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option
              v-for="item in dicts.DATA_STATUS || []"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"/>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="权限配置" v-model="permDialogVisible" width="680px">
      <div class="perm-dialog">
        <div class="perm-toolbar">
          <el-input
            v-model="permKeyword"
            placeholder="搜索权限名称或编码"
            size="small"
            clearable
            prefix-icon="Search"/>
        </div>
        <div class="perm-section">
          <div class="perm-section-title">
            <div class="perm-section-info">
              <el-icon><Document /></el-icon>
              <span>页面</span>
              <span class="perm-count">{{ permStats.total }}</span>
              <span v-if="permStats.checked" class="perm-selected">已选 {{ permStats.checked }}</span>
            </div>
            <div class="perm-section-actions">
              <el-button size="small" @click="selectAllPerms">全选</el-button>
              <el-button size="small" @click="clearAllPerms">清空</el-button>
            </div>
          </div>
          <div class="perm-group">
            <el-checkbox-group v-model="permChecked" class="perm-grid">
              <el-checkbox
                v-for="perm in permPageOptions"
                :key="perm.permCode"
                :label="perm.permCode">
                <span class="perm-name">{{ perm.permName }}</span>
                <span class="perm-code">{{ perm.permCode }}</span>
              </el-checkbox>
            </el-checkbox-group>
            <div v-if="!permPageOptions.length" class="perm-empty">暂无匹配权限</div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMenuPermissions">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="选择菜单图标" v-model="iconDialogVisible" width="720px">
      <div class="icon-dialog">
        <el-input
          v-model="iconKeyword"
          placeholder="搜索图标"
          size="small"
          clearable
          class="icon-search"
          @focus="loadIconOptions"
        />
        <div v-if="filteredIconOptions.length" class="icon-grid">
          <button
            v-for="icon in filteredIconOptions"
            :key="icon"
            type="button"
            class="icon-item"
            @click="selectIcon(icon)">
            <i class="iconfont" :class="icon"></i>
            <span>{{ icon }}</span>
          </button>
        </div>
        <div v-else class="icon-empty">未检测到 iconfont 图标</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addMenu,
  deleteMenu,
  getMenuDetail,
  getMenuList,
  updateMenu,
  getMenuPermissions,
  assignMenuPermissions
} from '@/api/menu'
import { getPermissionList } from '@/api/permission'
import { PERMS } from '@/utils/permCode'
import { usePermission } from '@/composables/usePermission'
import { useDict } from '@/composables/useDict'

const { dicts, loadDictOptions, dictLabel } = useDict()
const { hasPerm } = usePermission()

const loading = ref(false)
const queryParams = ref({
  menuName: '',
  menuCode: '',
  menuType: '',
  status: ''
})
const tableData = ref<any[]>([])
const menuOptions = ref<any[]>([])
const expandAll = ref(true)
const tableKey = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')

const formRef = ref<FormInstance>()

// Permission dialog
const permDialogVisible = ref(false)
const permOptions = ref<any[]>([])
const permChecked = ref<string[]>([])
const permKeyword = ref('')
const currentMenuId = ref<number | null>(null)

// Icon dialog
const iconDialogVisible = ref(false)
const iconKeyword = ref('')
const iconOptions = ref<string[]>([])

function getDefaultForm() {
  return {
    id: null as number | null,
    menuCode: '',
    menuName: '',
    parentId: 0,
    orderNum: 0,
    name: '',
    path: '',
    menuType: 'M',
    icon: '',
    hidden: false,
    status: '0'
  }
}

const form = ref(getDefaultForm())

const validateParent = (rule: any, value: any, callback: any) => {
  if (value === undefined || value === null) {
    callback(new Error('请选择上级菜单'))
    return
  }
  if (value === 0) {
    callback()
    return
  }
  const parent = menuOptions.value.find(item => item.id === value)
  if (parent && parent.menuType === 'M') {
    callback(new Error('菜单不能创建子菜单，请选择目录作为上级'))
    return
  }
  callback()
}

const validatePath = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入路由地址'))
  }

  const reg = /^\/[A-Za-z0-9-]+(\/[A-Za-z0-9-]+)*$/

  if (!reg.test(value)) {
    return callback(
      new Error('路由地址需以 / 开头，仅支持字母、数字、-，可多级路径')
    )
  }

  callback()
}

const rules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  menuCode: [{ required: true, message: '请输入菜单编码', trigger: 'blur' }],
  parentId: [{ required: true, validator: validateParent, trigger: 'change' }],
  orderNum: [{ required: true, message: '请输入排序', trigger: 'change' }],
  name: [{ required: true, message: '请输入路由名称', trigger: 'blur' }],
  path: [
    { required: true, message: '请输入路由地址', trigger: 'blur' },
    { validator: validatePath, trigger: 'blur' }
  ],
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }]
}

// Computed
const parentOptions = computed(() => {
  if (!form.value.id) {
    return menuOptions.value
  }
  return menuOptions.value.filter(item => item.id !== form.value.id)
})

const parentPathHint = computed(() => {
  const parent = menuOptions.value.find(item => item.id === form.value.parentId)
  if (!parent || !parent.path) {
    return ''
  }
  return parent.path
})

const filteredPermOptions = computed(() => {
  const keyword = permKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return permOptions.value
  }
  return permOptions.value.filter(item => {
    const name = (item.permName || '').toLowerCase()
    const code = (item.permCode || '').toLowerCase()
    return name.includes(keyword) || code.includes(keyword)
  })
})

const permPageOptions = computed(() => {
  return filteredPermOptions.value.filter(item => (item.permType || 'M') === 'M')
})

const permStats = computed(() => {
  const checkedSet = new Set(permChecked.value || [])
  return {
    total: permPageOptions.value.length,
    checked: permPageOptions.value.reduce(
      (count, item) => count + (checkedSet.has(item.permCode) ? 1 : 0),
      0
    )
  }
})

const filteredIconOptions = computed(() => {
  const keyword = iconKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return iconOptions.value
  }
  return iconOptions.value.filter(icon => icon.toLowerCase().includes(keyword))
})

watch(iconDialogVisible, (value) => {
  if (value) {
    loadIconOptions()
  }
})

// Methods
async function fetchList() {
  loading.value = true
  try {
    const list = await getMenuList(queryParams.value)
    menuOptions.value = list || []
    tableData.value = buildTree(list || [])
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function fetchPermissionOptions() {
  try {
    permOptions.value = await getPermissionList({ permType: 'M' })
  } catch (error) {
    console.error(error)
  }
}

function handleReset() {
  queryParams.value = {
    menuName: '',
    menuCode: '',
    menuType: '',
    status: ''
  }
  fetchList()
}

function toggleExpand() {
  expandAll.value = !expandAll.value
  tableKey.value += 1
}

function handleAdd() {
  dialogTitle.value = '新增菜单'
  form.value = getDefaultForm()
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

async function handleEdit(row: any) {
  dialogTitle.value = '编辑菜单'
  try {
    const detail = await getMenuDetail(row.id)
    form.value = {
      id: detail.id,
      menuCode: detail.menuCode,
      menuName: detail.menuName,
      parentId: detail.parentId === 0 || detail.parentId === '0' || detail.parentId === null || detail.parentId === undefined ? 0 : detail.parentId,
      orderNum: detail.orderNum,
      name: detail.name,
      path: detail.path,
      menuType: detail.menuType,
      icon: detail.icon,
      hidden: !!detail.hidden,
      status: detail.status
    }
    dialogVisible.value = true
    nextTick(() => formRef.value?.clearValidate())
  } catch (error) {
    console.error(error)
  }
}

function submitForm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      if (form.value.id) {
        await updateMenu(form.value)
        ElMessage.success('修改成功')
      } else {
        await addMenu(form.value)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      fetchList()
    } catch (error) {
      console.error(error)
    }
  })
}

function handleDelete(row: any) {
  ElMessageBox.confirm(`确认删除菜单 ${row.menuName} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteMenu(row.id)
      ElMessage.success('删除成功')
      fetchList()
    })
    .catch(() => {
    })
}

async function openPermDialog(row: any) {
  currentMenuId.value = row.id
  try {
    permChecked.value = await getMenuPermissions(row.id)
    permKeyword.value = ''
    permDialogVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

async function saveMenuPermissions() {
  try {
    await assignMenuPermissions(currentMenuId.value!, permChecked.value)
    ElMessage.success('权限配置成功')
    permDialogVisible.value = false
  } catch (error) {
    console.error(error)
  }
}

function selectAllPerms() {
  const next = new Set(permChecked.value || [])
  permPageOptions.value.forEach(item => next.add(item.permCode))
  permChecked.value = Array.from(next)
}

function clearAllPerms() {
  const next = new Set(permChecked.value || [])
  permPageOptions.value.forEach(item => next.delete(item.permCode))
  permChecked.value = Array.from(next)
}

function statusTagType(value: string) {
  return value === '0' ? 'success' : 'info'
}

async function loadIconOptions() {
  const icons = new Set<string>()
  const sheets = Array.from(document.styleSheets || [])
  sheets.forEach(sheet => {
    let rules: CSSRuleList | undefined
    try {
      rules = sheet.cssRules || (sheet as any).rules
    } catch (error) {
      return
    }
    if (!rules) {
      return
    }
    Array.from(rules).forEach(rule => {
      if (!(rule instanceof CSSStyleRule) || !rule.selectorText) {
        return
      }
      rule.selectorText.split(',').forEach(selector => {
        const trimmed = selector.trim()
        if (!/\.icon-[\w-]+::?before$/.test(trimmed)) {
          return
        }
        const match = trimmed.match(/^\.icon-[\w-]+/)
        if (match) {
          icons.add(match[0].slice(1))
        }
      })
    })
  })

  if (icons.size === 0) {
    const iconSheet = sheets.find(sheet => sheet.href && sheet.href.includes('iconfont.css'))
    if (iconSheet && iconSheet.href) {
      try {
        const response = await fetch(iconSheet.href)
        const cssText = await response.text()
        const matches = cssText.match(/\.icon-[\w-]+::?before/g) || []
        matches.forEach(item => {
          icons.add(item.replace(/^\./, '').replace(/::?before$/, ''))
        })
      } catch (error) {
        // ignore fetch errors
      }
    }
  }

  iconOptions.value = Array.from(icons).sort()
}

function selectIcon(icon: string) {
  form.value.icon = icon
  iconDialogVisible.value = false
}

function buildTree(list: any[]) {
  const nodeMap = new Map()
  const roots: any[] = []
  const nodes = list.map(item => ({ ...item, children: [] }))

  nodes.forEach(item => {
    nodeMap.set(item.id, item)
  })

  nodes.forEach(item => {
    const parentId = item.parentId
    const isRoot = parentId === 0 || parentId === '0' || parentId === null || parentId === undefined
    if (isRoot || !nodeMap.has(parentId)) {
      roots.push(item)
    } else {
      nodeMap.get(parentId).children.push(item)
    }
  })

  const sortTree = (items: any[]) => {
    items.sort((a: any, b: any) => (a.orderNum || 0) - (b.orderNum || 0))
    items.forEach((child: any) => {
      if (child.children && child.children.length) {
        sortTree(child.children)
      }
    })
  }

  sortTree(roots)
  return roots
}

// created
loadDictOptions('DATA_STATUS')
fetchList()
fetchPermissionOptions()

// mounted
onMounted(() => {
  loadIconOptions()
})
</script>

<style scoped>
.table-icon {
  font-size: 18px;
}

.icon-placeholder {
  color: #9aa6bf;
}

.icon-field {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-preview {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e1e8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa6bf;
  background: #f7f9ff;
}

.icon-preview span {
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}

.icon-preview i {
  font-size: 18px;
}

.icon-input {
  flex: 1;
}

.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #8b97ad;
}

.icon-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.icon-search {
  max-width: 280px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  max-height: 360px;
  overflow: auto;
  padding-right: 6px;
}

.icon-item {
  border: 1px solid #e1e8ff;
  border-radius: 10px;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-item i {
  font-size: 20px;
}

.icon-item span {
  font-size: 12px;
  color: #6b7a99;
  text-align: center;
  word-break: break-all;
}

.icon-item:hover {
  border-color: #4f70ff;
  box-shadow: 0 10px 20px rgba(79, 112, 255, 0.15);
}

.icon-empty {
  color: #9aa6bf;
  text-align: center;
  padding: 30px 0;
}

.perm-dialog {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.perm-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.perm-toolbar-hint {
  color: #8b97ad;
  font-size: 12px;
}

.perm-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.perm-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.perm-section-info {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1f2d3d;
  font-weight: 600;
}

.perm-section-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.perm-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #eef3ff;
  color: #4f70ff;
  font-size: 12px;
  font-weight: 500;
}

.perm-selected {
  font-size: 12px;
  color: #8b97ad;
}

.perm-group {
  background: #f8faff;
  border: 1px solid #e1e8ff;
  border-radius: 12px;
  padding: 12px;
}

.perm-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.perm-grid .el-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  white-space: normal;
}

.perm-name {
  font-size: 13px;
  color: #1f2d3d;
}

.perm-code {
  display: inline-block;
  margin-left: 6px;
  font-size: 12px;
  color: #8b97ad;
}

.perm-empty {
  padding: 12px 0 4px;
  text-align: center;
  color: #9aa6bf;
  font-size: 12px;
}
</style>
