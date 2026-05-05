<template>
  <div class="characters-scene" ref="sceneRef">
    <!-- Purple character -->
    <div class="character char-purple" ref="charPurple">
      <div class="eyes" ref="purpleEyes" style="left: 45px; top: 40px; gap: 28px">
        <div class="eyeball" ref="purpleEyeL" style="width: 18px; height: 18px">
          <div class="pupil" ref="purplePupilL" style="width: 7px; height: 7px"></div>
        </div>
        <div class="eyeball" ref="purpleEyeR" style="width: 18px; height: 18px">
          <div class="pupil" ref="purplePupilR" style="width: 7px; height: 7px"></div>
        </div>
      </div>
    </div>
    <!-- Black character -->
    <div class="character char-black" ref="charBlack">
      <div class="eyes" ref="blackEyes" style="left: 26px; top: 32px; gap: 20px">
        <div class="eyeball" ref="blackEyeL" style="width: 16px; height: 16px">
          <div class="pupil" ref="blackPupilL" style="width: 6px; height: 6px"></div>
        </div>
        <div class="eyeball" ref="blackEyeR" style="width: 16px; height: 16px">
          <div class="pupil" ref="blackPupilR" style="width: 6px; height: 6px"></div>
        </div>
      </div>
    </div>
    <!-- Orange character -->
    <div class="character char-orange" ref="charOrange">
      <div class="eyes" ref="orangeEyes" style="left: 82px; top: 90px; gap: 28px">
        <div class="bare-pupil" ref="orangePupilL"></div>
        <div class="bare-pupil" ref="orangePupilR"></div>
      </div>
      <div class="orange-mouth" ref="orangeMouth" style="left: 90px; top: 120px"></div>
    </div>
    <!-- Yellow character -->
    <div class="character char-yellow" ref="charYellow">
      <div class="eyes" ref="yellowEyes" style="left: 52px; top: 40px; gap: 20px">
        <div class="bare-pupil" ref="yellowPupilL"></div>
        <div class="bare-pupil" ref="yellowPupilR"></div>
      </div>
      <div class="yellow-mouth" ref="yellowMouth" style="left: 40px; top: 88px"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

defineOptions({ name: 'AnimatedCharacters' })

const props = withDefaults(defineProps<{
  focusedField?: string | null
  passwordLength?: number
  isPasswordVisible?: boolean
  errorSignal?: number
}>(), {
  focusedField: null,
  passwordLength: 0,
  isPasswordVisible: false,
  errorSignal: 0
})

// Refs
const sceneRef = ref<HTMLElement | null>(null)
const charPurple = ref<HTMLElement | null>(null)
const charBlack = ref<HTMLElement | null>(null)
const charOrange = ref<HTMLElement | null>(null)
const charYellow = ref<HTMLElement | null>(null)
const purpleEyes = ref<HTMLElement | null>(null)
const purpleEyeL = ref<HTMLElement | null>(null)
const purpleEyeR = ref<HTMLElement | null>(null)
const purplePupilL = ref<HTMLElement | null>(null)
const purplePupilR = ref<HTMLElement | null>(null)
const blackEyes = ref<HTMLElement | null>(null)
const blackEyeL = ref<HTMLElement | null>(null)
const blackEyeR = ref<HTMLElement | null>(null)
const blackPupilL = ref<HTMLElement | null>(null)
const blackPupilR = ref<HTMLElement | null>(null)
const orangeEyes = ref<HTMLElement | null>(null)
const orangePupilL = ref<HTMLElement | null>(null)
const orangePupilR = ref<HTMLElement | null>(null)
const orangeMouth = ref<HTMLElement | null>(null)
const yellowEyes = ref<HTMLElement | null>(null)
const yellowPupilL = ref<HTMLElement | null>(null)
const yellowPupilR = ref<HTMLElement | null>(null)
const yellowMouth = ref<HTMLElement | null>(null)

