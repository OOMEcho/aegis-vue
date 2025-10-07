<template>
  <div class="slide-captcha-container">
    <div class="captcha-header">
      <span>拖动滑块到缺口处完成验证</span>
      <button @click="refreshCaptcha" class="refresh-btn" :disabled="isSliding || isVerifying">🔄</button>
    </div>

    <div class="captcha-main" v-if="captchaData && !loadError">
      <div class="background-container">
        <img :src="captchaData.backgroundImage" class="background-image" alt="背景图"/>
        <img
          :src="captchaData.sliderImage"
          class="slider-image"
          :style="{ top: captchaData.sliderY + 'px', left: sliderPosition + 'px' }"
          alt="滑块"/>
      </div>

      <div class="slide-track">
        <div class="slide-track-bg">
          <div
            class="slide-progress"
            :class="{ 'verifying': isVerifying }"
            :style="{ width: slideProgress + '%' }">
          </div>
          <span class="slide-text" v-if="!isSliding && slideProgress === 0 && !isVerifying">
            向右滑动验证
          </span>
          <span class="slide-text verifying-text" v-if="isVerifying">
            验证中...
          </span>
        </div>

        <div
          class="slide-button"
          :class="{ sliding: isSliding, verifying: isVerifying }"
          :style="{ left: sliderPosition + 'px' }"
          @mousedown="startSlide"
          @touchstart="startSlide"
        >
          <span v-if="!isSliding && !isVerifying">→</span>
          <span v-else-if="isVerifying">⊙</span>
          <span v-else>⊙</span>
        </div>
      </div>
    </div>

    <div class="loading" v-else-if="!loadError">加载验证码中...</div>
    <div class="error" v-else>
      <p>验证码加载失败</p>
      <button @click="refreshCaptcha" class="retry-btn">重试</button>
    </div>
  </div>
</template>

<script>
import {generateCaptcha} from "@/api/profile";

export default {
  name: "SlideCaptchaComponent",
  data() {
    return {
      captchaData: null,
      sliderPosition: 0,
      slideProgress: 0,
      isSliding: false,
      isVerifying: false,
      startX: 0,
      maxSlideDistance: 260,
      loadError: false
    };
  },
  mounted() {
    this.loadCaptcha();
  },
  beforeUnmount() {
    this.cleanupListeners();
  },
  methods: {
    async loadCaptcha() {
      try {
        this.loadError = false;
        this.captchaData = await generateCaptcha();
        this.resetSlider();
      } catch (error) {
        console.error('验证码加载失败:', error);
        this.loadError = true;
        this.$emit('load-error', error);
      }
    },

    refreshCaptcha() {
      this.loadCaptcha();
    },

    resetSlider() {
      this.sliderPosition = 0;
      this.slideProgress = 0;
      this.isSliding = false;
      this.isVerifying = false;
    },

    // 设置验证状态（供父组件调用）
    setVerifying(status) {
      this.isVerifying = status;
    },

    startSlide(event) {
      if (this.isVerifying) return;

      this.isSliding = true;
      this.startX = this.getEventX(event);
      event.preventDefault();

      document.addEventListener("mousemove", this.onSliding, {passive: false});
      document.addEventListener("mouseup", this.stopSlide);
      document.addEventListener("touchmove", this.onSliding, {passive: false});
      document.addEventListener("touchend", this.stopSlide);
    },

    onSliding(event) {
      if (!this.isSliding) return;

      const deltaX = this.getEventX(event) - this.startX;
      this.sliderPosition = Math.max(0, Math.min(deltaX, this.maxSlideDistance));
      this.slideProgress = (this.sliderPosition / this.maxSlideDistance) * 100;
      event.preventDefault();
    },

    stopSlide() {
      if (!this.isSliding) return;
      this.isSliding = false;
      this.isVerifying = true;
      this.cleanupListeners();

      // 拖动完成后立即触发验证事件
      this.$emit("slide-complete", {
        captchaKey: this.captchaData.captchaKey,
        slideX: Math.round(this.sliderPosition)
      });
    },

    getEventX(event) {
      return event.type.startsWith("touch") ? event.touches[0].clientX : event.clientX;
    },

    cleanupListeners() {
      document.removeEventListener("mousemove", this.onSliding);
      document.removeEventListener("mouseup", this.stopSlide);
      document.removeEventListener("touchmove", this.onSliding);
      document.removeEventListener("touchend", this.stopSlide);
    }
  }
};
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
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.1);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.captcha-main {
  position: relative;
}

.background-container {
  position: relative;
  width: 320px;
  height: 180px;
  overflow: hidden;
  background: #f5f5f5;
}

.background-image {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
}

.slider-image {
  position: absolute;
  width: 60px;
  height: 60px;
  transition: left 0.1s ease-out;
  z-request: 2;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  user-select: none;
  pointer-events: none;
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

.slide-progress.verifying {
  background: linear-gradient(90deg, #2196F3, #1976D2);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
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
  white-space: nowrap;
}

.verifying-text {
  color: #2196F3;
  font-weight: 500;
}

.slide-button {
  position: absolute;
  left: 5px;
  width: 40px;
  height: 40px;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 50%;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #666;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-request: 3;
  touch-action: none;
  user-select: none;
}

.slide-button:hover:not(.verifying) {
  border-color: #4CAF50;
  color: #4CAF50;
}

.slide-button.sliding {
  cursor: grabbing;
  border-color: #2196F3;
  color: #2196F3;
  transform: scale(1.1);
}

.slide-button.verifying {
  border-color: #2196F3;
  color: #2196F3;
  cursor: not-allowed;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading, .error {
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
  gap: 10px;
}

.retry-btn {
  padding: 6px 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #1976D2;
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
