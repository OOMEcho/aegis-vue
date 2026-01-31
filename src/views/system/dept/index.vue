<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>部门管理</span>
      </div>

      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
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
          <el-button type="primary" icon="el-icon-search" @click="fetchList">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <el-button type="primary" size="small" icon="el-icon-plus" v-perm="'system:dept:add'" @click="handleAdd">
          新增
        </el-button>
        <el-button size="small" icon="el-icon-s-fold" @click="toggleExpand">
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
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="mini">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="140" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-tooltip v-perm="'system:dept:update'" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-perm="'system:dept:delete'" content="删除" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-delete"
                  class="action-icon is-danger"
                  @click="handleDelete(scope.row)"/>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入部门名称"/>
        </el-form-item>
        <el-form-item v-if="showParentField" label="上级部门" prop="parentId">
          <el-popover
            v-model="parentPopoverVisible"
            placement="bottom-start"
            trigger="click"
            width="280"
            popper-class="dept-tree-popover">
            <div class="dept-tree-search">
              <el-input
                v-model="parentFilter"
                size="small"
                placeholder="搜索上级部门"
                clearable/>
            </div>
            <div class="dept-tree-panel">
              <el-tree
                ref="parentTree"
                v-loading="parentTreeLoading"
                :data="parentTreeData"
                :props="parentTreeProps"
                node-key="id"
                highlight-current
                :expand-on-click-node="false"
                :filter-node-method="filterParentNode"
                @node-click="handleParentSelect"/>
            </div>
            <el-input
              slot="reference"
              v-model="parentLabel"
              placeholder="请选择上级部门"
              readonly>
              <template slot="suffix">
                <span class="dept-query-suffix">
                  <i
                    v-if="parentLabel"
                    class="el-icon-circle-close dept-query-clear"
                    @click.stop="clearParentSelect"></i>
                  <i class="el-icon-arrow-down dept-query-arrow"></i>
                </span>
              </template>
            </el-input>
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addDept,
  deleteDept,
  getDeptDetail,
  getDeptList,
  getDeptListExclude,
  getDeptTree,
  updateDept
} from '@/api/dept'
import {Message} from 'element-ui'
import dictMixin from '@/mixins/dict'

