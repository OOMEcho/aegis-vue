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
          <el-button type="primary">上传头像</el-button>
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
                  :value="item.dictValue">
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

<script setup lang="ts">
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getAvatarPreview, getPublicKey, logout, updatePassword, updateProfile, uploadAvatar } from '@/api/profile'
import { resetRouter } from '@/router'
import { rsaEncrypt } from '@/utils/encrypt'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import { useDict } from '@/composables/useDict'

const router = useRouter()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const { dicts, loadDictOptions } = useDict()

const activeTab = ref('profile')
const avatarPreviewUrl = ref('')
const publicKey = ref('')

const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

const profileForm = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  sex: '0'
})

const passwordForm = reactive({
  oldPassword: '',
  password: '',
  confirmPassword: ''
})

const profileRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 16, message: '密码长度必须在8到16位之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.password) {
          callback(new Error('两次密码不一致'))
        } else {
          callback()
        }
      }, trigger: 'blur'
    }
  ]
}

const userInfo = computed(() => authStore.userInfo || {} as Record<string, any>)
const displayName = computed(() => userInfo.value.nickname || userInfo.value.username || '用户')
const avatarText = computed(() => displayName.value ? displayName.value.charAt(0) : 'U')
const avatarUrl = computed(() => avatarPreviewUrl.value)
const roleText = computed(() => {
  if (!userInfo.value.roleList || !userInfo.value.roleList.length) {
    return '-'
  }
  return userInfo.value.roleList.map((item: any) => item.roleName).join('、')
})

watch(userInfo, (info: any) => {
  profileForm.username = info.username || ''
  profileForm.nickname = info.nickname || ''
  profileForm.email = info.email || ''
  profileForm.phone = info.phone || ''
  profileForm.sex = info.sex || '0'
}, { immediate: true })

watch(() => userInfo.value.avatar, () => {
  loadAvatarPreview()
}, { immediate: true })

async function fetchUserInfo() {
  try {
    await authStore.fetchUserInfo(true)
  } catch (error) {
    console.error(error)
  }
}

async function fetchPublicKey() {
  try {
    publicKey.value = await getPublicKey()
  } catch (error) {
    console.error(error)
  }
}

function revokeAvatarPreview() {
  if (avatarPreviewUrl.value) {
    URL.revokeObjectURL(avatarPreviewUrl.value)
    avatarPreviewUrl.value = ''
  }
}

async function loadAvatarPreview() {
  if (!userInfo.value.avatar) {
    revokeAvatarPreview()
    return
  }
  try {
    const blob = await getAvatarPreview()
    if (!blob || !blob.size) {
      revokeAvatarPreview()
      return
    }
    revokeAvatarPreview()
    avatarPreviewUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('加载头像失败:', error)
    revokeAvatarPreview()
  }
}

async function handleAvatarUpload(option: any) {
  const formData = new FormData()
  formData.append('file', option.file)
  try {
    await uploadAvatar(formData)
    ElMessage.success('头像上传成功')
    await fetchUserInfo()
    if (option.onSuccess) {
      option.onSuccess()
    }
  } catch (error) {
    console.error(error)
    if (option.onError) {
      option.onError(error)
    }
  }
}

function submitProfile() {
  profileFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    try {
      const payload = {
        nickname: profileForm.nickname,
        email: profileForm.email,
        phone: profileForm.phone,
        sex: profileForm.sex
      }
      await updateProfile(payload)
      ElMessage.success('保存成功')
      await fetchUserInfo()
    } catch (error) {
      console.error(error)
    }
  })
}

function submitPassword() {
  passwordFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }
    if (!publicKey.value) {
      ElMessage.warning('公钥加载失败，请刷新页面重试')
      return
    }
    try {
      const payload = {
        // 密码需用后端公钥加密
        oldPassword: rsaEncrypt(passwordForm.oldPassword, publicKey.value),
        password: rsaEncrypt(passwordForm.password, publicKey.value),
        confirmPassword: rsaEncrypt(passwordForm.confirmPassword, publicKey.value)
      }
      await updatePassword(payload)
      ElMessage.success('密码修改成功，请重新登录')
      await logout()
      authStore.clearToken()
      permissionStore.reset()
      resetRouter()
      await router.replace('/login')
    } catch (error) {
      console.error(error)
    }
  })
}

onBeforeUnmount(() => {
  revokeAvatarPreview()
})

// created
loadDictOptions('USER_GENDER')
fetchUserInfo()
fetchPublicKey()
</script>

<style scoped>
.page-container {
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
