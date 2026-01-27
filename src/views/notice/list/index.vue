<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>通知公告</span>
      </div>

      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="通知标题">
          <el-input v-model="queryParams.noticeTitle" placeholder="通知标题" clearable/>
        </el-form-item>
        <el-form-item label="通知类型">
          <el-select v-model="queryParams.noticeType" placeholder="通知类型" clearable>
            <el-option label="系统通知" value="1"/>
            <el-option label="公告" value="2"/>
            <el-option label="提醒" value="3"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="状态" clearable>
            <el-option label="待发布" value="0"/>
            <el-option label="已发布" value="1"/>
            <el-option label="已撤回" value="2"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-toolbar">
        <el-button type="primary" size="small" icon="el-icon-plus" v-perm="'system:notice:add'" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="noticeTitle" label="通知标题" min-width="160"/>
        <el-table-column label="通知类型" width="100">
          <template slot-scope="scope">
            {{ noticeTypeText(scope.row.noticeType) }}
          </template>
        </el-table-column>
        <el-table-column label="目标类型" width="120">
          <template slot-scope="scope">
            {{ targetTypeText(scope.row.targetType) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === '0'" size="mini">待发布</el-tag>
            <el-tag v-else-if="scope.row.status === '1'" type="success" size="mini">已发布</el-tag>
            <el-tag v-else type="info" size="mini">已撤回</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" min-width="160"/>
        <el-table-column label="操作" min-width="240" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" v-perm="'system:notice:update'" @click="handleEdit(scope.row)">编辑
            </el-button>
            <el-button size="mini" type="danger" v-perm="'system:notice:delete'" @click="handleDelete(scope.row)">删除
            </el-button>
            <el-button
              v-if="scope.row.status === '0'"
              size="mini"
              v-perm="'system:notice:publish'"
              @click="handlePublish(scope.row)">
              发布
            </el-button>
            <el-button
              v-if="scope.row.status === '1'"
              size="mini"
              v-perm="'system:notice:revoke'"
              @click="handleRevoke(scope.row)">
              撤销
            </el-button>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="640px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="通知标题" prop="noticeTitle">
          <el-input v-model="form.noticeTitle" placeholder="请输入通知标题"/>
        </el-form-item>
        <el-form-item label="通知类型" prop="noticeType">
          <el-select v-model="form.noticeType" placeholder="请选择通知类型">
            <el-option label="系统通知" value="1"/>
            <el-option label="公告" value="2"/>
            <el-option label="提醒" value="3"/>
          </el-select>
        </el-form-item>
        <el-form-item label="目标类型" prop="targetType">
          <el-select v-model="form.targetType" placeholder="请选择目标类型">
            <el-option label="全部用户" :value="1"/>
            <el-option label="指定用户" :value="2"/>
            <el-option label="指定角色" :value="3"/>
            <el-option label="指定部门" :value="4"/>
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.targetType !== 1" label="目标对象" prop="targetIds">
          <el-select v-model="form.targetIds" multiple filterable placeholder="请选择目标对象">
            <el-option
              v-for="item in targetOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="通知内容" prop="noticeContent">
          <el-input v-model="form.noticeContent" type="textarea" rows="6"/>
        </el-form-item>
        <el-form-item label="发布时间" prop="publishTime">
          <el-date-picker
            v-model="form.publishTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="为空则立即发布"/>
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
  addNotice,
  deleteNotice,
  getNoticeDetail,
  getNoticePageList,
  publishNotice,
  revokeNotice,
  updateNotice
} from '@/api/notice'
import {getUserPageList} from '@/api/user'
import {getRolePageList} from '@/api/role'
import {getDeptList} from '@/api/dept'
import {Message} from 'element-ui'

export default {
  name: 'NoticeListPage',
  data() {
    return {
      loading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        noticeTitle: '',
        noticeType: '',
        status: ''
      },
      tableData: [],
      dialogVisible: false,
      dialogTitle: '',
      form: this.getDefaultForm(),
      rules: {
        noticeTitle: [{required: true, message: '请输入通知标题', trigger: 'blur'}],
        noticeType: [{required: true, message: '请选择通知类型', trigger: 'change'}],
        targetType: [{required: true, message: '请选择目标类型', trigger: 'change'}],
        noticeContent: [{required: true, message: '请输入通知内容', trigger: 'blur'}]
      },
      userOptions: [],
      roleOptions: [],
      deptOptions: []
    }
  },
  computed: {
    targetOptions() {
      if (this.form.targetType === 2) {
        return this.userOptions
      }
      if (this.form.targetType === 3) {
        return this.roleOptions
      }
      if (this.form.targetType === 4) {
        return this.deptOptions
      }
      return []
    }
  },
  watch: {
    'form.targetType'(value) {
      if (value === 1) {
        this.form.targetIds = []
      }
    }
  },
  created() {
    this.fetchList()
    this.fetchTargets()
  },
  methods: {
    getDefaultForm() {
      return {
        id: null,
        noticeTitle: '',
        noticeType: '1',
        noticeContent: '',
        targetType: 1,
        targetIds: [],
        publishTime: ''
      }
    },
    noticeTypeText(value) {
      const map = {1: '系统通知', 2: '公告', 3: '提醒'}
      return map[value] || value
    },
    targetTypeText(value) {
      const map = {1: '全部用户', 2: '指定用户', 3: '指定角色', 4: '指定部门'}
      return map[value] || value
    },
    async fetchList() {
      this.loading = true
      try {
        const data = await getNoticePageList(this.queryParams)
        this.tableData = data.records || []
        this.total = Number(data.total || 0)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async fetchTargets() {
      try {
        const userData = await getUserPageList({pageNum: 1, pageSize: 1000})
        this.userOptions = (userData.records || []).map(item => ({
          label: item.nickname || item.username,
          value: item.id
        }))
        const roleData = await getRolePageList({pageNum: 1, pageSize: 1000})
        this.roleOptions = (roleData.records || []).map(item => ({
          label: item.roleName,
          value: item.id
        }))
        const deptData = await getDeptList({})
        this.deptOptions = (deptData || []).map(item => ({
          label: item.deptName,
          value: item.id
        }))
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
        noticeTitle: '',
        noticeType: '',
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
      this.dialogTitle = '新增通知'
      this.form = this.getDefaultForm()
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
    },
    async handleEdit(row) {
      this.dialogTitle = '编辑通知'
      try {
        const detail = await getNoticeDetail(row.id)
        let targetIds = []
        if (Array.isArray(detail.targetIds)) {
          targetIds = detail.targetIds
        } else if (detail.targetIds) {
          targetIds = detail.targetIds.split(',').map(item => Number(item))
        }
        this.form = {
          id: detail.id,
          noticeTitle: detail.noticeTitle,
          noticeType: detail.noticeType,
          noticeContent: detail.noticeContent,
          targetType: detail.targetType,
          targetIds,
          publishTime: detail.publishTime || ''
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
            await updateNotice(this.form)
            Message.success('修改成功')
          } else {
            await addNotice(this.form)
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
      this.$confirm(`确认删除通知 ${row.noticeTitle} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await deleteNotice(row.id)
          Message.success('删除成功')
          this.fetchList()
        })
        .catch(() => {
        })
    },
    handlePublish(row) {
      this.$confirm(`确认发布通知 ${row.noticeTitle} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await publishNotice(row.id)
          Message.success('发布成功')
          this.fetchList()
        })
        .catch(() => {
        })
    },
    handleRevoke(row) {
      this.$confirm(`确认撤销通知 ${row.noticeTitle} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await revokeNotice(row.id)
          Message.success('撤销成功')
          this.fetchList()
        })
        .catch(() => {
        })
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
