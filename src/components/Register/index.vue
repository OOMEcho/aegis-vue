<template>
  <div class="register-container">
    <div class="register-shell">
      <section class="register-hero">
        <div class="brand">
          <img class="brand-logo" src="@/assets/images/logo.png" alt="Aegis" />
          <span class="brand-name">Aegis</span>
        </div>
        <div class="hero-content">
          <h1 class="hero-title">创建你的账号</h1>
          <p class="hero-subtitle">快速开通团队空间，配置权限与角色</p>
          <div class="hero-illustration">
            <div class="panel-card"></div>
            <div class="panel-card"></div>
            <div class="panel-card"></div>
          </div>
        </div>
        <div class="hero-caption">安全验证与敏感操作全程保护</div>
      </section>

      <section class="register-panel">
        <div class="register-box">
          <h2 class="register-title">用户注册</h2>

      <!-- 注册表单 -->
      <el-form
        ref="registerForm"
        :model="registerForm"
        :rules="registerRules"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            :disabled="showCaptcha"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            prefix-icon="el-icon-message"
            :disabled="showCaptcha"
          />
        </el-form-item>

        <el-form-item prop="code">
          <div class="code-input-wrapper">
            <el-input
              v-model="registerForm.code"
              placeholder="请输入验证码"
              prefix-icon="el-icon-key"
              :disabled="showCaptcha"
            />
            <el-button
              class="send-code-btn"
              :disabled="countdown > 0 || showCaptcha"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            show-password
            :disabled="showCaptcha"
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            prefix-icon="el-icon-lock"
            show-password
            :disabled="showCaptcha"
            @keyup.enter.native="handleRegisterClick"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleRegisterClick"
            :loading="isRegistering"
            :disabled="showCaptcha"
            style="width: 100%"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 返回登录 -->
          <div class="back-to-login">
            <span>已有账号？</span>
            <el-link type="primary" @click="goToLogin">立即登录</el-link>
          </div>
        </div>
      </section>
    </div>

    <!-- 滑块验证码弹窗 -->
    <el-dialog
      title="安全验证"
      :visible.sync="showCaptcha"
      width="360px"
      :close-on-click-modal="false"
      :show-close="true"
      center
      @close="handleCaptchaClose"
    >
      <slide-captcha
        ref="slideCaptcha"
        @slide-complete="handleSlideComplete"
        @load-error="handleCaptchaLoadError"
      />

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCaptchaClose" :disabled="isRegistering">
          取消注册
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SlideCaptcha from '@/components/SlideCaptcha/index.vue';
import {register, sendEmailCode} from '@/api/profile';
import {getPublicKey} from '@/api/profile';
import {rsaEncrypt} from '@/utils/encrypt';

export default {
  name: 'RegisterPage',
  components: {
    SlideCaptcha
  },
  data() {
    // 邮箱验证规则
    const validateEmail = (rule, value, callback) => {
      const emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      if (!value) {
        callback(new Error('请输入邮箱'));
      } else if (!emailReg.test(value)) {
        callback(new Error('请输入正确的邮箱格式'));
      } else {
        callback();
      }
    };

    // 确认密码验证规则
    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请确认密码'));
      } else if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };

    return {
      // 注册表单
      registerForm: {
        username: '',
        email: '',
        code: '',
        password: '',
        confirmPassword: ''
      },
      registerRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 6, max: 20, message: '用户名长度必须在6到20个字符之间', trigger: 'blur'},
          {pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur'}
        ],
        email: [
          {required: true, validator: validateEmail, trigger: 'blur'}
        ],
        code: [
          {required: true, message: '请输入验证码', trigger: 'blur'},
          {len: 6, message: '验证码长度为6位', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 8, max: 16, message: '密码长度必须在8到16个字符之间', trigger: 'blur'},
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,16}$/,
            message: '密码必须包含大小写字母和数字',
            trigger: 'blur'
          }
        ],
        confirmPassword: [
          {required: true, validator: validateConfirmPassword, trigger: 'blur'}
        ]
      },

      showCaptcha: false,
      isRegistering: false,
      publicKey: '',
      countdown: 0,
      timer: null
    };
  },
  created() {
    this.fetchPublicKey();
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    // 获取RSA公钥
    async fetchPublicKey() {
      try {
        this.publicKey = await getPublicKey();
      } catch (error) {
        console.error('获取公钥失败:', error);
        this.$message.error('获取公钥失败，请刷新页面重试');
      }
    },

    // 发送邮箱验证码
    async handleSendCode() {
      try {
        // 先验证邮箱格式
        await this.$refs.registerForm.validateField('email');

        // 调用发送验证码接口
        await sendEmailCode(this.registerForm.email);

        this.$message.success('验证码已发送，请查收邮箱');

        // 开始倒计时
        this.countdown = 60;
        this.timer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            clearInterval(this.timer);
          }
        }, 1000);

      } catch (error) {
        console.error('发送验证码失败:', error);
      }
    },

    // 点击注册按钮
    handleRegisterClick() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          // 检查公钥
          if (!this.publicKey) {
            this.$message.error('系统初始化中，请稍后重试');
            this.fetchPublicKey();
            return false;
          }

          // 表单验证通过，显示滑块验证码
          this.showCaptcha = true;
        } else {
          return false;
        }
      });
    },

    // 滑块拖动完成后自动注册
    async handleSlideComplete({captchaKey, slideX}) {
      try {
        // 通知滑块组件进入验证状态
        this.$refs.slideCaptcha.setVerifying(true);
        this.isRegistering = true;

        // 加密密码
        const encryptedPassword = rsaEncrypt(this.registerForm.password, this.publicKey);
        const encryptedConfirmPassword = rsaEncrypt(this.registerForm.confirmPassword, this.publicKey);

        // 组装注册参数
        const registerParams = {
          username: this.registerForm.username,
          email: this.registerForm.email,
          code: this.registerForm.code,
          password: encryptedPassword,
          confirmPassword: encryptedConfirmPassword,
          captchaKey,
          slideX
        };

        // 调用注册接口
        await register(registerParams);

        this.$message.success('注册成功，即将跳转到登录页面');
        this.showCaptcha = false;

        // 延迟跳转到登录页
        setTimeout(() => {
          this.$router.push('/login');
        }, 1500);

      } catch (error) {
        // 刷新验证码
        this.$nextTick(() => {
          if (this.$refs.slideCaptcha) {
            this.$refs.slideCaptcha.refreshCaptcha();
          }
        });
      } finally {
        this.isRegistering = false;
        if (this.$refs.slideCaptcha) {
          this.$refs.slideCaptcha.setVerifying(false);
        }
      }
    },

    // 关闭验证码弹窗
    handleCaptchaClose() {
      if (this.isRegistering) {
        return;
      }
      this.showCaptcha = false;
    },

    // 验证码加载失败
    handleCaptchaLoadError(error) {
      this.$message.error('验证码加载失败，请刷新页面重试');
      console.error('验证码加载失败:', error);
      this.showCaptcha = false;
    },

    // 返回登录
    goToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  align-items: stretch;
  justify-content: center;
  background: linear-gradient(135deg, #f4f7ff 0%, #e9efff 45%, #f7f9ff 100%);
  padding: 32px;
  position: relative;
  overflow: hidden;
  font-family: "Manrope", "Noto Sans SC", "PingFang SC", sans-serif;
  box-sizing: border-box;
}

