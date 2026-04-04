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
          :class="{ sliding: isSliding }"
          :style="sliderImageStyle"
          alt="滑块"/>
      </div>

      <div class="slide-track">
        <div class="slide-track-bg">
          <div
            class="slide-progress"
            :class="{ 'verifying': isVerifying, sliding: isSliding }"
            :style="slideProgressStyle">
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
          :style="sliderButtonStyle"
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

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { generateCaptcha } from '@/api/profile'

defineOptions({ name: 'SlideCaptchaComponent' })

const emit = defineEmits<{
  'slide-complete': [payload: { captchaKey: string; slideX: number }]
  'load-error': [error: unknown]
}>()

interface CaptchaData {
  backgroundImage: string
  sliderImage: string
  sliderY: number
  captchaKey: string
}

const captchaData = ref<CaptchaData | null>(null)
const sliderPosition = ref(0)
const slideProgress = ref(0)
const isSliding = ref(false)
const isVerifying = ref(false)
const startX = ref(0)
const maxSlideDistance = 260
const loadError = ref(false)

const sliderImageStyle = computed(() => ({
  top: captchaData.value ? `${captchaData.value.sliderY}px` : '0px',
  transform: `translate3d(${sliderPosition.value}px, 0, 0)`
}))

const sliderButtonStyle = computed(() => {
  const scale = isSliding.value ? ' scale(1.1)' : ''
  return { transform: `translate3d(${sliderPosition.value}px, 0, 0)${scale}` }
})

const slideProgressStyle = computed(() => ({
  transform: `scaleX(${slideProgress.value / 100})`
}))

async function loadCaptcha() {
  try {
    loadError.value = false
    captchaData.value = await generateCaptcha() as CaptchaData
    resetSlider()
  } catch (error) {
    console.error('验证码加载失败:', error)
    loadError.value = true
    emit('load-error', error)
  }
}

function refreshCaptcha() {
  loadCaptcha()
}

function resetSlider() {
  sliderPosition.value = 0
  slideProgress.value = 0
  isSliding.value = false
  isVerifying.value = false
}

function setVerifying(status: boolean) {
  isVerifying.value = status
}

function startSlide(event: MouseEvent | TouchEvent) {
  if (isVerifying.value) return
  isSliding.value = true
  startX.value = getEventX(event)
  event.preventDefault()

  document.addEventListener('mousemove', onSliding, { passive: false })
  document.addEventListener('mouseup', stopSlide)
  document.addEventListener('touchmove', onSliding, { passive: false })
  document.addEventListener('touchend', stopSlide)
}

function onSliding(event: MouseEvent | TouchEvent) {
  if (!isSliding.value) return
  const deltaX = getEventX(event) - startX.value
  const nextX = Math.max(0, Math.min(deltaX, maxSlideDistance))
  sliderPosition.value = nextX
  slideProgress.value = (nextX / maxSlideDistance) * 100
  event.preventDefault()
}

function stopSlide() {
  if (!isSliding.value) return
  isSliding.value = false
  isVerifying.value = true
  cleanupListeners()

  emit('slide-complete', {
    captchaKey: captchaData.value!.captchaKey,
    slideX: Math.round(sliderPosition.value)
  })
}

function getEventX(event: MouseEvent | TouchEvent): number {
  return 'touches' in event ? event.touches[0].clientX : event.clientX
}

function cleanupListeners() {
  document.removeEventListener('mousemove', onSliding)
  document.removeEventListener('mouseup', stopSlide)
  document.removeEventListener('touchmove', onSliding)
  document.removeEventListener('touchend', stopSlide)
}

onMounted(() => { loadCaptcha() })
onBeforeUnmount(() => { cleanupListeners() })

defineExpose({ refreshCaptcha, setVerifying })
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
.refresh-btn:hover:not(:disabled) { background-color: rgba(0, 0, 0, 0.1); }
.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.captcha-main { position: relative; }
.background-container {
  position: relative;
  width: 320px;
  height: 180px;
  overflow: hidden;
  background: #f5f5f5;
}
.background-image { width: 100%; height: 100%; display: block; user-select: none; }
.slider-image {
  position: absolute;
  width: 60px;
  height: 60px;
  transition: transform 0.1s ease-out;
  transform: translate3d(0, 0, 0);
  will-change: transform;
  z-index: 2;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  user-select: none;
  pointer-events: none;
}
.slider-image.sliding { transition: none; }
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
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.1s ease-out;
}
.slide-progress.sliding { transition: none; }
.slide-progress.verifying {
  background: linear-gradient(90deg, #2196F3, #1976D2);
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
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
.verifying-text { color: #2196F3; font-weight: 500; }
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
  transition: transform 0.1s ease-out, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 3;
  touch-action: none;
  user-select: none;
  will-change: transform;
}
.slide-button:hover:not(.verifying) { border-color: #4CAF50; color: #4CAF50; }
.slide-button.sliding { cursor: grabbing; border-color: #2196F3; color: #2196F3; }
.slide-button.verifying { border-color: #2196F3; color: #2196F3; cursor: not-allowed; }
.slide-button.verifying span { display: inline-block; animation: rotate 1s linear infinite; }
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
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
.retry-btn:hover { background: #1976D2; }
@media (max-width: 480px) {
  .slide-captcha-container { width: 100%; max-width: 320px; }
  .slide-button { width: 36px; height: 36px; font-size: 16px; }
}
</style>
