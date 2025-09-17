<template>
  <div>
    <!-- 调试信息 -->
    <div v-if="true" style="position: fixed; top: 50px; right: 10px; background: blue; color: white; padding: 10px; z-index: 10001;">
      Modal Debug: visible = {{ visible }}, value = {{ value }}
    </div>

    <!-- 弹框背景遮罩 -->
    <div v-if="visible" class="captcha-modal-overlay" @click="handleClose">
      <div class="captcha-modal" @click.stop>
        <!-- 弹框头部 -->
        <div class="modal-header">
          <h3>安全验证</h3>
          <button @click="handleClose" class="close-btn">×</button>
        </div>

        <!-- 验证码内容 - 直接使用原有的SlideCaptcha组件 -->
        <div class="modal-body">
          <SlideCaptcha @verify-success="onVerifySuccess" ref="slideCaptcha" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SlideCaptcha from './SlideCaptcha.vue'

export default {
  name: 'SlideCaptchaModal',
  components: {
    SlideCaptcha
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    visible: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  watch: {
    value(newVal) {
      console.log('SlideCaptchaModal value changed:', newVal)
    }
  },
  methods: {
    onVerifySuccess() {
      console.log('SlideCaptchaModal: verify success')
      this.$emit('verify-success')
      setTimeout(() => {
        this.handleClose()
      }, 800)
    },

    handleClose() {
      console.log('SlideCaptchaModal: handleClose called')
      if (!this.$refs.slideCaptcha?.verifySuccess) {
        this.$emit('verify-cancel')
      }
      this.visible = false
    }
  }
}
</script>

<style scoped>
.captcha-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.captcha-modal {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 20px;
  display: flex;
  justify-content: center;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .captcha-modal {
    margin: 20px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }
}
</style>