export default {
  name: 'DeptPage',
  mixins: [dictMixin],
  data() {
    return {
      loading: false,
      queryParams: {
        deptName: '',
        status: ''
      },
      tableData: [],
      parentTreeData: [],
      parentTreeLoading: false,
      parentTreeProps: {
        children: 'children',
        label: 'label'
      },
      parentTreeLabelKey: 'label',
      parentPopoverVisible: false,
      parentFilter: '',
      parentLabel: '',
      expandAll: true,
      tableKey: 0,
      dialogVisible: false,
      dialogTitle: '',
      form: this.getDefaultForm(),
      rules: {
        deptName: [{required: true, message: '请输入部门名称', trigger: 'blur'}],
        parentId: [{required: true, message: '请选择上级部门', trigger: 'change'}],
        orderNum: [{required: true, message: '请输入排序', trigger: 'change'}]
      }
    }
  },
  computed: {
    showParentField() {
      if (!this.form.id) {
        return true
      }
      return !(this.form.parentId === 0 || this.form.parentId === '0' || this.form.parentId === null || this.form.parentId === undefined)
    }
  },
  created() {
    this.loadDictOptions('DATA_STATUS')
    this.fetchList()
  },
  watch: {
    parentFilter(value) {
      if (this.$refs.parentTree) {
        this.$refs.parentTree.filter(value)
      }
    }
  },
  methods: {
    getDefaultForm() {
      return {
        id: null,
        deptName: '',
        parentId: null,
        orderNum: 0,
        leader: '',
        phone: '',
        email: '',
        status: '0'
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const list = await getDeptList(this.queryParams)
        this.tableData = this.buildTree(list || [])
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    handleReset() {
      this.queryParams = {deptName: '', status: ''}
      this.fetchList()
    },
    toggleExpand() {
      this.expandAll = !this.expandAll
      this.tableKey += 1
    },
    handleAdd() {
      this.dialogTitle = '新增部门'
      this.form = this.getDefaultForm()
      this.parentLabel = ''
      this.parentFilter = ''
      this.parentPopoverVisible = false
      this.dialogVisible = true
      this.fetchParentTreeForAdd()
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
        if (this.$refs.parentTree) {
          this.$refs.parentTree.setCurrentKey(null)
        }
      })
    },
    async handleEdit(row) {
      this.dialogTitle = '编辑部门'
      try {
        const detail = await getDeptDetail(row.id)
        this.form = {
          id: detail.id,
          deptName: detail.deptName,
          parentId: detail.parentId,
          orderNum: detail.orderNum,
          leader: detail.leader,
          phone: detail.phone,
          email: detail.email,
          status: detail.status
        }
        this.parentLabel = ''
        this.parentFilter = ''
        this.parentPopoverVisible = false
        this.dialogVisible = true
        if (this.showParentField) {
          await this.fetchParentTreeForEdit(detail.id)
          this.parentLabel = this.findParentLabel(this.parentTreeData, detail.parentId) || ''
        }
        this.$nextTick(() => {
          if (this.$refs.formRef) {
            this.$refs.formRef.clearValidate()
          }
          if (this.$refs.parentTree && this.showParentField) {
            this.$refs.parentTree.setCurrentKey(detail.parentId)
          }
        })
      } catch (error) {
        console.error(error)
      }
    },
    async fetchParentTreeForAdd() {
      this.parentTreeLoading = true
      this.parentTreeLabelKey = 'label'
      this.parentTreeProps = {children: 'children', label: 'label'}
      try {
        const data = await getDeptTree({})
        this.parentTreeData = Array.isArray(data) ? data : []
      } catch (error) {
        console.error(error)
      } finally {
        this.parentTreeLoading = false
      }
    },
    async fetchParentTreeForEdit(id) {
      this.parentTreeLoading = true
      this.parentTreeLabelKey = 'deptName'
      this.parentTreeProps = {children: 'children', label: 'deptName'}
      try {
        const list = await getDeptListExclude(id)
        const tree = this.buildTree(list || [])
        this.parentTreeData = tree
      } catch (error) {
        console.error(error)
      } finally {
        this.parentTreeLoading = false
      }
    },
    filterParentNode(value, data) {
      const keyword = (value || '').trim()
      if (!keyword) {
        return true
      }
      const label = data[this.parentTreeLabelKey] || data.label || data.deptName || ''
      return label.toLowerCase().includes(keyword.toLowerCase())
    },
    handleParentSelect(node) {
      this.form.parentId = node.id
      this.parentLabel = node[this.parentTreeLabelKey] || node.label || node.deptName || ''
      this.parentPopoverVisible = false
    },
    clearParentSelect() {
      this.form.parentId = null
      this.parentLabel = ''
      this.parentFilter = ''
      this.parentPopoverVisible = false
      this.$nextTick(() => {
        if (this.$refs.parentTree) {
          this.$refs.parentTree.setCurrentKey(null)
        }
      })
    },
    findParentLabel(tree = [], id) {
      if (!id) {
        return ''
      }
      for (const node of tree) {
        if (String(node.id) === String(id)) {
          return node[this.parentTreeLabelKey] || node.label || node.deptName || ''
        }
        if (node.children && node.children.length) {
          const label = this.findParentLabel(node.children, id)
          if (label) {
            return label
          }
        }
      }
      return ''
    },
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) {
          return
        }
        try {
          if (this.form.id) {
            await updateDept(this.form)
            Message.success('修改成功')
          } else {
            await addDept(this.form)
            Message.success('新增成功')
          }
          this.dialogVisible = false
          this.fetchList()
        } catch (error) {
          console.error(error)
        }
      })
    },
    handleDelete(row) {
      this.$confirm(`确认删除部门 ${row.deptName} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await deleteDept(row.id)
          Message.success('删除成功')
          this.fetchList()
        })
        .catch(() => {
        })
    },
    statusTagType(value) {
      return value === '0' ? 'success' : 'info'
    },
    buildTree(list) {
      const nodeMap = new Map()
      const roots = []
      const nodes = list.map(item => ({...item, children: []}))

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

      const sortTree = items => {
        items.sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0))
        items.forEach(child => {
          if (child.children && child.children.length) {
            sortTree(child.children)
          }
        })
      }

      sortTree(roots)
      return roots
    }
  }
}
</script>

<style scoped>
</style>