// State
let mouseX = 0
let mouseY = 0
let isLookingAtEachOther = false
let isPurpleBlinking = false
let isBlackBlinking = false
let isPurplePeeking = false
let isLoginError = false
let typingTimer: ReturnType<typeof setTimeout> | null = null
let peekTimer: ReturnType<typeof setTimeout> | null = null
let purpleBlinkTimer: ReturnType<typeof setTimeout> | null = null
let blackBlinkTimer: ReturnType<typeof setTimeout> | null = null
let errorRecoverTimer: ReturnType<typeof setTimeout> | null = null

const isTypingField = computed(() =>
  props.focusedField === 'username' ||
  props.focusedField === 'email' ||
  props.focusedField === 'code'
)
const isLookingAway = computed(() => props.focusedField === 'password' && !props.isPasswordVisible)
const isShowingPwd = computed(() => props.passwordLength > 0 && props.isPasswordVisible)

watch(() => props.focusedField, (newVal, oldVal) => {
  const wasTyping = oldVal === 'username' || oldVal === 'email' || oldVal === 'code'
  const isTypingNow = isTypingField.value
  if (isTypingNow && !wasTyping) setTyping(true)
  else if (!isTypingNow && wasTyping) setTyping(false)
  else updateCharacters()
})
watch(() => props.passwordLength, () => updateCharacters())
watch(() => props.isPasswordVisible, () => updateCharacters())
watch(isShowingPwd, (val) => { if (val) schedulePeek() })
watch(() => props.errorSignal, (val) => { if (val > 0) triggerLoginError() })

function setTyping(typing: boolean) {
  if (typing) {
    isLookingAtEachOther = true
    if (typingTimer) clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      isLookingAtEachOther = false
      updateCharacters()
    }, 800)
  } else {
    isLookingAtEachOther = false
    if (typingTimer) clearTimeout(typingTimer)
  }
  updateCharacters()
}

function scheduleBlinkPurple() {
  purpleBlinkTimer = setTimeout(() => {
    isPurpleBlinking = true
    updateCharacters()
    purpleBlinkTimer = setTimeout(() => {
      isPurpleBlinking = false
      updateCharacters()
      scheduleBlinkPurple()
    }, 150)
  }, Math.random() * 4000 + 3000)
}

function scheduleBlinkBlack() {
  blackBlinkTimer = setTimeout(() => {
    isBlackBlinking = true
    updateCharacters()
    blackBlinkTimer = setTimeout(() => {
      isBlackBlinking = false
      updateCharacters()
      scheduleBlinkBlack()
    }, 150)
  }, Math.random() * 4000 + 3000)
}

function schedulePeek() {
  if (peekTimer) clearTimeout(peekTimer)
  if (!isShowingPwd.value) return
  peekTimer = setTimeout(() => {
    if (!isShowingPwd.value) return
    isPurplePeeking = true
    updateCharacters()
    peekTimer = setTimeout(() => {
      isPurplePeeking = false
      updateCharacters()
      schedulePeek()
    }, 800)
  }, Math.random() * 3000 + 2000)
}

function calcPosition(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 3
  const dx = mouseX - cx
  const dy = mouseY - cy
  const faceX = Math.max(-15, Math.min(15, dx / 20))
  const faceY = Math.max(-10, Math.min(10, dy / 30))
  const bodySkew = Math.max(-6, Math.min(6, -dx / 120))
  return { faceX, faceY, bodySkew }
}

function calcPupilOffset(el: HTMLElement, maxDist: number) {
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = mouseX - cx
  const dy = mouseY - cy
  const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist)
  const angle = Math.atan2(dy, dx)
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
}

