<template>
  <div class="register-container">
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
import SlideCaptcha from '@/components/SlideCaptcha/request.vue';
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
          this.$router.push('/');
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
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('~@/assets/images/login-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.register-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-request: 0;
}

.register-box {
  position: relative;
  z-request: 1;
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.register-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
  font-weight: 500;
}

.code-input-wrapper {
  display: flex;
  gap: 10px;
}

.code-input-wrapper .el-input {
  flex: 1;
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
}

.back-to-login span {
  margin-right: 5px;
}

.dialog-footer {
  text-align: center;
  padding-top: 10px;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .register-box {
    width: 90%;
    padding: 30px 20px;
  }

  .register-title {
    font-size: 20px;
  }

  .send-code-btn {
    width: 100px;
    font-size: 12px;
  }
}
</style>
