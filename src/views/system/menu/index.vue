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
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="menuName" label="菜单名称" min-width="160"/>
        <el-table-column prop="menuCode" label="菜单编码" min-width="160"/>
        <el-table-column prop="parentId" label="上级菜单" min-width="140">
          <template slot-scope="scope">
            {{ getParentName(scope.row.parentId) }}
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
        <el-table-column label="操作" min-width="220" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" v-perm="'system:menu:update'" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" v-perm="'system:menu:perm:list'" @click="openPermDialog(scope.row)">权限配置</el-button>
            <el-button size="mini" type="danger" v-perm="'system:menu:delete'" @click="handleDelete(scope.row)">删除</el-button>
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
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0"/>
        </el-form-item>
        <el-form-item label="路由名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入路由名称"/>
        </el-form-item>
        <el-form-item label="路由地址" prop="path">
          <el-input v-model="form.path" placeholder="请输入路由地址"/>
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="form.menuType">
            <el-radio label="D">目录</el-radio>
            <el-radio label="M">菜单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标"/>
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

    <el-dialog title="权限配置" :visible.sync="permDialogVisible" width="600px">
      <el-checkbox-group v-model="permChecked" class="perm-checkbox-group">
        <el-checkbox
          v-for="perm in permOptions"
          :key="perm.permCode"
          :label="perm.permCode">
          {{ perm.permName }} ({{ perm.permCode }})
        </el-checkbox>
      </el-checkbox-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMenuPermissions">保存</el-button>
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
      dialogVisible: false,
      dialogTitle: '',
      form: this.getDefaultForm(),
      rules: {
        menuName: [{required: true, message: '请输入菜单名称', trigger: 'blur'}],
        menuCode: [{required: true, message: '请输入菜单编码', trigger: 'blur'}],
        parentId: [{required: true, message: '请选择上级菜单', trigger: 'change'}],
        orderNum: [{required: true, message: '请输入排序', trigger: 'change'}],
        name: [{required: true, message: '请输入路由名称', trigger: 'blur'}],
        path: [{required: true, message: '请输入路由地址', trigger: 'blur'}],
        menuType: [{required: true, message: '请选择菜单类型', trigger: 'change'}]
      },
      permDialogVisible: false,
      permOptions: [],
      permChecked: [],
      currentMenuId: null
    }
  },
  computed: {
    parentOptions() {
      if (!this.form.id) {
        return this.menuOptions
      }
      return this.menuOptions.filter(item => item.id !== this.form.id)
    }
  },
  created() {
    this.loadDictOptions('DATA_STATUS')
    this.fetchList()
    this.fetchPermissionOptions()
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
        this.tableData = await getMenuList(this.queryParams)
        this.menuOptions = this.tableData || []
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
    getParentName(parentId) {
      if (!parentId || parentId === 0) {
        return '顶级目录'
      }
      const target = this.menuOptions.find(item => item.id === parentId)
      return target ? target.menuName : parentId
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
        .catch(() => {})
    },
    async openPermDialog(row) {
      this.currentMenuId = row.id
      try {
        this.permChecked = await getMenuPermissions(row.id)
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
    statusTagType(value) {
      return value === '0' ? 'success' : 'info'
    }
  }
}
</script>

<style scoped>
.page-container {
  padding: 10px;
}

.card-header {
  font-weight: 600;
}

.search-form {
  margin-bottom: 10px;
}

.table-toolbar {
  margin: 10px 0;
}

.perm-checkbox-group {
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow: auto;
}
</style>
