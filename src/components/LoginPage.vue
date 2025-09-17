<template>
  <div class="app">
    <div class="container">
      <h1>登录系统</h1>

      <!-- 登录方式切换 -->
      <div class="login-tabs">
        <div
          class="tab-item"
          :class="{ active: loginType === 'password' }"
          @click="switchLoginType('password')"
        >
          账号密码
        </div>
        <div
          class="tab-item"
          :class="{ active: loginType === 'email' }"
          @click="switchLoginType('email')"
        >
          邮箱验证码
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <!-- 账号密码登录 -->
        <div v-if="loginType === 'password'">
          <div class="form-group">
            <label>用户名:</label>
            <input
              v-model="loginForm.username"
              type="text"
              placeholder="请输入用户名"
              required
            >
          </div>

          <div class="form-group">
            <label>密码:</label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              required
            >
          </div>
        </div>

        <!-- 邮箱验证码登录 -->
        <div v-if="loginType === 'email'">
          <div class="form-group">
            <label>邮箱:</label>
            <input
              v-model="loginForm.email"
              type="email"
              placeholder="请输入邮箱地址"
              required
            >
          </div>

          <div class="form-group">
            <label>验证码:</label>
            <div class="verification-input">
              <input
                v-model="loginForm.verificationCode"
                type="text"
                placeholder="请输入验证码"
                maxlength="6"
                required
              >
              <button
                type="button"
                class="send-code-btn"
                :disabled="!canSendCode || !isValidEmail"
                @click="sendVerificationCode"
              >
                {{ codeButtonText }}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="login-btn"
          :disabled="!canLogin"
          :class="{ 'disabled': !canLogin }"
        >
          {{ loginButtonText }}
        </button>

        <!-- 测试按钮 -->
        <button type="button" @click="testModal" style="margin-top: 10px; background: green; color: white; padding: 10px;">
          测试弹框
        </button>
      </form>

      <!-- 登录结果 -->
      <div v-if="loginResult" class="login-result" :class="loginResult.success ? 'success' : 'error'">
        {{ loginResult.message }}
      </div>
    </div>

    <!-- 滑动验证码弹框 -->
    <el-dialog
      title="安全验证"
      :visible.sync="showCaptcha"
      width="400px"
      center
      :close-on-click-modal="false"
      @close="onCaptchaCancel"
    >
      <SlideCaptcha @verify-success="onCaptchaSuccess" ref="slideCaptcha" />
    </el-dialog>

    <!-- 调试信息 -->
    <div v-if="true" style="position: fixed; top: 10px; right: 10px; background: red; color: white; padding: 10px; z-index: 10000;">
      Debug: showCaptcha = {{ showCaptcha }}
    </div>
  </div>
</template>

<script>
import SlideCaptcha from './SlideCaptcha.vue'
import { loginWithPassword, loginWithEmail, sendEmailCode } from '@/api/login'

