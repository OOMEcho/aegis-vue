<template>
  <div class="slide-captcha-container">
    <div class="captcha-header">
      <span>拖动滑块到缺口处完成验证</span>
      <button @click="refreshCaptcha" class="refresh-btn">🔄</button>
    </div>

    <div class="captcha-main" v-if="captchaData">
      <div class="background-container">
        <img :src="captchaData.backgroundImage" class="background-image"  alt="背景图"/>
        <img
          :src="captchaData.sliderImage"
          class="slider-image"
          :style="{ top: captchaData.sliderY + 'px', left: sliderPosition + 'px' }"
         alt="滑块"/>
      </div>

      <div class="slide-track">
        <div class="slide-track-bg">
          <div class="slide-progress" :style="{ width: slideProgress + '%' }"></div>
          <span class="slide-text" v-if="!isSliding && slideProgress === 0">向右滑动</span>
        </div>

        <div
          class="slide-button"
          :class="{ sliding: isSliding }"
          :style="{ left: sliderPosition + 'px' }"
          @mousedown="startSlide"
          @touchstart="startSlide"
        >
          <span v-if="!isSliding">→</span>
          <span v-else>⊙</span>
        </div>
      </div>
    </div>

    <div class="loading" v-else>加载验证码中...</div>
  </div>
</template>

<script>
import { generateCaptcha } from "@/api/profile";

export default {
  name: "SlideCaptchaComponent",
  data() {
    return {
      captchaData: null,
      sliderPosition: 0,
      slideProgress: 0,
      isSliding: false,
      startX: 0,
      maxSlideDistance: 260
    };
  },
  mounted() {
    this.addEventListeners();
  },
  beforeUnmount() {
    this.removeEventListeners();
  },
  methods: {
    async loadCaptcha() {
      this.captchaData = await generateCaptcha();
      this.sliderPosition = 0;
      this.slideProgress = 0;
    },

    refreshCaptcha() {
      this.loadCaptcha();
    },

    startSlide(event) {
      this.isSliding = true;
      this.startX = this.getEventX(event);
      event.preventDefault();

      document.addEventListener("mousemove", this.onSliding);
      document.addEventListener("mouseup", this.stopSlide);
      document.addEventListener("touchmove", this.onSliding);
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

      // 拖动完成后，直接触发事件，把 sliderPosition 和 captchaKey 传给父组件
      this.$emit("verify-success", this.sliderPosition);

      this.removeEventListeners();
    },

    getEventX(event) {
      return event.type.startsWith("touch") ? event.touches[0].clientX : event.clientX;
    },

    addEventListeners() {
      document.addEventListener("mousemove", this.onSliding);
      document.addEventListener("mouseup", this.stopSlide);
      document.addEventListener("touchmove", this.onSliding);
      document.addEventListener("touchend", this.stopSlide);
    },

    removeEventListeners() {
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
