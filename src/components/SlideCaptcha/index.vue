<template>
  <div class="slide-captcha-container">
    <div class="captcha-header">
      <span>拖动滑块到缺口处完成验证</span>
      <button @click="refreshCaptcha" class="refresh-btn">🔄</button>
    </div>

    <!-- 验证码主体区域 -->
    <div class="captcha-main" v-if="captchaData">
      <!-- 背景图片 -->
      <div class="background-container">
        <img :src="captchaData.backgroundImage" alt="背景图" class="background-image">

        <!-- 滑块图片 -->
        <img
          :src="captchaData.sliderImage"
          alt="滑块"
          class="slider-image"
          :style="{
            top: captchaData.sliderY + 'px',
            left: sliderPosition + 'px'
          }"
        >
      </div>

      <!-- 滑动轨道 -->
      <div class="slide-track">
        <div class="slide-track-bg">
          <div class="slide-progress" :style="{ width: slideProgress + '%' }"></div>
          <span class="slide-text" v-if="!isSliding && slideProgress === 0">
            向右滑动
          </span>
        </div>

        <!-- 滑动按钮 -->
        <div
          class="slide-button"
          :class="{ 'sliding': isSliding, 'success': verifySuccess, 'failed': verifyFailed }"
          :style="{ left: sliderPosition + 'px' }"
          @mousedown="startSlide"
          @touchstart="startSlide"
        >
          <span v-if="!isSliding && !verifySuccess && !verifyFailed">→</span>
          <span v-else-if="isSliding">⊙</span>
          <span v-else-if="verifySuccess">✓</span>
          <span v-else-if="verifyFailed">✗</span>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading" v-else>
      加载验证码中...
    </div>

    <!-- 结果提示 -->
    <div class="result-message" v-if="resultMessage" :class="verifySuccess ? 'success' : 'failed'">
      {{ resultMessage }}
    </div>
  </div>
</template>

<script>
import {generateCaptcha, verifyCaptcha,} from "@/api/slideCaptcha"

