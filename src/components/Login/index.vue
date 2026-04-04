<template>
  <div class="login-container">
    <div
      v-if="demoReset && demoReset.enabled && !demoResetError"
      class="demo-reset-float"
    >
      <div class="demo-reset-title">演示数据重置</div>
      <div class="demo-reset-row">
        <span class="demo-reset-label">距下次重置</span>
        <span class="demo-reset-value">{{ formatCountdown(remainingSeconds) }}</span>
      </div>
      <div class="demo-reset-row">
        <span class="demo-reset-label">下次重置时间</span>
        <span class="demo-reset-value">{{ demoReset.nextResetTime }}</span>
      </div>
      <div class="demo-reset-row">
        <span class="demo-reset-label">上次重置时间</span>
        <span class="demo-reset-value">{{ demoReset.lastResetTime || '--' }}</span>
      </div>
    </div>
    <div class="login-shell">
      <section class="login-hero">
        <div class="brand">
          <img class="brand-logo" src="@/assets/images/logo.png" alt="Aegis"/>
          <span class="brand-name">Aegis</span>
        </div>
        <div class="hero-content">
          <h1 class="hero-title">欢迎回来</h1>
          <p class="hero-subtitle">高效、安全、清晰的后台管理体验</p>
          <div class="hero-illustration">
            <div class="panel-card"></div>
            <div class="panel-card"></div>
            <div class="panel-card"></div>
          </div>
        </div>
        <div class="hero-caption">让协作更轻松，让管理更稳定</div>
      </section>

      <section class="login-panel">
        <div class="login-box">
          <h2 class="login-title">用户登录</h2>

          <el-tabs v-model="loginType" @tab-change="handleTabChange">
            <el-tab-pane label="账号登录" name="password" />
            <el-tab-pane label="邮箱登录" name="email" />
          </el-tabs>

          <el-form
            v-if="loginType === 'password'"
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
          >
            <el-form-item prop="username">
              <el-input
                v-model="passwordForm.username"
                placeholder="请输入用户名"
                :disabled="showCaptcha"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入密码"
                :disabled="showCaptcha"
                @keyup.enter="handleLoginClick"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="handleLoginClick"
                :loading="isLoggingIn"
                :disabled="showCaptcha"
                style="width: 100%"
              >登录</el-button>
            </el-form-item>
          </el-form>

          <el-form
            v-if="loginType === 'email'"
            ref="emailFormRef"
            :model="emailForm"
            :rules="emailRules"
          >
            <el-form-item prop="email">
              <el-input
                v-model="emailForm.email"
                placeholder="请输入邮箱"
                :disabled="showCaptcha"
              />
            </el-form-item>
            <el-form-item prop="code">
              <div class="code-input-wrapper">
                <el-input
                  v-model="emailForm.code"
                  placeholder="请输入验证码"
                  :disabled="showCaptcha"
                  @keyup.enter="handleLoginClick"
                />
                <el-button
                  class="send-code-btn"
                  :disabled="countdown > 0 || showCaptcha"
                  @click="handleSendCode"
                >{{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}</el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="handleLoginClick"
                :loading="isLoggingIn"
                :disabled="showCaptcha"
                style="width: 100%"
              >登录</el-button>
            </el-form-item>
          </el-form>

          <div class="register-link">
            <span>还没有账号？</span>
            <el-link type="primary" @click="goToRegister">立即注册</el-link>
          </div>
        </div>
      </section>
    </div>

    <el-dialog
      title="安全验证"
      v-model="showCaptcha"
      width="360px"
      :close-on-click-modal="false"
      :show-close="true"
      center
      @close="handleCaptchaClose"
    >
      <slide-captcha
        ref="slideCaptchaRef"
        @slide-complete="handleSlideComplete"
        @load-error="handleCaptchaLoadError"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCaptchaClose" :disabled="isLoggingIn">取消登录</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import SlideCaptcha from '@/components/SlideCaptcha/index.vue'
import { login, getDemoResetCountdown } from '@/api/login'
import { getPublicKey, sendEmailCode } from '@/api/profile'
import { rsaEncrypt } from '@/utils/encrypt'
import { useAuthStore } from '@/stores/auth'

defineOptions({ name: 'LoginPage' })

const router = useRouter()
const authStore = useAuthStore()

const loginType = ref<'password' | 'email'>('password')
const passwordFormRef = ref<FormInstance>()
const emailFormRef = ref<FormInstance>()
const slideCaptchaRef = ref<InstanceType<typeof SlideCaptcha> | null>(null)

const passwordForm = ref({ username: '', password: '' })
const emailForm = ref({ email: '', code: '' })

const validateEmail = (_rule: unknown, value: string, callback: (err?: Error) => void) => {
  const emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
  if (!value) callback(new Error('请输入邮箱'))
  else if (!emailReg.test(value)) callback(new Error('请输入正确的邮箱格式'))
  else callback()
}

const passwordRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const emailRules = {
  email: [{ required: true, validator: validateEmail, trigger: 'blur' }],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ]
}