.register-container::before,
.register-container::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.08);
  z-index: 0;
}

.register-container::before {
  width: 420px;
  height: 420px;
  top: -120px;
  left: -120px;
}

.register-container::after {
  width: 520px;
  height: 520px;
  right: -180px;
  top: 40px;
}

.register-shell {
  position: relative;
  z-index: 1;
  width: min(1200px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(360px, 480px);
  background: #f7f9ff;
  border-radius: 28px;
  box-shadow: 0 30px 80px rgba(26, 36, 64, 0.12);
  overflow: hidden;
  min-height: calc(100vh - 64px);
}

.register-hero {
  padding: 48px 56px;
  background: linear-gradient(145deg, #eef3ff 0%, #f6f8ff 100%);
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: relative;
}

.register-hero::after {
  content: '';
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: rgba(103, 128, 255, 0.12);
  right: -80px;
  top: 40px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #1f2d3d;
}

.brand-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.brand-name {
  font-size: 18px;
  letter-spacing: 0.4px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-title {
  font-size: 32px;
  color: #23314a;
  margin: 0;
}

.hero-subtitle {
  font-size: 14px;
  color: #6b7a99;
  margin: 0;
}

.hero-illustration {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.panel-card {
  height: 90px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 16px 30px rgba(58, 82, 160, 0.12);
  position: relative;
}

.panel-card::after {
  content: '';
  position: absolute;
  width: 50%;
  height: 6px;
  left: 16px;
  top: 18px;
  border-radius: 6px;
  background: #d7e0ff;
  box-shadow: 0 14px 0 #e7ecff, 0 28px 0 #f0f3ff;
}

.hero-caption {
  margin-top: auto;
  color: #7c8aa5;
  font-size: 13px;
}

.register-panel {
  background: #ffffff;
  padding: 56px 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.register-box {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.register-title {
  text-align: center;
  margin-bottom: 24px;
  color: #202c44;
  font-size: 26px;
  font-weight: 600;
}


.send-code-btn {
  width: 120px;
  flex-shrink: 0;
}

.back-to-login {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.back-to-login span {
  margin-right: 0;
}

.dialog-footer {
  text-align: center;
  padding-top: 10px;
}

@media (max-width: 1024px) {
  .register-shell {
    grid-template-columns: minmax(0, 1fr);
    min-height: auto;
  }

  .register-hero {
    padding: 40px;
  }

  .register-panel {
    padding: 40px;
  }
}

@media (max-width: 640px) {
  .register-container {
    padding: 16px;
    height: auto;
  }

  .register-hero {
    padding: 32px 24px;
  }

  .register-panel {
    padding: 32px 24px;
  }

  .hero-title {
    font-size: 24px;
  }

  .send-code-btn {
    width: 100px;
    font-size: 12px;
  }
}
</style>
