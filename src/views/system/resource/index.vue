<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>资源管理</span>
      </div>

      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="请求方法">
          <el-select v-model="queryParams.requestMethod" placeholder="请求方法" clearable>
            <el-option label="GET" value="GET"/>
            <el-option label="POST" value="POST"/>
            <el-option label="PUT" value="PUT"/>
            <el-option label="DELETE" value="DELETE"/>
            <el-option label="ALL" value="ALL"/>
          </el-select>
        </el-form-item>
        <el-form-item label="URI">
          <el-input v-model="queryParams.requestUri" placeholder="URI" clearable/>
        </el-form-item>
        <el-form-item label="权限编码">
          <el-input v-model="queryParams.permCode" placeholder="权限编码" clearable/>
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
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <el-button type="primary" size="small" icon="el-icon-plus" v-perm="PERMS.resource.add" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="requestMethod" label="请求方法" width="100"/>
        <el-table-column prop="requestUri" label="URI" min-width="220"/>
        <el-table-column prop="permCode" label="权限编码" min-width="200"/>
        <el-table-column prop="remark" label="备注" min-width="160"/>
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
              <el-tooltip v-perm="PERMS.resource.update" content="编辑" placement="top" popper-class="action-tooltip">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-edit"
                  class="action-icon is-primary"
                  @click="handleEdit(scope.row)"/>
              </el-tooltip>
              <el-tooltip v-perm="PERMS.resource.delete" content="删除" placement="top" popper-class="action-tooltip">
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

      <div class="page-pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"/>
      </div>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="请求方法" prop="requestMethod">
          <el-select v-model="form.requestMethod" placeholder="请选择请求方法">
            <el-option label="GET" value="GET"/>
            <el-option label="POST" value="POST"/>
            <el-option label="PUT" value="PUT"/>
            <el-option label="DELETE" value="DELETE"/>
            <el-option label="ALL" value="ALL"/>
          </el-select>
        </el-form-item>
        <el-form-item label="URI" prop="requestUri">
          <el-input v-model="form.requestUri" placeholder="请输入URI"/>
        </el-form-item>
        <el-form-item label="权限编码" prop="permCode">
          <el-input
            v-model="permLabel"
            placeholder="请选择权限编码"
            readonly
            class="perm-input"
            @click.native="togglePermPanel">
            <template slot="suffix">
              <span class="dept-query-suffix">
                <i
                  v-if="permLabel"
                  class="el-icon-circle-close dept-query-clear"
                  @click.stop="clearPermSelect"></i>
                <i class="el-icon-arrow-down dept-query-arrow"></i>
              </span>
            </template>
          </el-input>
          <div v-show="permPanelVisible" class="perm-panel">
            <div class="perm-select">
              <div class="perm-toolbar">
                <el-input
                  v-model="permKeyword"
                  placeholder="搜索权限名称或编码"
                  size="small"
                  clearable
                  prefix-icon="el-icon-search"/>
              </div>
              <el-collapse v-model="permCollapseActive" class="perm-collapse">
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
                    <div class="perm-grid">
                      <button
                        v-for="perm in permGrouped.A"
                        :key="perm.permCode"
                        type="button"
                        class="perm-item"
                        :class="{ 'is-active': perm.permCode === form.permCode }"
                        @click="selectPermCode(perm)">
                        <span class="perm-name">{{ perm.permName }}</span>
                        <span class="perm-code">{{ perm.permCode }}</span>
                      </button>
                    </div>
                    <div v-if="!permGrouped.A.length" class="perm-empty">暂无匹配权限</div>
                  </div>
                </el-collapse-item>
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
                    <div class="perm-grid">
                      <button
                        v-for="perm in permGrouped.M"
                        :key="perm.permCode"
                        type="button"
                        class="perm-item"
                        :class="{ 'is-active': perm.permCode === form.permCode }"
                        @click="selectPermCode(perm)">
                        <span class="perm-name">{{ perm.permName }}</span>
                        <span class="perm-code">{{ perm.permCode }}</span>
                      </button>
                    </div>
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
                    <div class="perm-grid">
                      <button
                        v-for="perm in permGrouped.B"
                        :key="perm.permCode"
                        type="button"
                        class="perm-item"
                        :class="{ 'is-active': perm.permCode === form.permCode }"
                        @click="selectPermCode(perm)">
                        <span class="perm-name">{{ perm.permName }}</span>
                        <span class="perm-code">{{ perm.permCode }}</span>
                      </button>
                    </div>
                    <div v-if="!permGrouped.B.length" class="perm-empty">暂无匹配权限</div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
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
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" rows="3"/>
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
  addResource,
  deleteResource,
  getResourceDetail,
  getResourcePageList,
  updateResource
} from '@/api/resource'
import {getPermissionList} from '@/api/permission'
import {PERMS} from '@/utils/permCode'
import {Message} from 'element-ui'
import dictMixin from '@/mixins/dict'

