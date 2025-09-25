<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">登录</h2>

      <el-form :model="loginForm" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"/>
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="openCaptchaDialog">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 滑块验证码弹窗 -->
    <el-dialog
      :visible.sync="captchaDialogVisible"
      width="360px"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <!-- 使用 v-show 防止组件重复创建 -->
      <slide-captcha-component
        v-show="captchaDialogVisible"
        ref="captchaRef"
        @verify-success="onCaptchaSuccess"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="captchaDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SlideCaptchaComponent from "@/components/SlideCaptcha/index.vue";
import {login} from "@/api/login";

export default {
  name: "LoginComponent",
  components: {SlideCaptchaComponent},
  data() {
    return {
      loginForm: {
        username: "",
        password: ""
      },
      captchaDialogVisible: false,
      captchaLoaded: false // 防止重复请求
    };
  },
  methods: {
    openCaptchaDialog() {
      if (!this.loginForm.username || !this.loginForm.password) {
        this.$message.warning("请输入用户名和密码");
        return;
      }

      this.captchaDialogVisible = true;

      // 只加载一次验证码
      this.$nextTick(() => {
        if (this.$refs.captchaRef) {
          this.$refs.captchaRef.loadCaptcha();
        }
      });
    },

    async onCaptchaSuccess(sliderPosition) {
      this.captchaDialogVisible = false;

      const captchaKey = this.$refs.captchaRef.captchaData.captchaKey;

      try {
        const data = await login({
          loginType: 'password',
          username: this.loginForm.username,
          password: this.loginForm.password,
          captchaKey,
          slideX: sliderPosition
        });
        if (data) {
          this.$message.success("登录成功！");
          await this.$router.push({path: "/layout"});
        } else {
          // 登录失败刷新滑块
          this.captchaLoaded = false;
          this.openCaptchaDialog();
        }
      } catch (error) {
        this.captchaLoaded = false;
        this.openCaptchaDialog();
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f5f5;
}

.login-card {
  width: 360px;
  padding: 30px 20px;
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
}
</style>
