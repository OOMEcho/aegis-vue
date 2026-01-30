<template>
  <div class="login-container">
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

          <!-- 登录方式切换 -->
          <el-tabs v-model="loginType" @tab-click="handleTabChange">
            <el-tab-pane label="账号登录" name="password"></el-tab-pane>
            <el-tab-pane label="邮箱登录" name="email"></el-tab-pane>
          </el-tabs>

          <!-- 账号密码登录 -->
          <el-form
            v-if="loginType === 'password'"
            ref="passwordForm"
            :model="passwordForm"
            :rules="passwordRules"
          >
            <el-form-item prop="username">
              <el-input
                v-model="passwordForm.username"
                placeholder="请输入用户名"
                prefix-icon="el-icon-user"
                :disabled="showCaptcha"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="el-icon-lock"
                :disabled="showCaptcha"
                @keyup.enter.native="handleLoginClick"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="handleLoginClick"
                :loading="isLoggingIn"
                :disabled="showCaptcha"
                style="width: 100%"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 邮箱验证码登录 -->
          <el-form
            v-if="loginType === 'email'"
            ref="emailForm"
            :model="emailForm"
            :rules="emailRules"
          >
            <el-form-item prop="email">
              <el-input
                v-model="emailForm.email"
                placeholder="请输入邮箱"
                prefix-icon="el-icon-message"
                :disabled="showCaptcha"
              />
            </el-form-item>

            <el-form-item prop="code">
              <div class="code-input-wrapper">
                <el-input
                  v-model="emailForm.code"
                  placeholder="请输入验证码"
                  prefix-icon="el-icon-key"
                  :disabled="showCaptcha"
                  @keyup.enter.native="handleLoginClick"
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

            <el-form-item>
              <el-button
                type="primary"
                @click="handleLoginClick"
                :loading="isLoggingIn"
                :disabled="showCaptcha"
                style="width: 100%"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 注册入口 -->
          <div class="register-link">
            <span>还没有账号？</span>
            <el-link type="primary" @click="goToRegister">立即注册</el-link>
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
        <el-button @click="handleCaptchaClose" :disabled="isLoggingIn">
          取消登录
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SlideCaptcha from '@/components/SlideCaptcha/index.vue';
import {login} from '@/api/login';
import {getPublicKey, sendEmailCode} from '@/api/profile';
import {rsaEncrypt} from '@/utils/encrypt';

