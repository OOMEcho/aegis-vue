<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">用户登录</h2>

      <el-form ref="loginForm" :model="loginForm" :rules="loginRules">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            :disabled="showCaptcha"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
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
import {getPublicKey} from '@/api/profile';
import {rsaEncrypt} from '@/utils/encrypt';

export default {
  name: 'LoginPage',
  components: {
    SlideCaptcha
  },
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, message: '用户名长度不能小于3位', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, message: '密码长度不能小于6位', trigger: 'blur'}
        ]
      },
      showCaptcha: false,
      isLoggingIn: false,
      publicKey: '' // RSA公钥
    };
  },
  created() {
    // 页面加载时获取公钥
    this.fetchPublicKey();
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
    // 点击登录按钮
    handleLoginClick() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          // 检查是否已获取公钥
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

    // 滑块拖动完成后自动登录
    async handleSlideComplete({captchaKey, slideX}) {
      try {
        // 通知滑块组件进入验证状态
        this.$refs.slideCaptcha.setVerifying(true);
        this.isLoggingIn = true;

        // 使用RSA加密密码
        const encryptedPassword = rsaEncrypt(this.loginForm.password, this.publicKey);

        // 调用登录接口（后端会同时验证滑块和登录信息）
        const data = await login({
          loginType: 'password',
          username: this.loginForm.username,
          password: encryptedPassword, // 传递加密后的密码
          captchaKey,
          slideX
        });

        // 登录成功
        this.$message.success('登录成功');
        this.showCaptcha = false;

        // 保存token等信息
        localStorage.setItem('token', data);

        // 延迟一下跳转，让用户看到成功提示
        setTimeout(() => {
          this.$router.push('/layout');
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
        this.$message.warning('正在登录中，请稍候...');
        return;
      }
      this.showCaptcha = false;
    },

    // 验证码加载失败
    handleCaptchaLoadError(error) {
      this.$message.error('验证码加载失败，请刷新页面重试');
      console.error('验证码加载失败:', error);
      // 可以选择关闭弹窗或显示重试按钮
      this.showCaptcha = false;
    }
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
  font-weight: 500;
}

.dialog-footer {
  text-align: center;
  padding-top: 10px;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .login-box {
    width: 90%;
    padding: 30px 20px;
  }

  .login-title {
    font-size: 20px;
  }
}
</style>