function updateCharacters() {
  if (!charPurple.value) return

  const purplePos = calcPosition(charPurple.value)
  const blackPos = calcPosition(charBlack.value!)
  const orangePos = calcPosition(charOrange.value!)
  const yellowPos = calcPosition(charYellow.value!)

  const showingPwd = isShowingPwd.value
  const lookingAway = isLookingAway.value
  const typing = isTypingField.value

  // ---- Purple body ----
  if (showingPwd) {
    charPurple.value.style.transform = 'skewX(0deg)'
    charPurple.value.style.height = '370px'
  } else if (lookingAway) {
    charPurple.value.style.transform = 'skewX(-14deg) translateX(-20px)'
    charPurple.value.style.height = '410px'
  } else if (typing) {
    charPurple.value.style.transform = `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
    charPurple.value.style.height = '410px'
  } else {
    charPurple.value.style.transform = `skewX(${purplePos.bodySkew}deg)`
    charPurple.value.style.height = '370px'
  }

  // Purple eyes
  purpleEyeL.value!.style.height = isPurpleBlinking ? '2px' : '18px'
  purpleEyeR.value!.style.height = isPurpleBlinking ? '2px' : '18px'

  if (isLoginError) {
    purpleEyes.value!.style.left = '30px'
    purpleEyes.value!.style.top = '55px'
    purplePupilL.value!.style.transform = 'translate(-3px, 4px)'
    purplePupilR.value!.style.transform = 'translate(-3px, 4px)'
  } else if (lookingAway) {
    purpleEyes.value!.style.left = '20px'
    purpleEyes.value!.style.top = '25px'
    purplePupilL.value!.style.transform = 'translate(-5px, -5px)'
    purplePupilR.value!.style.transform = 'translate(-5px, -5px)'
  } else if (showingPwd) {
    purpleEyes.value!.style.left = '20px'
    purpleEyes.value!.style.top = '35px'
    const px = isPurplePeeking ? 4 : -4
    const py = isPurplePeeking ? 5 : -4
    purplePupilL.value!.style.transform = `translate(${px}px, ${py}px)`
    purplePupilR.value!.style.transform = `translate(${px}px, ${py}px)`
  } else if (isLookingAtEachOther) {
    purpleEyes.value!.style.left = '55px'
    purpleEyes.value!.style.top = '65px'
    purplePupilL.value!.style.transform = 'translate(3px, 4px)'
    purplePupilR.value!.style.transform = 'translate(3px, 4px)'
  } else {
    purpleEyes.value!.style.left = 45 + purplePos.faceX + 'px'
    purpleEyes.value!.style.top = 40 + purplePos.faceY + 'px'
    const po = calcPupilOffset(purpleEyeL.value!, 5)
    purplePupilL.value!.style.transform = `translate(${po.x}px, ${po.y}px)`
    purplePupilR.value!.style.transform = `translate(${po.x}px, ${po.y}px)`
  }

  // ---- Black body ----
  if (showingPwd) {
    charBlack.value!.style.transform = 'skewX(0deg)'
  } else if (lookingAway) {
    charBlack.value!.style.transform = 'skewX(12deg) translateX(-10px)'
  } else if (isLookingAtEachOther) {
    charBlack.value!.style.transform = `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
  } else if (typing) {
    charBlack.value!.style.transform = `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
  } else {
    charBlack.value!.style.transform = `skewX(${blackPos.bodySkew}deg)`
  }

  // Black eyes
  blackEyeL.value!.style.height = isBlackBlinking ? '2px' : '16px'
  blackEyeR.value!.style.height = isBlackBlinking ? '2px' : '16px'

  if (isLoginError) {
    blackEyes.value!.style.left = '15px'
    blackEyes.value!.style.top = '40px'
    blackPupilL.value!.style.transform = 'translate(-3px, 4px)'
    blackPupilR.value!.style.transform = 'translate(-3px, 4px)'
  } else if (lookingAway) {
    blackEyes.value!.style.left = '10px'
    blackEyes.value!.style.top = '20px'
    blackPupilL.value!.style.transform = 'translate(-4px, -5px)'
    blackPupilR.value!.style.transform = 'translate(-4px, -5px)'
  } else if (showingPwd) {
    blackEyes.value!.style.left = '10px'
    blackEyes.value!.style.top = '28px'
    blackPupilL.value!.style.transform = 'translate(-4px, -4px)'
    blackPupilR.value!.style.transform = 'translate(-4px, -4px)'
  } else if (isLookingAtEachOther) {
    blackEyes.value!.style.left = '32px'
    blackEyes.value!.style.top = '12px'
    blackPupilL.value!.style.transform = 'translate(0px, -4px)'
    blackPupilR.value!.style.transform = 'translate(0px, -4px)'
  } else {
    blackEyes.value!.style.left = 26 + blackPos.faceX + 'px'
    blackEyes.value!.style.top = 32 + blackPos.faceY + 'px'
    const bo = calcPupilOffset(blackEyeL.value!, 4)
    blackPupilL.value!.style.transform = `translate(${bo.x}px, ${bo.y}px)`
    blackPupilR.value!.style.transform = `translate(${bo.x}px, ${bo.y}px)`
  }

  // ---- Orange body ----
  if (isLoginError) {
    orangeMouth.value!.style.left = 80 + orangePos.faceX + 'px'
    orangeMouth.value!.style.top = '130px'
  }
  if (showingPwd) {
    charOrange.value!.style.transform = 'skewX(0deg)'
  } else {
    charOrange.value!.style.transform = `skewX(${orangePos.bodySkew}deg)`
  }

  if (isLoginError) {
    orangeEyes.value!.style.left = '60px'
    orangeEyes.value!.style.top = '95px'
    orangePupilL.value!.style.transform = 'translate(-3px, 4px)'
    orangePupilR.value!.style.transform = 'translate(-3px, 4px)'
  } else if (lookingAway) {
    orangeEyes.value!.style.left = '50px'
    orangeEyes.value!.style.top = '75px'
    orangePupilL.value!.style.transform = 'translate(-5px, -5px)'
    orangePupilR.value!.style.transform = 'translate(-5px, -5px)'
  } else if (showingPwd) {
    orangeEyes.value!.style.left = '50px'
    orangeEyes.value!.style.top = '85px'
    orangePupilL.value!.style.transform = 'translate(-5px, -4px)'
    orangePupilR.value!.style.transform = 'translate(-5px, -4px)'
  } else {
    orangeEyes.value!.style.left = 82 + orangePos.faceX + 'px'
    orangeEyes.value!.style.top = 90 + orangePos.faceY + 'px'
    const oo = calcPupilOffset(orangePupilL.value!, 5)
    orangePupilL.value!.style.transform = `translate(${oo.x}px, ${oo.y}px)`
    orangePupilR.value!.style.transform = `translate(${oo.x}px, ${oo.y}px)`
  }

  // ---- Yellow body ----
  if (showingPwd) {
    charYellow.value!.style.transform = 'skewX(0deg)'
  } else {
    charYellow.value!.style.transform = `skewX(${yellowPos.bodySkew}deg)`
  }

  if (isLoginError) {
    yellowEyes.value!.style.left = '35px'
    yellowEyes.value!.style.top = '45px'
    yellowPupilL.value!.style.transform = 'translate(-3px, 4px)'
    yellowPupilR.value!.style.transform = 'translate(-3px, 4px)'
    yellowMouth.value!.style.left = '30px'
    yellowMouth.value!.style.top = '92px'
    yellowMouth.value!.style.transform = 'rotate(-8deg)'
  } else if (lookingAway) {
    yellowEyes.value!.style.left = '20px'
    yellowEyes.value!.style.top = '30px'
    yellowPupilL.value!.style.transform = 'translate(-5px, -5px)'
    yellowPupilR.value!.style.transform = 'translate(-5px, -5px)'
    yellowMouth.value!.style.left = '15px'
    yellowMouth.value!.style.top = '78px'
    yellowMouth.value!.style.transform = 'rotate(0deg)'
  } else if (showingPwd) {
    yellowEyes.value!.style.left = '20px'
    yellowEyes.value!.style.top = '35px'
    yellowPupilL.value!.style.transform = 'translate(-5px, -4px)'
    yellowPupilR.value!.style.transform = 'translate(-5px, -4px)'
    yellowMouth.value!.style.left = '10px'
    yellowMouth.value!.style.top = '88px'
    yellowMouth.value!.style.transform = 'rotate(0deg)'
  } else {
    yellowEyes.value!.style.left = 52 + yellowPos.faceX + 'px'
    yellowEyes.value!.style.top = 40 + yellowPos.faceY + 'px'
    const yo = calcPupilOffset(yellowPupilL.value!, 5)
    yellowPupilL.value!.style.transform = `translate(${yo.x}px, ${yo.y}px)`
    yellowPupilR.value!.style.transform = `translate(${yo.x}px, ${yo.y}px)`
    yellowMouth.value!.style.left = 40 + yellowPos.faceX + 'px'
    yellowMouth.value!.style.top = 88 + yellowPos.faceY + 'px'
    yellowMouth.value!.style.transform = 'rotate(0deg)'
  }
}

function triggerLoginError() {
  if (errorRecoverTimer) clearTimeout(errorRecoverTimer)
  errorRecoverTimer = null

  const shakeEls = [
    purpleEyes.value, blackEyes.value, orangeEyes.value,
    yellowEyes.value, yellowMouth.value, orangeMouth.value
  ]
  shakeEls.forEach(el => el && el.classList.remove('shake-head'))
  void document.body.offsetHeight

  isLoginError = true
  updateCharacters()

  orangeMouth.value && orangeMouth.value.classList.add('visible')

  setTimeout(() => {
    shakeEls.forEach(el => el && el.classList.add('shake-head'))
  }, 350)

  errorRecoverTimer = setTimeout(() => {
    isLoginError = false
    errorRecoverTimer = null
    orangeMouth.value && orangeMouth.value.classList.remove('visible')
    shakeEls.forEach(el => el && el.classList.remove('shake-head'))
    updateCharacters()
  }, 2500)
}

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
  if (!isTypingField.value && !isLoginError) updateCharacters()
}

onMounted(() => {
  document.addEventListener('mousemove', onMouseMove)
  scheduleBlinkPurple()
  scheduleBlinkBlack()
  nextTick(() => updateCharacters())
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMouseMove)
  if (typingTimer) clearTimeout(typingTimer)
  if (peekTimer) clearTimeout(peekTimer)
  if (purpleBlinkTimer) clearTimeout(purpleBlinkTimer)
  if (blackBlinkTimer) clearTimeout(blackBlinkTimer)
  if (errorRecoverTimer) clearTimeout(errorRecoverTimer)
})
</script>

<style scoped>
.characters-scene {
  position: relative;
  width: 480px;
  height: 360px;
}

.character {
  position: absolute;
  bottom: 0;
  transition: all 0.7s ease-in-out;
  transform-origin: bottom center;
}

.char-purple {
  left: 60px;
  width: 170px;
  height: 370px;
  background: #6c3ff5;
  border-radius: 10px 10px 0 0;
  z-index: 1;
}

.char-black {
  left: 220px;
  width: 115px;
  height: 290px;
  background: #2d2d2d;
  border-radius: 8px 8px 0 0;
  z-index: 2;
}

.char-orange {
  left: 0;
  width: 230px;
  height: 190px;
  background: #ff9b6b;
  border-radius: 115px 115px 0 0;
  z-index: 3;
}

.char-yellow {
  left: 290px;
  width: 135px;
  height: 215px;
  background: #e8d754;
  border-radius: 68px 68px 0 0;
  z-index: 4;
}

.eyes {
  position: absolute;
  display: flex;
  transition: all 0.7s ease-in-out;
}

.eyeball {
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 0.15s ease;
  overflow: hidden;
}

.pupil {
  border-radius: 50%;
  background: #2d2d2d;
  transition: transform 0.1s ease-out;
}

.bare-pupil {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #2d2d2d;
  transition: transform 0.7s ease-in-out;
}

.yellow-mouth {
  position: absolute;
  width: 50px;
  height: 4px;
  background: #2d2d2d;
  border-radius: 2px;
  transition: all 0.7s ease-in-out;
}

.orange-mouth {
  position: absolute;
  width: 28px;
  height: 14px;
  border: 3px solid #2d2d2d;
  border-top: none;
  border-radius: 0 0 14px 14px;
  opacity: 0;
  transition: all 0.7s ease-in-out;
}

.orange-mouth.visible {
  opacity: 1;
}

@keyframes shakeHead {
  0%, 100% { translate: 0 0; }
  10% { translate: -9px 0; }
  20% { translate: 7px 0; }
  30% { translate: -6px 0; }
  40% { translate: 5px 0; }
  50% { translate: -4px 0; }
  60% { translate: 3px 0; }
  70% { translate: -2px 0; }
  80% { translate: 1px 0; }
  90% { translate: -0.5px 0; }
}

.eyes.shake-head,
.yellow-mouth.shake-head,
.orange-mouth.shake-head {
  animation: shakeHead 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