const showCaptcha = ref(false)
const isLoggingIn = ref(false)
const publicKey = ref('')
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

interface DemoResetData {
  enabled: boolean
  nextResetTime: string
  lastResetTime: string
  secondsToNextReset: number
}
const demoReset = ref<DemoResetData | null>(null)
const demoResetError = ref(false)
const remainingSeconds = ref(0)
let demoResetTimer: ReturnType<typeof setInterval> | null = null

async function fetchPublicKey() {
  try { publicKey.value = await getPublicKey() as string }
  catch (e) { console.error('获取公钥失败:', e); ElMessage.error('获取公钥失败，请刷新页面重试') }
}

async function fetchDemoResetCountdown() {
  demoResetError.value = false
  try {
    const data = await getDemoResetCountdown() as DemoResetData
    demoReset.value = data
    if (data?.enabled) {
      remainingSeconds.value = Math.max(0, Number(data.secondsToNextReset || 0))
      if (demoResetTimer) clearInterval(demoResetTimer)
      demoResetTimer = setInterval(() => {
        if (remainingSeconds.value > 0) remainingSeconds.value -= 1
        else { clearInterval(demoResetTimer!); demoResetTimer = null }
      }, 1000)
    }
  } catch { demoResetError.value = true }
}

function formatCountdown(seconds: number): string {
  const total = Math.max(0, Number(seconds || 0))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function handleTabChange() {
  passwordForm.value = { username: '', password: '' }
  emailForm.value = { email: '', code: '' }
  nextTick(() => {
    passwordFormRef.value?.clearValidate()
    emailFormRef.value?.clearValidate()
  })
}

async function handleSendCode() {
  try {
    await emailFormRef.value?.validateField('email')
    await sendEmailCode(emailForm.value.email)
    ElMessage.success('验证码已发送，请查收邮箱')
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer!)
    }, 1000)
  } catch (e) { console.error('发送验证码失败:', e) }
}

function handleLoginClick() {
  const formRef = loginType.value === 'password' ? passwordFormRef.value : emailFormRef.value
  formRef?.validate((valid) => {
    if (!valid) return
    if (loginType.value === 'password' && !publicKey.value) {
      ElMessage.error('系统初始化中，请稍后重试')
      fetchPublicKey()
      return
    }
    showCaptcha.value = true
  })
}

async function handleSlideComplete({ captchaKey, slideX }: { captchaKey: string; slideX: number }) {
  try {
    slideCaptchaRef.value?.setVerifying(true)
    isLoggingIn.value = true

    const loginParams: Record<string, unknown> = { loginType: loginType.value, captchaKey, slideX }
    if (loginType.value === 'password') {
      loginParams.username = passwordForm.value.username
      loginParams.password = rsaEncrypt(passwordForm.value.password, publicKey.value)
    } else {
      loginParams.email = emailForm.value.email
      loginParams.code = emailForm.value.code
    }

    const data = await login(loginParams as any)
    ElMessage.success('登录成功')
    showCaptcha.value = false
    authStore.saveToken(data as string)
    setTimeout(() => router.push('/'), 500)
  } catch {
    nextTick(() => slideCaptchaRef.value?.refreshCaptcha())
  } finally {
    isLoggingIn.value = false
    slideCaptchaRef.value?.setVerifying(false)
  }
}

function handleCaptchaClose() { if (!isLoggingIn.value) showCaptcha.value = false }
function handleCaptchaLoadError(error: unknown) {
  ElMessage.error('验证码加载失败，请刷新页面重试')
  console.error('验证码加载失败:', error)
  showCaptcha.value = false
}
function goToRegister() { router.push('/register') }

fetchPublicKey()
fetchDemoResetCountdown()

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (demoResetTimer) clearInterval(demoResetTimer)
})
</script>

