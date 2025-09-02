<template>
  <div class="app">
    <div class="container">
      <h1>登录系统</h1>

      <form @submit.prevent="handleLogin" class="login-form">
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

        <!-- 滑动验证码组件 -->
        <div class="form-group">
          <SlideCaptcha
            @verify-success="onCaptchaSuccess"
            ref="slideCaptcha"
          />
        </div>

        <button
          type="submit"
          class="login-btn"
          :disabled="!captchaVerified"
          :class="{ 'disabled': !captchaVerified }"
        >
          {{ captchaVerified ? '登录' : '请完成验证' }}
        </button>
      </form>

      <!-- 登录结果 -->
      <div v-if="loginResult" class="login-result" :class="loginResult.success ? 'success' : 'error'">
        {{ loginResult.message }}
      </div>
    </div>
  </div>
</template>

<script>
import SlideCaptcha from './SlideCaptcha.vue'

export default {
  name: 'LoginApp',
  components: {
    SlideCaptcha
  },
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      captchaVerified: false,
      loginResult: null
    }
  },
  methods: {
    /**
     * 验证码验证成功回调
     */
    onCaptchaSuccess() {
      this.captchaVerified = true
      console.log('验证码验证通过！')
    },

    /**
     * 处理登录
     */
    async handleLogin() {
      if (!this.captchaVerified) {
        this.loginResult = {
          success: false,
          message: '请先完成安全验证'
        }
        return
      }

      try {
        // 直接用router跳转到/layout
        await this.$router.push('/layout')

      } catch (error) {
        console.error('登录请求失败:', error)
        this.loginResult = {
          success: false,
          message: '网络错误，请重试'
        }

        // 网络错误，重置验证码
        this.resetCaptcha()
      }
    },

    /**
     * 重置验证码状态
     */
    resetCaptcha() {
      this.captchaVerified = false
      if (this.$refs.slideCaptcha) {
        this.$refs.slideCaptcha.refreshCaptcha()
      }
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
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-weight: 600;
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
  }

  h1 {
    font-size: 24px;
  }

  .form-group input {
    padding: 10px 14px;
  }

  .login-btn {
    padding: 12px;
    font-size: 14px;
  }
}
</style>
