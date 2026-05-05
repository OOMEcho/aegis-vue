<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>部门管理</span>
        </div>
      </template>

      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="部门名称">
          <el-input v-model="queryParams.deptName" placeholder="部门名称" clearable/>
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
        <el-button type="primary" icon="Plus" v-perm="PERMS.dept.add" @click="handleAdd">
          新增
        </el-button>
        <el-button icon="Fold" @click="toggleExpand">
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
        <el-table-column prop="deptName" label="部门名称" min-width="160"/>
        <el-table-column prop="orderNum" label="排序" width="80"/>
        <el-table-column prop="leader" label="负责人" min-width="120"/>
        <el-table-column prop="phone" label="电话" min-width="140"/>
        <el-table-column prop="email" label="邮箱" min-width="180"/>
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="140" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip v-if="hasPerm(PERMS.dept.update)" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="small"
                  icon="Edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-if="hasPerm(PERMS.dept.delete)" content="删除" placement="top" popper-class="action-tooltip">
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入部门名称"/>
        </el-form-item>
        <el-form-item v-if="showParentField" label="上级部门" prop="parentId">
          <el-popover
            v-model:visible="parentPopoverVisible"
            placement="bottom-start"
            trigger="click"
            :width="280"
            popper-class="dept-tree-popover">
            <div class="dept-tree-search">
              <el-input
                v-model="parentFilter"

                placeholder="搜索上级部门"
                clearable/>
            </div>
            <div class="dept-tree-panel">
              <el-tree
                ref="parentTreeRef"
                v-loading="parentTreeLoading"
                :data="parentTreeData"
                :props="parentTreeProps"
                node-key="id"
                highlight-current
                :expand-on-click-node="false"
                :filter-node-method="filterParentNode"
                @node-click="handleParentSelect"/>
            </div>
            <template #reference>
              <el-input
                v-model="parentLabel"
                placeholder="请选择上级部门"
                readonly>
                <template #suffix>
                  <span class="dept-query-suffix">
                    <el-icon class="dept-query-clear" v-if="parentLabel"
                      @click.stop="clearParentSelect"><CircleCloseFilled /></el-icon>
                    <el-icon class="dept-query-arrow"><ArrowDown /></el-icon>
                  </span>
                </template>
              </el-input>
            </template>
          </el-popover>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0"/>
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="form.leader" placeholder="请输入负责人"/>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"/>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addDept,
  deleteDept,
  getDeptDetail,
  getDeptList,
  getDeptListExclude,
  getDeptTree,
  updateDept
} from '@/api/dept'
import { PERMS } from '@/utils/permCode'
import { usePermission } from '@/composables/usePermission'
import { useDict } from '@/composables/useDict'

const { dicts, loadDictOptions, dictLabel } = useDict()
const { hasPerm } = usePermission()

const loading = ref(false)
const queryParams = ref({
  deptName: '',
  status: ''
})
const tableData = ref<any[]>([])
const parentTreeData = ref<any[]>([])
const parentTreeLoading = ref(false)
const parentTreeProps = ref({ children: 'children', label: 'label' })
const parentTreeLabelKey = ref('label')
const parentPopoverVisible = ref(false)
const parentFilter = ref('')
const parentLabel = ref('')
const expandAll = ref(true)
const tableKey = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')

const parentTreeRef = ref<InstanceType<any>>()
const formRef = ref<FormInstance>()

function getDefaultForm() {
  return {
    id: null as number | null,
    deptName: '',
    parentId: null as number | null,
    orderNum: 0,
    leader: '',
    phone: '',
    email: '',
    status: '0'
  }
}

const form = ref(getDefaultForm())

const rules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  parentId: [{ required: true, message: '请选择上级部门', trigger: 'change' }],
  orderNum: [{ required: true, message: '请输入排序', trigger: 'change' }]
}

const showParentField = computed(() => {
  if (!form.value.id) {
    return true
  }
  return !(form.value.parentId === 0 || form.value.parentId === null || form.value.parentId === undefined)
})

watch(parentFilter, (value) => {
  parentTreeRef.value?.filter(value)
})