export default {
  name: 'LoginPage',
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

    return {
      loginType: 'password', // 'password' | 'email'

      // 账号密码登录表单
      passwordForm: {
        username: '',
        password: ''
      },
      passwordRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, message: '用户名长度不能小于3位', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, message: '密码长度不能小于6位', trigger: 'blur'}
        ]
      },

      // 邮箱登录表单
      emailForm: {
        email: '',
        code: ''
      },
      emailRules: {
        email: [
          {required: true, validator: validateEmail, trigger: 'blur'}
        ],
        code: [
          {required: true, message: '请输入验证码', trigger: 'blur'},
          {len: 6, message: '验证码长度为6位', trigger: 'blur'}
        ]
      },

      showCaptcha: false,
      isLoggingIn: false,
      publicKey: '',
      countdown: 0, // 验证码倒计时
      timer: null
    };
  },
  created() {
    // 页面加载时获取公钥
    this.fetchPublicKey();
  },
  beforeDestroy() {
    // 清除倒计时
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

    // 切换登录方式
    handleTabChange() {
      // 清空表单
      this.passwordForm = {username: '', password: ''};
      this.emailForm = {email: '', code: ''};

      // 重置验证
      this.$nextTick(() => {
        if (this.$refs.passwordForm) {
          this.$refs.passwordForm.clearValidate();
        }
        if (this.$refs.emailForm) {
          this.$refs.emailForm.clearValidate();
        }
      });
    },

    // 发送邮箱验证码
    async handleSendCode() {
      try {
        // 先验证邮箱格式
        await this.$refs.emailForm.validateField('email');

        // 调用发送验证码接口
        await sendEmailCode(this.emailForm.email);

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

    // 点击登录按钮
    handleLoginClick() {
      const formRef = this.loginType === 'password' ? 'passwordForm' : 'emailForm';

      this.$refs[formRef].validate(valid => {
        if (valid) {
          // 检查公钥（仅密码登录需要）
          if (this.loginType === 'password' && !this.publicKey) {
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

    // 滑块拖动完成后自动登录
    async handleSlideComplete({captchaKey, slideX}) {
      try {
        // 通知滑块组件进入验证状态
        this.$refs.slideCaptcha.setVerifying(true);
        this.isLoggingIn = true;

        let loginParams = {
          loginType: this.loginType,
          captchaKey,
          slideX
        };

        // 根据登录类型组装参数
        if (this.loginType === 'password') {
          // 账号密码登录：加密密码
          const encryptedPassword = rsaEncrypt(this.passwordForm.password, this.publicKey);

          loginParams.username = this.passwordForm.username;
          loginParams.password = encryptedPassword;

        } else if (this.loginType === 'email') {
          // 邮箱验证码登录
          loginParams.email = this.emailForm.email;
          loginParams.code = this.emailForm.code;
        }

        // 调用登录接口
        const data = await login(loginParams);

        // 登录成功
        this.$message.success('登录成功');
        this.showCaptcha = false;

        // 保存token
        await this.$store.dispatch('auth/saveToken', data)

        const userInfo = await this.$store.dispatch('auth/fetchUserInfo')
        const accessRoutes = await this.$store.dispatch('permission/generateRoutes', userInfo)
        accessRoutes.forEach(route => {
          this.$router.addRoute('layout', route)
        })

        // 延迟跳转
        setTimeout(() => {
          this.$router.push('/');
        }, 500);

      } catch (error) {
        // 刷新验证码
        this.$nextTick(() => {
          if (this.$refs.slideCaptcha) {
            this.$refs.slideCaptcha.refreshCaptcha();
          }
        });
      } finally {
        this.isLoggingIn = false;
        if (this.$refs.slideCaptcha) {
          this.$refs.slideCaptcha.setVerifying(false);
        }
      }
    },

    // 关闭验证码弹窗
    handleCaptchaClose() {
      if (this.isLoggingIn) {
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

    // 跳转到注册页面
    goToRegister() {
      this.$router.push('/register');
    }
  }
};
</script>

<style scoped>
.login-container {
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

.login-container::before,
.login-container::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.08);
  z-index: 0;
}

.login-container::before {
  width: 420px;
  height: 420px;
  top: -120px;
  left: -120px;
}

.login-container::after {
  width: 520px;
  height: 520px;
  right: -180px;
  top: 40px;
}

.login-shell {
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


.login-hero {
  padding: 48px 56px;
  background: linear-gradient(145deg, #eef3ff 0%, #f6f8ff 100%);
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: relative;
}

.login-hero::after {
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

.login-panel {
  background: #ffffff;
  padding: 56px 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-box {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.login-title {
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

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.register-link span {
  margin-right: 0;
}

.dialog-footer {
  text-align: center;
  padding-top: 10px;
}

/* Element UI Tabs 样式调整 */
::v-deep .el-tabs__header {
  margin-bottom: 20px;
}

::v-deep .el-tabs__nav-wrap::after {
  height: 1px;
}

::v-deep .el-tabs__item {
  font-size: 16px;
  padding: 0 30px;
}

::v-deep .el-tabs__item.is-active {
  color: #4f70ff;
  font-weight: 500;
}

::v-deep .el-tabs__active-bar {
  background-color: #4f70ff;
}

/* 移动端适配 */
@media (max-width: 1024px) {
  .login-shell {
    grid-template-columns: minmax(0, 1fr);
    min-height: auto;
  }

  .login-hero {
    padding: 40px;
  }

  .login-panel {
    padding: 40px;
  }
}

@media (max-width: 640px) {
  .login-container {
    padding: 16px;
    height: auto;
  }

  .login-hero {
    padding: 32px 24px;
  }

  .login-panel {
    padding: 32px 24px;
  }

  .hero-title {
    font-size: 24px;
  }

  .send-code-btn {
    width: 100px;
    font-size: 12px;
  }

  ::v-deep .el-tabs__item {
    padding: 0 18px;
    font-size: 14px;
  }
}
</style>
