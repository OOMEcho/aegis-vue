<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>菜单管理</span>
      </div>

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
          <el-button type="primary" icon="el-icon-search" @click="fetchList">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <el-button type="primary" size="small" icon="el-icon-plus" v-perm="'system:menu:add'" @click="handleAdd">
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
        <el-table-column prop="menuName" label="菜单名称" min-width="160"/>
        <el-table-column prop="menuCode" label="菜单编码" min-width="160"/>
        <el-table-column label="图标" width="100">
          <template slot-scope="scope">
            <i v-if="scope.row.icon && scope.row.icon !== '#'" class="iconfont table-icon" :class="scope.row.icon"></i>
            <span v-else class="icon-placeholder">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" label="排序" width="80"/>
        <el-table-column prop="name" label="路由名称" min-width="140"/>
        <el-table-column prop="path" label="路由地址" min-width="160"/>
        <el-table-column label="类型" width="80">
          <template slot-scope="scope">
            {{ scope.row.menuType === 'D' ? '目录' : '菜单' }}
          </template>
        </el-table-column>
        <el-table-column label="显示" width="80">
          <template slot-scope="scope">
            <el-tag v-if="!scope.row.hidden" type="success" size="mini">显示</el-tag>
            <el-tag v-else type="info" size="mini">隐藏</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="mini">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-tooltip v-perm="'system:menu:update'" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-perm="'system:menu:perm:list'" content="权限配置" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-lock"
                  class="action-icon is-primary"
                  @click="openPermDialog(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-perm="'system:menu:delete'" content="删除" placement="top" popper-class="action-tooltip">
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="560px">
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
          <div class="form-hint">仅支持英文字母；不带“/”将自动拼接父级路径，带“/”视为完整路径</div>
          <div v-if="parentPathHint" class="form-hint">当前父级：{{ parentPathHint }}</div>
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="form.menuType">
            <el-radio label="D">目录</el-radio>
            <el-radio label="M">菜单</el-radio>
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="权限配置" :visible.sync="permDialogVisible" width="680px">
      <div class="perm-dialog">
        <div class="perm-toolbar">
          <el-input
            v-model="permKeyword"
            placeholder="搜索权限名称或编码"
            size="small"
            clearable
            prefix-icon="el-icon-search"/>
        </div>
        <el-collapse v-model="permCollapseActive" class="perm-collapse">
          <el-collapse-item name="M">
            <template slot="title">
              <div class="perm-collapse-title">
                <i class="el-icon-document"></i>
                <span>页面</span>
                <span class="perm-count">{{ permGroupStats.M.total }}</span>
                <span v-if="permGroupStats.M.checked" class="perm-selected">已选 {{ permGroupStats.M.checked }}</span>
              </div>
            </template>
            <div class="perm-group">
              <div class="perm-group-actions">
                <el-button type="text" size="mini" :disabled="!permGroupStats.M.total" @click="selectPermGroup('M')">全选</el-button>
                <el-button type="text" size="mini" :disabled="!permGroupStats.M.total" @click="clearPermGroup('M')">清空</el-button>
              </div>
              <el-checkbox-group v-model="permChecked" class="perm-grid">
                <el-checkbox
                  v-for="perm in permGrouped.M"
                  :key="perm.permCode"
                  :label="perm.permCode">
                  <span class="perm-name">{{ perm.permName }}</span>
                  <span class="perm-code">{{ perm.permCode }}</span>
                </el-checkbox>
              </el-checkbox-group>
              <div v-if="!permGrouped.M.length" class="perm-empty">暂无匹配权限</div>
            </div>
          </el-collapse-item>
          <el-collapse-item name="B">
            <template slot="title">
              <div class="perm-collapse-title">
                <i class="el-icon-s-operation"></i>
                <span>按钮</span>
                <span class="perm-count">{{ permGroupStats.B.total }}</span>
                <span v-if="permGroupStats.B.checked" class="perm-selected">已选 {{ permGroupStats.B.checked }}</span>
              </div>
            </template>
            <div class="perm-group">
              <div class="perm-group-actions">
                <el-button type="text" size="mini" :disabled="!permGroupStats.B.total" @click="selectPermGroup('B')">全选</el-button>
                <el-button type="text" size="mini" :disabled="!permGroupStats.B.total" @click="clearPermGroup('B')">清空</el-button>
              </div>
              <el-checkbox-group v-model="permChecked" class="perm-grid">
                <el-checkbox
                  v-for="perm in permGrouped.B"
                  :key="perm.permCode"
                  :label="perm.permCode">
                  <span class="perm-name">{{ perm.permName }}</span>
                  <span class="perm-code">{{ perm.permCode }}</span>
                </el-checkbox>
              </el-checkbox-group>
              <div v-if="!permGrouped.B.length" class="perm-empty">暂无匹配权限</div>
            </div>
          </el-collapse-item>
          <el-collapse-item name="A">
            <template slot="title">
              <div class="perm-collapse-title">
                <i class="el-icon-link"></i>
                <span>API</span>
                <span class="perm-count">{{ permGroupStats.A.total }}</span>
                <span v-if="permGroupStats.A.checked" class="perm-selected">已选 {{ permGroupStats.A.checked }}</span>
              </div>
            </template>
            <div class="perm-group">
              <div class="perm-group-actions">
                <el-button type="text" size="mini" :disabled="!permGroupStats.A.total" @click="selectPermGroup('A')">全选</el-button>
                <el-button type="text" size="mini" :disabled="!permGroupStats.A.total" @click="clearPermGroup('A')">清空</el-button>
              </div>
              <el-checkbox-group v-model="permChecked" class="perm-grid">
                <el-checkbox
                  v-for="perm in permGrouped.A"
                  :key="perm.permCode"
                  :label="perm.permCode">
                  <span class="perm-name">{{ perm.permName }}</span>
                  <span class="perm-code">{{ perm.permCode }}</span>
                </el-checkbox>
              </el-checkbox-group>
              <div v-if="!permGrouped.A.length" class="perm-empty">暂无匹配权限</div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMenuPermissions">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog title="选择菜单图标" :visible.sync="iconDialogVisible" width="720px">
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