export default {
  name: 'ResourcePage',
  mixins: [dictMixin],
  data() {
    return {
      loading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        requestMethod: '',
        requestUri: '',
        permCode: '',
        status: ''
      },
      tableData: [],
      permOptions: [],
      permKeyword: '',
      permPanelVisible: false,
      permLabel: '',
      permCollapseActive: ['A'],
      dialogVisible: false,
      dialogTitle: '',
      form: this.getDefaultForm(),
      rules: {
        requestMethod: [{required: true, message: '请选择请求方法', trigger: 'change'}],
        requestUri: [{required: true, message: '请输入URI', trigger: 'blur'}],
        permCode: [{required: true, message: '请选择权限编码', trigger: 'change'}]
      },
      PERMS
    }
  },
  computed: {
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
      const groups = {A: [], M: [], B: []}
      this.filteredPermOptions.forEach(item => {
        const type = item.permType || 'M'
        if (groups[type]) {
          groups[type].push(item)
        }
      })
      return groups
    },
    permGroupStats() {
      const current = this.form.permCode
      return {
        A: {
          total: this.permGrouped.A.length,
          checked: current && this.permGrouped.A.some(item => item.permCode === current) ? 1 : 0
        },
        M: {
          total: this.permGrouped.M.length,
          checked: current && this.permGrouped.M.some(item => item.permCode === current) ? 1 : 0
        },
        B: {
          total: this.permGrouped.B.length,
          checked: current && this.permGrouped.B.some(item => item.permCode === current) ? 1 : 0
        }
      }
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
        requestMethod: 'GET',
        requestUri: '',
        permCode: '',
        status: '0',
        remark: ''
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const data = await getResourcePageList(this.queryParams)
        this.tableData = data.records || []
        this.total = Number(data.total || 0)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async fetchPermissionOptions() {
      try {
        this.permOptions = await getPermissionList({})
        this.syncPermLabel()
      } catch (error) {
        console.error(error)
      }
    },
    handleSearch() {
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    handleReset() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        requestMethod: '',
        requestUri: '',
        permCode: '',
        status: ''
      }
      this.fetchList()
    },
    handlePageChange(page) {
      this.queryParams.pageNum = page
      this.fetchList()
    },
    handleSizeChange(size) {
      this.queryParams.pageSize = size
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    handleAdd() {
      this.dialogTitle = '新增资源'
      this.form = this.getDefaultForm()
      this.permLabel = ''
      this.permKeyword = ''
      this.permCollapseActive = ['A']
      this.permPanelVisible = false
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
    },
    async handleEdit(row) {
      this.dialogTitle = '编辑资源'
      try {
        const detail = await getResourceDetail(row.id)
        this.form = {
          id: detail.id,
          requestMethod: detail.requestMethod,
          requestUri: detail.requestUri,
          permCode: detail.permCode,
          status: detail.status,
          remark: detail.remark
        }
        this.permKeyword = ''
        this.permCollapseActive = ['A']
        this.permPanelVisible = false
        this.syncPermLabel()
        this.dialogVisible = true
        this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
      } catch (error) {
        console.error(error)
      }
    },
    togglePermPanel() {
      this.permPanelVisible = !this.permPanelVisible
    },
    selectPermCode(perm) {
      this.form.permCode = perm.permCode
      this.permLabel = `${perm.permName} (${perm.permCode})`
      this.permPanelVisible = false
    },
    clearPermSelect() {
      this.form.permCode = ''
      this.permLabel = ''
      this.permKeyword = ''
      this.permPanelVisible = false
    },
    syncPermLabel() {
      if (!this.form.permCode) {
        this.permLabel = ''
        return
      }
      const match = (this.permOptions || []).find(item => item.permCode === this.form.permCode)
      if (match) {
        this.permLabel = `${match.permName} (${match.permCode})`
      }
    },
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) {
          return
        }
        try {
          if (this.form.id) {
            await updateResource(this.form)
            Message.success('修改成功')
          } else {
            await addResource(this.form)
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
      this.$confirm(`确认删除资源 ${row.requestUri} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await deleteResource(row.id)
          Message.success('删除成功')
          this.fetchList()
        })
        .catch(() => {
        })
    },
    statusTagType(value) {
      return value === '0' ? 'success' : 'info'
    }
  }
}
</script>

<style scoped>

.page-pagination {
  margin-top: 12px;
  text-align: right;
}
</style>

<style>
.perm-select {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.perm-input {
  cursor: pointer;
}

.perm-panel {
  margin-top: 8px;
  background: #ffffff;
  border: 1px solid #e1e8ff;
  border-radius: 12px;
  padding: 10px 12px 12px;
  max-height: 60vh;
  overflow: auto;
}

.perm-toolbar {
  display: flex;
  align-items: center;
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

.perm-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.perm-item {
  border: 1px solid #e1e8ff;
  border-radius: 10px;
  padding: 8px 10px;
  background: #ffffff;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.perm-item:hover {
  border-color: #4f70ff;
  box-shadow: 0 8px 16px rgba(79, 112, 255, 0.16);
}

.perm-item.is-active {
  border-color: #4f70ff;
  background: #eef3ff;
}

.perm-name {
  font-size: 13px;
  color: #1f2d3d;
}

.perm-code {
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