<style scoped>
.login-container {
  min-height: 100vh; height: 100vh;
  display: flex; align-items: stretch; justify-content: center;
  background: linear-gradient(135deg, #f4f7ff 0%, #e9efff 45%, #f7f9ff 100%);
  padding: 32px; position: relative; overflow: hidden;
  font-family: "Manrope", "Noto Sans SC", "PingFang SC", sans-serif;
  box-sizing: border-box;
}
.demo-reset-float {
  position: absolute; top: 24px; right: 24px; z-index: 2;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(79, 112, 255, 0.12);
  border-radius: 16px; padding: 16px 18px;
  box-shadow: 0 18px 40px rgba(20, 34, 74, 0.12);
  min-width: 240px; backdrop-filter: blur(8px);
}
.demo-reset-title { font-size: 13px; font-weight: 600; color: #2a3553; margin-bottom: 10px; }
.demo-reset-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 12px; color: #4b5a78; margin-top: 6px; }
.demo-reset-label { color: #6a7896; }
.demo-reset-value { font-weight: 600; color: #2f3a57; }
.login-container::before, .login-container::after {
  content: ''; position: absolute; border-radius: 50%;
  background: rgba(102, 126, 234, 0.08); z-index: 0;
}
.login-container::before { width: 420px; height: 420px; top: -120px; left: -120px; }
.login-container::after { width: 520px; height: 520px; right: -180px; top: 40px; }
.login-shell {
  position: relative; z-index: 1; width: min(1200px, 100%);
  display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(360px, 480px);
  background: #f7f9ff; border-radius: 28px;
  box-shadow: 0 30px 80px rgba(26, 36, 64, 0.12);
  overflow: hidden; min-height: calc(100vh - 64px);
}
.login-hero {
  padding: 48px 56px;
  background: linear-gradient(145deg, #eef3ff 0%, #f6f8ff 100%);
  display: flex; flex-direction: column; gap: 32px; position: relative;
}
.login-hero::after {
  content: ''; position: absolute; width: 240px; height: 240px;
  border-radius: 50%; background: rgba(103, 128, 255, 0.12);
  right: -80px; top: 40px;
}
.brand { display: flex; align-items: center; gap: 12px; font-weight: 600; color: #1f2d3d; }
.brand-logo { width: 36px; height: 36px; object-fit: contain; }
.brand-name { font-size: 18px; letter-spacing: 0.4px; }
.hero-content { display: flex; flex-direction: column; gap: 16px; }
.hero-title { font-size: 32px; color: #23314a; margin: 0; }
.hero-subtitle { font-size: 14px; color: #6b7a99; margin: 0; }
.hero-illustration { margin-top: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.panel-card {
  height: 90px; border-radius: 18px; background: #ffffff;
  box-shadow: 0 16px 30px rgba(58, 82, 160, 0.12); position: relative;
}
.panel-card::after {
  content: ''; position: absolute; width: 50%; height: 6px;
  left: 16px; top: 18px; border-radius: 6px;
  background: #d7e0ff; box-shadow: 0 14px 0 #e7ecff, 0 28px 0 #f0f3ff;
}
.hero-caption { margin-top: auto; color: #7c8aa5; font-size: 13px; }
.login-panel {
  background: #ffffff; padding: 56px 48px;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.login-box { width: 100%; max-width: 420px; margin: 0 auto; }
.login-title { text-align: center; margin-bottom: 24px; color: #202c44; font-size: 26px; font-weight: 600; }
.send-code-btn { width: 120px; flex-shrink: 0; }
.register-link {
  text-align: center; margin-top: 20px; color: #666; font-size: 14px;
  display: flex; align-items: center; gap: 6px; justify-content: center;
}
.dialog-footer { text-align: center; padding-top: 10px; }
:deep(.el-tabs__header) { margin-bottom: 20px; }
:deep(.el-tabs__nav-wrap::after) { height: 1px; }
:deep(.el-tabs__item) { font-size: 16px; padding: 0 30px; }
:deep(.el-tabs__item.is-active) { color: #4f70ff; font-weight: 500; }
:deep(.el-tabs__active-bar) { background-color: #4f70ff; }
@media (max-width: 1024px) {
  .login-shell { grid-template-columns: minmax(0, 1fr); min-height: auto; }
  .login-hero { padding: 40px; }
  .login-panel { padding: 40px; }
}
@media (max-width: 640px) {
  .login-container { padding: 16px; height: auto; }
  .demo-reset-float { display: none; }
  .login-hero { padding: 32px 24px; }
  .login-panel { padding: 32px 24px; }
  .hero-title { font-size: 24px; }
  .send-code-btn { width: 100px; font-size: 12px; }
  :deep(.el-tabs__item) { padding: 0 18px; font-size: 14px; }
}
</style>