export default {
  name: 'SlideCaptcha',
  data() {
    return {
      captchaData: null,
      sliderPosition: 0,
      slideProgress: 0,
      isSliding: false,
      verifySuccess: false,
      verifyFailed: false,
      resultMessage: '',
      startX: 0,
      maxSlideDistance: 260, // 最大滑动距离
      isNearTarget: false, // 是否接近目标位置
      lastVerifyTime: 0, // 上次验证时间，防止频繁验证
    }
  },
  mounted() {
    this.loadCaptcha()
    this.addEventListeners()
  },
  beforeUnmount() {
    this.removeEventListeners()
  },
  methods: {
    /**
     * 加载验证码
     */
    async loadCaptcha() {
      try {
        this.captchaData = await generateCaptcha()
        this.resetState()
      } catch (error) {
        console.error('加载验证码失败:', error)
        this.resultMessage = '加载验证码失败，请重试'
      }
    },

    /**
     * 刷新验证码
     */
    refreshCaptcha() {
      this.loadCaptcha()
    },

    /**
     * 重置组件状态
     */
    resetState() {
      this.sliderPosition = 0
      this.slideProgress = 0
      this.isSliding = false
      this.verifySuccess = false
      this.verifyFailed = false
      this.resultMessage = ''
      this.isNearTarget = false
      this.lastVerifyTime = 0
    },

    /**
     * 开始滑动
     */
    startSlide(event) {
      if (this.verifySuccess || this.verifyFailed) return

      this.isSliding = true
      this.startX = this.getEventX(event)

      event.preventDefault()
    },

    /**
     * 滑动中
     */
    onSliding(event) {
      if (!this.isSliding) return

      const currentX = this.getEventX(event)
      const deltaX = currentX - this.startX

      // 限制滑动范围
      this.sliderPosition = Math.max(0, Math.min(deltaX, this.maxSlideDistance))
      this.slideProgress = (this.sliderPosition / this.maxSlideDistance) * 100

      event.preventDefault()
    },

    /**
     * 结束滑动
     */
    async stopSlide() {
      if (!this.isSliding) return

      this.isSliding = false

      // 防止频繁验证，至少间隔300ms
      const now = Date.now()
      if (now - this.lastVerifyTime < 300) {
        this.resetSlidePosition()
        return
      }
      this.lastVerifyTime = now

      // 如果滑动距离太小（小于15px），直接重置
      if (this.sliderPosition < 15) {
        this.resetSlidePosition()
        return
      }

      // 无论滑到什么位置都进行验证
      await this.verifyCaptcha()
    },

    /**
     * 验证滑动验证码
     */
    async verifyCaptcha() {
      try {
        const data = await verifyCaptcha(this.captchaData.captchaKey, this.sliderPosition);
        if (data) {
          this.verifySuccess = true
          this.slideProgress = 100 // 验证成功时设置为100%
          this.resultMessage = '验证成功！'
          this.$emit('verify-success')
        } else {
          this.verifyFailed = true
          this.resultMessage = '验证失败，请重试'
          // 验证失败时重置滑块位置
          setTimeout(() => {
            this.resetSlidePosition()
            setTimeout(() => {
              this.refreshCaptcha()
            }, 500)
          }, 1000)
        }
      } catch (error) {
        console.error('验证失败:', error)
        this.verifyFailed = true
        this.resultMessage = '验证出错，请重试'
        // 网络错误时也重置滑块位置
        setTimeout(() => {
          this.resetSlidePosition()
          setTimeout(() => {
            this.refreshCaptcha()
          }, 500)
        }, 1000)
      }
    },

    /**
     * 重置滑块位置
     */
    resetSlidePosition() {
      const duration = 300
      const startPosition = this.sliderPosition
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        this.sliderPosition = startPosition * (1 - progress)
        this.slideProgress = (this.sliderPosition / this.maxSlideDistance) * 100

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      animate()
    },

    /**
     * 获取事件的X坐标
     */
    getEventX(event) {
      return event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX
    },

    /**
     * 添加事件监听器
     */
    addEventListeners() {
      document.addEventListener('mousemove', this.onSliding)
      document.addEventListener('mouseup', this.stopSlide)
      document.addEventListener('touchmove', this.onSliding)
      document.addEventListener('touchend', this.stopSlide)
    },

    /**
     * 移除事件监听器
     */
    removeEventListeners() {
      document.removeEventListener('mousemove', this.onSliding)
      document.removeEventListener('mouseup', this.stopSlide)
      document.removeEventListener('touchmove', this.onSliding)
      document.removeEventListener('touchend', this.stopSlide)
    }
  }
}
</script>

<style scoped>
.slide-captcha-container {
  width: 320px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.captcha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
  color: #666;
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 2px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.captcha-main {
  position: relative;
}

.background-container {
  position: relative;
  width: 320px;
  height: 180px;
  overflow: hidden;
}

.background-image {
  width: 100%;
  height: 100%;
  display: block;
}

.slider-image {
  position: absolute;
  width: 60px;
  height: 60px;
  transition: left 0.1s ease-out;
  z-index: 2;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.slide-track {
  position: relative;
  height: 50px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 5px;
}

.slide-track-bg {
  flex: 1;
  height: 40px;
  background: #e8e8e8;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.slide-progress {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  border-radius: 20px;
  transition: width 0.1s ease-out;
}

.slide-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #999;
  font-size: 14px;
  pointer-events: none;
  user-select: none;
}

.slide-button {
  position: absolute;
  left: 5px;
  width: 40px;
  height: 40px;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #666;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 3;
}

.slide-button:hover {
  border-color: #4CAF50;
  color: #4CAF50;
}

.slide-button.sliding {
  border-color: #2196F3;
  color: #2196F3;
  transform: scale(1.1);
}

.slide-button.success {
  border-color: #4CAF50;
  background: #4CAF50;
  color: white;
}

.slide-button.failed {
  border-color: #f44336;
  background: #f44336;
  color: white;
}

.loading {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
}

.result-message {
  padding: 10px 15px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

.result-message.success {
  background: #e8f5e8;
  color: #4CAF50;
  border-top: 1px solid #4CAF50;
}

.result-message.failed {
  background: #ffeaea;
  color: #f44336;
  border-top: 1px solid #f44336;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .slide-captcha-container {
    width: 100%;
    max-width: 320px;
  }

  .slide-button {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}
</style>
