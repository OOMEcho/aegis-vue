<template>
  <div class="page-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>字典管理</span>
      </div>

      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="字典名称">
          <el-input v-model="queryParams.dictName" placeholder="字典名称" clearable/>
        </el-form-item>
        <el-form-item label="字典类型">
          <el-input v-model="queryParams.dictType" placeholder="字典类型" clearable/>
        </el-form-item>
        <el-form-item label="字典标签">
          <el-input v-model="queryParams.dictLabel" placeholder="字典标签" clearable/>
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
        <el-button type="primary" size="small" icon="el-icon-plus" v-perm="'system:dict:add'" @click="handleAdd">
          新增
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="dictName" label="字典名称" min-width="140"/>
        <el-table-column prop="dictType" label="字典类型" min-width="140"/>
        <el-table-column prop="dictLabel" label="字典标签" min-width="120"/>
        <el-table-column prop="dictValue" label="字典键值" min-width="120"/>
        <el-table-column prop="dictSort" label="排序" width="80"/>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="mini">
              {{ dictLabel('DATA_STATUS', scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160"/>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" v-perm="'system:dict:update'" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" v-perm="'system:dict:delete'" @click="handleDelete(scope.row)">删除</el-button>
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
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称"/>
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" placeholder="请输入字典类型"/>
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入字典标签"/>
        </el-form-item>
        <el-form-item label="字典键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入字典键值"/>
        </el-form-item>
        <el-form-item label="排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" :min="0"/>
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
  addDictionary,
  deleteDictionary,
  getDictionaryPageList,
  updateDictionary
} from '@/api/dictionary'
import {Message} from 'element-ui'
import dictMixin from '@/mixins/dict'

export default {
  name: 'DictionaryPage',
  mixins: [dictMixin],
  data() {
    return {
      loading: false,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dictName: '',
        dictType: '',
        dictLabel: '',
        status: ''
      },
      tableData: [],
      dialogVisible: false,
      dialogTitle: '',
      form: this.getDefaultForm(),
      rules: {
        dictName: [{required: true, message: '请输入字典名称', trigger: 'blur'}],
        dictType: [{required: true, message: '请输入字典类型', trigger: 'blur'}],
        dictLabel: [{required: true, message: '请输入字典标签', trigger: 'blur'}],
        dictValue: [{required: true, message: '请输入字典键值', trigger: 'blur'}]
      }
    }
  },
  created() {
    this.loadDictOptions('DATA_STATUS')
    this.fetchList()
  },
  methods: {
    getDefaultForm() {
      return {
        id: null,
        dictName: '',
        dictType: '',
        dictLabel: '',
        dictValue: '',
        dictSort: 0,
        status: '0',
        remark: ''
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const data = await getDictionaryPageList(this.queryParams)
        this.tableData = data.records || []
        this.total = Number(data.total || 0)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
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
        dictName: '',
        dictType: '',
        dictLabel: '',
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
      this.dialogTitle = '新增字典'
      this.form = this.getDefaultForm()
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
    },
    handleEdit(row) {
      this.dialogTitle = '编辑字典'
      this.form = {
        id: row.id,
        dictName: row.dictName,
        dictType: row.dictType,
        dictLabel: row.dictLabel,
        dictValue: row.dictValue,
        dictSort: row.dictSort,
        status: row.status,
        remark: row.remark
      }
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.clearValidate())
    },
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) {
          return
        }
        try {
          if (this.form.id) {
            await updateDictionary(this.form)
            Message.success('修改成功')
          } else {
            await addDictionary(this.form)
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
      this.$confirm(`确认删除字典 ${row.dictName} 吗？`, '提示', {type: 'warning'})
        .then(async () => {
          await deleteDictionary(row.id)
          Message.success('删除成功')
          this.fetchList()
        })
        .catch(() => {})
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