<script>
import {
  addMenu,
  deleteMenu,
  getMenuDetail,
  getMenuList,
  updateMenu,
  getMenuPermissions,
  assignMenuPermissions
} from '@/api/menu'
import {getPermissionList} from '@/api/permission'
import {Message} from 'element-ui'
import dictMixin from '@/mixins/dict'

export default {
  name: 'MenuPage',
  mixins: [dictMixin],
  data() {
    const validateParent = (rule, value, callback) => {
      if (value === undefined || value === null) {
        callback(new Error('请选择上级菜单'))
        return
      }
      if (value === 0) {
        callback()
        return
      }
      const parent = this.menuOptions.find(item => item.id === value)
      if (parent && parent.menuType === 'M') {
        callback(new Error('菜单不能创建子菜单，请选择目录作为上级'))
        return
      }
      callback()
    }

    const validatePath = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入路由地址'))
        return
      }
      if (!/^\/?[A-Za-z]+$/.test(value)) {
        callback(new Error('路由地址仅支持英文字母，允许以“/”开头'))
        return
      }
      callback()
    }

    return {
      loading: false,
      queryParams: {
        menuName: '',
        menuCode: '',
        menuType: '',
        status: ''
      },
      tableData: [],
      menuOptions: [],
      expandAll: true,
      tableKey: 0,
      dialogVisible: false,
      dialogTitle: '',
      form: this.getDefaultForm(),
      rules: {
        menuName: [{required: true, message: '请输入菜单名称', trigger: 'blur'}],
        menuCode: [{required: true, message: '请输入菜单编码', trigger: 'blur'}],
        parentId: [{required: true, validator: validateParent, trigger: 'change'}],
        orderNum: [{required: true, message: '请输入排序', trigger: 'change'}],
        name: [{required: true, message: '请输入路由名称', trigger: 'blur'}],
        path: [
          {required: true, message: '请输入路由地址', trigger: 'blur'},
          {validator: validatePath, trigger: 'blur'}
        ],
        menuType: [{required: true, message: '请选择菜单类型', trigger: 'change'}]
      },
      permDialogVisible: false,
      permOptions: [],
      permChecked: [],
      permKeyword: '',
      permCollapseActive: ['M'],
      currentMenuId: null,
      iconDialogVisible: false,
      iconKeyword: '',
      iconOptions: []
    }
  },
  computed: {
    parentOptions() {
      if (!this.form.id) {
        return this.menuOptions
      }
      return this.menuOptions.filter(item => item.id !== this.form.id)
    },
    parentPathHint() {
      const parent = this.menuOptions.find(item => item.id === this.form.parentId)
      if (!parent || !parent.path) {
        return ''
      }
      return parent.path
    },
    filteredPermOptions() {
      const keyword = this.permKeyword.trim().toLowerCase()
      if (!keyword) {
        return this.permOptions
      }
      return this.permOptions.filter(item => {
        const name = (item.permName || '').toLowerCase()
        const code = (item.permCode || '').toLowerCase()
        return name.includes(keyword) || code.includes(keyword)
      })
    },
    permGrouped() {
      const groups = {M: [], B: [], A: []}
      this.filteredPermOptions.forEach(item => {
        const type = item.permType || 'M'
        if (groups[type]) {
          groups[type].push(item)
        }
      })
      return groups
    },
    permGroupStats() {
      const checkedSet = new Set(this.permChecked || [])
      const stats = {M: {total: 0, checked: 0}, B: {total: 0, checked: 0}, A: {total: 0, checked: 0}}
      Object.keys(stats).forEach(type => {
        const list = this.permGrouped[type] || []
        stats[type].total = list.length
        stats[type].checked = list.reduce((count, item) => count + (checkedSet.has(item.permCode) ? 1 : 0), 0)
      })
      return stats
    },
    filteredIconOptions() {
      const keyword = this.iconKeyword.trim().toLowerCase()
      if (!keyword) {
        return this.iconOptions
      }
      return this.iconOptions.filter(icon => icon.toLowerCase().includes(keyword))
    }
  },
  created() {
    this.loadDictOptions('DATA_STATUS')
    this.fetchList()
    this.fetchPermissionOptions()
  },
  mounted() {
    this.loadIconOptions()
  },
  watch: {
    iconDialogVisible(value) {
      if (value) {
        this.loadIconOptions()
      }
    }
  },
  methods: {
    getDefaultForm() {
      return {
        id: null,
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
    },
    async fetchList() {
      this.loading = true
      try {
        const list = await getMenuList(this.queryParams)
        this.menuOptions = list || []
        this.tableData = this.buildTree(list || [])
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async fetchPermissionOptions() {
      try {
        this.permOptions = await getPermissionList({})
      } catch (error) {
        console.error(error)
      }
    },
    handleReset() {
      this.queryParams = {
        menuName: '',
        menuCode: '',
        menuType: '',
        status: ''
      }
      this.fetchList()
    },
    toggleExpand() {
      this.expandAll = !this.expandAll
      this.tableKey += 1
    },
    handleAdd() {
      this.dialogTitle = '新增菜单'
      this.form = this.getDefaultForm()
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
    },
    async handleEdit(row) {
      this.dialogTitle = '编辑菜单'
      try {
        const detail = await getMenuDetail(row.id)
        this.form = {
          id: detail.id,
          menuCode: detail.menuCode,
          menuName: detail.menuName,
          parentId: detail.parentId,
          orderNum: detail.orderNum,
          name: detail.name,
          path: detail.path,
          menuType: detail.menuType,
          icon: detail.icon,
          hidden: !!detail.hidden,
          status: detail.status
        }
        this.dialogVisible = true
        this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
      } catch (error) {
        console.error(error)
      }
    },
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) {
          return
        }
        try {
          if (this.form.id) {
            await updateMenu(this.form)
            Message.success('修改成功')
          } else {
            await addMenu(this.form)
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
      this.$confirm(`确认删除菜单 ${row.menuName} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await deleteMenu(row.id)
          Message.success('删除成功')
          this.fetchList()
        })
        .catch(() => {
        })
    },
    async openPermDialog(row) {
      this.currentMenuId = row.id
      try {
        this.permChecked = await getMenuPermissions(row.id)
        this.permKeyword = ''
        this.permCollapseActive = ['M']
        this.permDialogVisible = true
      } catch (error) {
        console.error(error)
      }
    },
    async saveMenuPermissions() {
      try {
        await assignMenuPermissions(this.currentMenuId, this.permChecked)
        Message.success('权限配置成功')
        this.permDialogVisible = false
      } catch (error) {
        console.error(error)
      }
    },
    selectPermGroup(type) {
      const list = this.permGrouped[type] || []
      const next = new Set(this.permChecked || [])
      list.forEach(item => next.add(item.permCode))
      this.permChecked = Array.from(next)
    },
    clearPermGroup(type) {
      const list = this.permGrouped[type] || []
      const next = new Set(this.permChecked || [])
      list.forEach(item => next.delete(item.permCode))
      this.permChecked = Array.from(next)
    },
    statusTagType(value) {
      return value === '0' ? 'success' : 'info'
    },
    async loadIconOptions() {
      const icons = new Set()
      const sheets = Array.from(document.styleSheets || [])
      sheets.forEach(sheet => {
        let rules
        try {
          rules = sheet.cssRules || sheet.rules
        } catch (error) {
          return
        }
        if (!rules) {
          return
        }
        Array.from(rules).forEach(rule => {
          if (!rule.selectorText) {
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

      this.iconOptions = Array.from(icons).sort()
    },
    selectIcon(icon) {
      this.form.icon = icon
      this.iconDialogVisible = false
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

.perm-collapse {
  border: none;
}

.perm-collapse-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1f2d3d;
  font-weight: 600;
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

.perm-group-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 10px;
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