async function fetchList() {
  loading.value = true
  try {
    const list = await getDeptList(queryParams.value)
    tableData.value = buildTree(list || [])
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function handleReset() {
  queryParams.value = { deptName: '', status: '' }
  fetchList()
}

function toggleExpand() {
  expandAll.value = !expandAll.value
  tableKey.value += 1
}

function handleAdd() {
  dialogTitle.value = '新增部门'
  form.value = getDefaultForm()
  parentLabel.value = ''
  parentFilter.value = ''
  parentPopoverVisible.value = false
  dialogVisible.value = true
  fetchParentTreeForAdd()
  nextTick(() => {
    formRef.value?.clearValidate()
    parentTreeRef.value?.setCurrentKey(null)
  })
}

async function handleEdit(row: any) {
  dialogTitle.value = '编辑部门'
  try {
    const detail = await getDeptDetail(row.id)
    form.value = {
      id: detail.id,
      deptName: detail.deptName,
      parentId: detail.parentId,
      orderNum: detail.orderNum,
      leader: detail.leader,
      phone: detail.phone,
      email: detail.email,
      status: detail.status
    }
    parentLabel.value = ''
    parentFilter.value = ''
    parentPopoverVisible.value = false
    dialogVisible.value = true
    if (showParentField.value) {
      await fetchParentTreeForEdit(detail.id)
      parentLabel.value = findParentLabel(parentTreeData.value, detail.parentId) || ''
    }
    nextTick(() => {
      formRef.value?.clearValidate()
      if (parentTreeRef.value && showParentField.value) {
        parentTreeRef.value.setCurrentKey(detail.parentId)
      }
    })
  } catch (error) {
    console.error(error)
  }
}

async function fetchParentTreeForAdd() {
  parentTreeLoading.value = true
  parentTreeLabelKey.value = 'label'
  parentTreeProps.value = { children: 'children', label: 'label' }
  try {
    const data = await getDeptTree({})
    parentTreeData.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error(error)
  } finally {
    parentTreeLoading.value = false
  }
}

async function fetchParentTreeForEdit(id: number) {
  parentTreeLoading.value = true
  parentTreeLabelKey.value = 'deptName'
  parentTreeProps.value = { children: 'children', label: 'deptName' }
  try {
    const list = await getDeptListExclude(id)
    const tree = buildTree(list || [])
    parentTreeData.value = tree
  } catch (error) {
    console.error(error)
  } finally {
    parentTreeLoading.value = false
  }
}

function filterParentNode(value: string, data: any) {
  const keyword = (value || '').trim()
  if (!keyword) {
    return true
  }
  const label = data[parentTreeLabelKey.value] || data.label || data.deptName || ''
  return label.toLowerCase().includes(keyword.toLowerCase())
}

function handleParentSelect(node: any) {
  form.value.parentId = node.id
  parentLabel.value = node[parentTreeLabelKey.value] || node.label || node.deptName || ''
  parentPopoverVisible.value = false
}

function clearParentSelect() {
  form.value.parentId = null
  parentLabel.value = ''
  parentFilter.value = ''
  parentPopoverVisible.value = false
  nextTick(() => {
    parentTreeRef.value?.setCurrentKey(null)
  })
}

function findParentLabel(tree: any[] = [], id: any): string {
  if (!id) {
    return ''
  }
  for (const node of tree) {
    if (String(node.id) === String(id)) {
      return node[parentTreeLabelKey.value] || node.label || node.deptName || ''
    }
    if (node.children && node.children.length) {
      const label = findParentLabel(node.children, id)
      if (label) {
        return label
      }
    }
  }
  return ''
}

function submitForm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) {
      return
    }
    try {
      if (form.value.id) {
        await updateDept(form.value)
        ElMessage.success('修改成功')
      } else {
        await addDept(form.value)
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
  ElMessageBox.confirm(`确认删除部门 ${row.deptName} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteDept(row.id)
      ElMessage.success('删除成功')
      fetchList()
    })
    .catch(() => {
    })
}

function statusTagType(value: string) {
  return value === '0' ? 'success' : 'info'
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
</script>

<style scoped>
</style>