export default {
  name: 'LoginApp',
  components: {
    SlideCaptcha
  },
  data() {
    return {
      loginType: 'password', // password | email
      loginForm: {
        username: '',
        password: '',
        email: '',
        verificationCode: ''
      },
      captchaVerified: false,
      loginResult: null,
      showCaptcha: false,
      countdown: 0,
      countdownTimer: null,
      loading: false
    }
  },
  computed: {
    isValidEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(this.loginForm.email)
    },
    canSendCode() {
      return this.countdown === 0 && !this.loading
    },
    codeButtonText() {
      if (this.loading) return '发送中...'
      return this.countdown > 0 ? `${this.countdown}s` : '发送验证码'
    },
    canLogin() {
      if (this.loading) return false
      if (this.loginType === 'password') {
        return this.loginForm.username && this.loginForm.password && (!this.showCaptcha || this.captchaVerified)
      } else {
        return this.loginForm.email && this.loginForm.verificationCode && (!this.showCaptcha || this.captchaVerified)
      }
    },
    loginButtonText() {
      if (this.loading) return '登录中...'
      if (!this.showCaptcha) {
        return '登录'
      }
      return this.captchaVerified ? '登录' : '请完成验证'
    }
  },
  methods: {
    switchLoginType(type) {
      this.loginType = type
      this.resetForm()
      this.resetCaptcha()
    },

    resetForm() {
      this.loginForm = {
        username: '',
        password: '',
        email: '',
        verificationCode: ''
      }
      this.loginResult = null
    },

    async sendVerificationCode() {
      if (!this.isValidEmail || !this.canSendCode) {
        return
      }

      this.loading = true
      try {
        await sendEmailCode(this.loginForm.email)

        // 开始倒计时
        this.startCountdown()

        this.loginResult = {
          success: true,
          message: '验证码已发送，请查收邮件'
        }
      } catch (error) {
        console.error('发送验证码失败:', error)
        this.loginResult = {
          success: false,
          message: error.message || '发送验证码失败，请重试'
        }
      } finally {
        this.loading = false
      }
    },

    startCountdown() {
      this.countdown = 60
      this.countdownTimer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer)
          this.countdownTimer = null
        }
      }, 1000)
    },

    onCaptchaSuccess() {
      this.captchaVerified = true
      console.log('验证码验证通过！')
      setTimeout(() => {
        this.showCaptcha = false
      }, 800)
    },

    onCaptchaCancel() {
      this.showCaptcha = false
      this.loginResult = {
        success: false,
        message: '已取消安全验证'
      }
    },

    async handleLogin() {
      console.log('handleLogin called, canLogin:', this.canLogin)
      if (!this.canLogin) {
        return
      }

      // 如果还没有显示验证码，先显示验证码
      if (!this.showCaptcha) {
        console.log('Setting showCaptcha to true')
        this.showCaptcha = true
        this.loginResult = {
          success: false,
          message: '请完成安全验证'
        }
        return
      }

      console.log('Captcha verified:', this.captchaVerified)
      if (!this.captchaVerified) {
        this.loginResult = {
          success: false,
          message: '请先完成安全验证'
        }
        return
      }

      this.loading = true
      try {
        let response

        if (this.loginType === 'password') {
          response = await loginWithPassword(this.loginForm.username, this.loginForm.password)
        } else {
          response = await loginWithEmail(this.loginForm.email, this.loginForm.verificationCode)
        }

        // 存储token到store
        if (response && response.access_token) {
          await this.$store.dispatch('auth/saveToken', response.access_token)

          this.loginResult = {
            success: true,
            message: '登录成功，正在跳转...'
          }

          // 延迟跳转，让用户看到成功消息
          setTimeout(() => {
            this.$router.push('/layout')
          }, 1000)
        } else {
          throw new Error('登录响应格式错误')
        }

      } catch (error) {
        console.error('登录请求失败:', error)
        this.loginResult = {
          success: false,
          message: error.message || '登录失败，请检查账号信息'
        }

        // 登录失败，重置验证码
        this.resetCaptcha()
      } finally {
        this.loading = false
      }
    },

    resetCaptcha() {
      this.captchaVerified = false
      this.showCaptcha = false
    },

    testModal() {
      console.log('测试按钮被点击，当前showCaptcha:', this.showCaptcha)
      this.showCaptcha = !this.showCaptcha
      console.log('设置后showCaptcha:', this.showCaptcha)
    }
  },

  beforeDestroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-weight: 600;
}

.login-tabs {
  display: flex;
  border-radius: 8px;
  background: #f5f5f5;
  padding: 4px;
  margin-bottom: 30px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #666;
}

.tab-item.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-item:hover:not(.active) {
  color: #667eea;
}

.login-form {
  space-y: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.verification-input {
  display: flex;
  gap: 12px;
}

.verification-input input {
  flex: 1;
}

.send-code-btn {
  padding: 12px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 120px;
}

.send-code-btn:hover:not(:disabled) {
  background: #5a6fd8;
}

.send-code-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.login-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.login-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.login-result {
  margin-top: 20px;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
}

.login-result.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.login-result.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .container {
    padding: 30px 20px;
    margin: 10px;
    max-width: none;
  }

  h1 {
    font-size: 24px;
  }

  .form-group input {
    padding: 10px 14px;
  }

  .verification-input {
    flex-direction: column;
  }

  .send-code-btn {
    min-width: auto;
    width: 100%;
  }

  .login-btn {
    padding: 12px;
    font-size: 14px;
  }

  .tab-item {
    padding: 10px 12px;
    font-size: 14px;
  }
}
</style>
