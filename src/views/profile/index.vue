<template>
  <div class="page-container">
    <el-card class="profile-card">
      <div class="profile-header">
        <el-avatar :size="80" :src="avatarUrl">{{ avatarText }}</el-avatar>
        <div class="profile-meta">
          <div class="profile-name">{{ displayName }}</div>
          <div class="profile-sub">用户名：{{ userInfo.username || '-' }}</div>
          <div class="profile-sub">部门：{{ userInfo.deptName || '-' }}</div>
          <div class="profile-sub">角色：{{ roleText }}</div>
        </div>
        <el-upload
          class="avatar-upload"
          action="#"
          :show-file-list="false"
          :http-request="handleAvatarUpload">
          <el-button size="small" type="primary">上传头像</el-button>
        </el-upload>
      </div>
    </el-card>

    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="profile">
          <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled/>
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="profileForm.nickname" placeholder="请输入昵称"/>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱"/>
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="profileForm.phone" placeholder="请输入手机号"/>
            </el-form-item>
            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="profileForm.sex">
                <el-radio
                  v-for="item in dicts.USER_GENDER || []"
                  :key="item.dictValue"
                  :label="item.dictValue">
                  {{ item.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitProfile">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="修改密码" name="password">
          <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password/>
            </el-form-item>
            <el-form-item label="新密码" prop="password">
              <el-input v-model="passwordForm.password" type="password" show-password/>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password/>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitPassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import {getPublicKey, getUserInfo, logout, updatePassword, updateProfile, uploadAvatar} from '@/api/profile'
import {resetRouter} from '@/router'
import {rsaEncrypt} from '@/utils/encrypt'
import {Message} from 'element-ui'
import dictMixin from '@/mixins/dict'

export default {
  name: 'ProfilePage',
  mixins: [dictMixin],
  data() {
    return {
      activeTab: 'profile',
      userInfo: {},
      publicKey: '',
      profileForm: {
        username: '',
        nickname: '',
        email: '',
        phone: '',
        sex: '0'
      },
      passwordForm: {
        oldPassword: '',
        password: '',
        confirmPassword: ''
      },
      profileRules: {
        nickname: [{required: true, message: '请输入昵称', trigger: 'blur'}]
      },
      passwordRules: {
        oldPassword: [{required: true, message: '请输入旧密码', trigger: 'blur'}],
        password: [
          {required: true, message: '请输入新密码', trigger: 'blur'},
          {min: 8, max: 16, message: '密码长度必须在8到16位之间', trigger: 'blur'}
        ],
        confirmPassword: [
          {required: true, message: '请输入确认密码', trigger: 'blur'},
          {validator: (rule, value, callback) => {
            if (value !== this.passwordForm.password) {
              callback(new Error('两次密码不一致'))
            } else {
              callback()
            }
          }, trigger: 'blur'}
        ]
      }
    }
  },
  computed: {
    displayName() {
      return this.userInfo.nickname || this.userInfo.username || '用户'
    },
    avatarText() {
      return this.displayName ? this.displayName.charAt(0) : 'U'
    },
    avatarUrl() {
      return this.userInfo.avatar || ''
    },
    roleText() {
      if (!this.userInfo.roleList || !this.userInfo.roleList.length) {
        return '-'
      }
      return this.userInfo.roleList.map(item => item.roleName).join('、')
    }
  },
  created() {
    this.loadDictOptions('USER_GENDER')
    this.fetchUserInfo()
    this.fetchPublicKey()
  },
  methods: {
    async fetchUserInfo() {
      try {
        this.userInfo = await getUserInfo()
        this.profileForm = {
          username: this.userInfo.username || '',
          nickname: this.userInfo.nickname || '',
          email: this.userInfo.email || '',
          phone: this.userInfo.phone || '',
          sex: this.userInfo.sex || '0'
        }
      } catch (error) {
        console.error(error)
      }
    },
    async fetchPublicKey() {
      try {
        this.publicKey = await getPublicKey()
      } catch (error) {
        console.error(error)
      }
    },
    async handleAvatarUpload(option) {
      const formData = new FormData()
      formData.append('file', option.file)
      try {
        await uploadAvatar(formData)
        Message.success('头像上传成功')
        await this.fetchUserInfo()
        this.$root.$emit('user-info-updated', this.userInfo)
        if (option.onSuccess) {
          option.onSuccess()
        }
      } catch (error) {
        console.error(error)
        if (option.onError) {
          option.onError(error)
        }
      }
    },
    submitProfile() {
      this.$refs.profileFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        try {
          const payload = {
            nickname: this.profileForm.nickname,
            email: this.profileForm.email,
            phone: this.profileForm.phone,
            sex: this.profileForm.sex
          }
          await updateProfile(payload)
          Message.success('保存成功')
          await this.fetchUserInfo()
          this.$root.$emit('user-info-updated', this.userInfo)
        } catch (error) {
          console.error(error)
        }
      })
    },
    submitPassword() {
      this.$refs.passwordFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        if (!this.publicKey) {
          Message.warning('公钥加载失败，请刷新页面重试')
          return
        }
        try {
          const payload = {
            // 密码需用后端公钥加密
            oldPassword: rsaEncrypt(this.passwordForm.oldPassword, this.publicKey),
            password: rsaEncrypt(this.passwordForm.password, this.publicKey),
            confirmPassword: rsaEncrypt(this.passwordForm.confirmPassword, this.publicKey)
          }
          await updatePassword(payload)
          Message.success('密码修改成功，请重新登录')
          await logout()
          await this.$store.dispatch('auth/clearToken')
          this.$store.commit('permission/SET_ROUTES', [])
          this.$store.commit('permission/SET_PERMISSIONS', [])
          resetRouter()
          await this.$router.replace('/login')
        } catch (error) {
          console.error(error)
        }
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-meta {
  flex: 1;
}

.profile-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
}

.profile-sub {
  color: #666;
  font-size: 13px;
  margin-bottom: 4px;
}

.avatar-upload {
  margin-left: auto;
}
</style>
