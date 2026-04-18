<template>
  <div class="characters-scene" ref="scene">
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

<script>
export default {
  name: 'AnimatedCharacters',
  props: {
    focusedField: { type: String, default: null },
    passwordLength: { type: Number, default: 0 },
    isPasswordVisible: { type: Boolean, default: false },
    errorSignal: { type: Number, default: 0 }
  },
  data() {
    return {
      mouseX: 0,
      mouseY: 0,
      isLookingAtEachOther: false,
      isPurpleBlinking: false,
      isBlackBlinking: false,
      isPurplePeeking: false,
      isLoginError: false,
      typingTimer: null,
      peekTimer: null,
      purpleBlinkTimer: null,
      blackBlinkTimer: null,
      errorRecoverTimer: null,
      rafId: null
    }
  },
  computed: {
    isTypingField() {
      return this.focusedField === 'username' || this.focusedField === 'email' || this.focusedField === 'code'
    },
    isLookingAway() {
      return this.focusedField === 'password' && !this.isPasswordVisible
    },
    isShowingPwd() {
      return this.passwordLength > 0 && this.isPasswordVisible
    }
  },
  watch: {
    focusedField(newVal, oldVal) {
      const wasTyping = oldVal === 'username' || oldVal === 'email' || oldVal === 'code'
      const isTypingNow = this.isTypingField
      if (isTypingNow && !wasTyping) {
        this.setTyping(true)
      } else if (!isTypingNow && wasTyping) {
        this.setTyping(false)
      } else {
        this.updateCharacters()
      }
    },
    passwordLength() {
      this.updateCharacters()
    },
    isPasswordVisible() {
      this.updateCharacters()
    },
    isShowingPwd(val) {
      if (val) this.schedulePeek()
    },
    errorSignal(val) {
      if (val > 0) this.triggerLoginError()
    }
  },
  mounted() {
    this.onMouseMove = (e) => {
      this.mouseX = e.clientX
      this.mouseY = e.clientY
      if (!this.isTypingField && !this.isLoginError) this.updateCharacters()
    }
    document.addEventListener('mousemove', this.onMouseMove)
    this.scheduleBlinkPurple()
    this.scheduleBlinkBlack()
    this.$nextTick(() => this.updateCharacters())
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.onMouseMove)
    clearTimeout(this.typingTimer)
    clearTimeout(this.peekTimer)
    clearTimeout(this.purpleBlinkTimer)
    clearTimeout(this.blackBlinkTimer)
    clearTimeout(this.errorRecoverTimer)
  },
  methods: {
    setTyping(typing) {
      if (typing) {
        this.isLookingAtEachOther = true
        clearTimeout(this.typingTimer)
        this.typingTimer = setTimeout(() => {
          this.isLookingAtEachOther = false
          this.updateCharacters()
        }, 800)
      } else {
        this.isLookingAtEachOther = false
        clearTimeout(this.typingTimer)
      }
      this.updateCharacters()
    },
    scheduleBlinkPurple() {
      this.purpleBlinkTimer = setTimeout(() => {
        this.isPurpleBlinking = true
        this.updateCharacters()
        this.purpleBlinkTimer = setTimeout(() => {
          this.isPurpleBlinking = false
          this.updateCharacters()
          this.scheduleBlinkPurple()
        }, 150)
      }, Math.random() * 4000 + 3000)
    },
    scheduleBlinkBlack() {
      this.blackBlinkTimer = setTimeout(() => {
        this.isBlackBlinking = true
        this.updateCharacters()
        this.blackBlinkTimer = setTimeout(() => {
          this.isBlackBlinking = false
          this.updateCharacters()
          this.scheduleBlinkBlack()
        }, 150)
      }, Math.random() * 4000 + 3000)
    },
    schedulePeek() {
      clearTimeout(this.peekTimer)
      if (!this.isShowingPwd) return
      this.peekTimer = setTimeout(() => {
        if (!this.isShowingPwd) return
        this.isPurplePeeking = true
        this.updateCharacters()
        this.peekTimer = setTimeout(() => {
          this.isPurplePeeking = false
          this.updateCharacters()
          this.schedulePeek()
        }, 800)
      }, Math.random() * 3000 + 2000)
    },
    calcPosition(el) {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 3
      const dx = this.mouseX - cx
      const dy = this.mouseY - cy
      const faceX = Math.max(-15, Math.min(15, dx / 20))
      const faceY = Math.max(-10, Math.min(10, dy / 30))
      const bodySkew = Math.max(-6, Math.min(6, -dx / 120))
      return { faceX, faceY, bodySkew }
    },
    calcPupilOffset(el, maxDist) {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = this.mouseX - cx
      const dy = this.mouseY - cy
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist)
      const angle = Math.atan2(dy, dx)
      return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
    },
    updateCharacters() {
      const r = this.$refs
      if (!r.charPurple) return

      const purplePos = this.calcPosition(r.charPurple)
      const blackPos = this.calcPosition(r.charBlack)
      const orangePos = this.calcPosition(r.charOrange)
      const yellowPos = this.calcPosition(r.charYellow)

      const isShowingPwd = this.isShowingPwd
      const isLookingAway = this.isLookingAway
      const isTyping = this.isTypingField
      const isLoginError = this.isLoginError
      const isLookingAtEachOther = this.isLookingAtEachOther

      // ---- Purple body ----
      if (isShowingPwd) {
        r.charPurple.style.transform = 'skewX(0deg)'
        r.charPurple.style.height = '370px'
      } else if (isLookingAway) {
        r.charPurple.style.transform = 'skewX(-14deg) translateX(-20px)'
        r.charPurple.style.height = '410px'
      } else if (isTyping) {
        r.charPurple.style.transform = `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
        r.charPurple.style.height = '410px'
      } else {
        r.charPurple.style.transform = `skewX(${purplePos.bodySkew}deg)`
        r.charPurple.style.height = '370px'
      }

      // Purple eyes
      r.purpleEyeL.style.height = this.isPurpleBlinking ? '2px' : '18px'
      r.purpleEyeR.style.height = this.isPurpleBlinking ? '2px' : '18px'

      if (isLoginError) {
        r.purpleEyes.style.left = '30px'
        r.purpleEyes.style.top = '55px'
        r.purplePupilL.style.transform = 'translate(-3px, 4px)'
        r.purplePupilR.style.transform = 'translate(-3px, 4px)'
      } else if (isLookingAway) {
        r.purpleEyes.style.left = '20px'
        r.purpleEyes.style.top = '25px'
        r.purplePupilL.style.transform = 'translate(-5px, -5px)'
        r.purplePupilR.style.transform = 'translate(-5px, -5px)'
      } else if (isShowingPwd) {
        r.purpleEyes.style.left = '20px'
        r.purpleEyes.style.top = '35px'
        const px = this.isPurplePeeking ? 4 : -4
        const py = this.isPurplePeeking ? 5 : -4
        r.purplePupilL.style.transform = `translate(${px}px, ${py}px)`
        r.purplePupilR.style.transform = `translate(${px}px, ${py}px)`
      } else if (isLookingAtEachOther) {
        r.purpleEyes.style.left = '55px'
        r.purpleEyes.style.top = '65px'
        r.purplePupilL.style.transform = 'translate(3px, 4px)'
        r.purplePupilR.style.transform = 'translate(3px, 4px)'
      } else {
        r.purpleEyes.style.left = 45 + purplePos.faceX + 'px'
        r.purpleEyes.style.top = 40 + purplePos.faceY + 'px'
        const po = this.calcPupilOffset(r.purpleEyeL, 5)
        r.purplePupilL.style.transform = `translate(${po.x}px, ${po.y}px)`
        r.purplePupilR.style.transform = `translate(${po.x}px, ${po.y}px)`
      }

      // ---- Black body ----
      if (isShowingPwd) {
        r.charBlack.style.transform = 'skewX(0deg)'
      } else if (isLookingAway) {
        r.charBlack.style.transform = 'skewX(12deg) translateX(-10px)'
      } else if (isLookingAtEachOther) {
        r.charBlack.style.transform = `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
      } else if (isTyping) {
        r.charBlack.style.transform = `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
      } else {
        r.charBlack.style.transform = `skewX(${blackPos.bodySkew}deg)`
      }

      // Black eyes
      r.blackEyeL.style.height = this.isBlackBlinking ? '2px' : '16px'
      r.blackEyeR.style.height = this.isBlackBlinking ? '2px' : '16px'

      if (isLoginError) {
        r.blackEyes.style.left = '15px'
        r.blackEyes.style.top = '40px'
        r.blackPupilL.style.transform = 'translate(-3px, 4px)'
        r.blackPupilR.style.transform = 'translate(-3px, 4px)'
      } else if (isLookingAway) {
        r.blackEyes.style.left = '10px'
        r.blackEyes.style.top = '20px'
        r.blackPupilL.style.transform = 'translate(-4px, -5px)'
        r.blackPupilR.style.transform = 'translate(-4px, -5px)'
      } else if (isShowingPwd) {
        r.blackEyes.style.left = '10px'
        r.blackEyes.style.top = '28px'
        r.blackPupilL.style.transform = 'translate(-4px, -4px)'
        r.blackPupilR.style.transform = 'translate(-4px, -4px)'
      } else if (isLookingAtEachOther) {
        r.blackEyes.style.left = '32px'
        r.blackEyes.style.top = '12px'
        r.blackPupilL.style.transform = 'translate(0px, -4px)'
        r.blackPupilR.style.transform = 'translate(0px, -4px)'
      } else {
        r.blackEyes.style.left = 26 + blackPos.faceX + 'px'
        r.blackEyes.style.top = 32 + blackPos.faceY + 'px'
        const bo = this.calcPupilOffset(r.blackEyeL, 4)
        r.blackPupilL.style.transform = `translate(${bo.x}px, ${bo.y}px)`
        r.blackPupilR.style.transform = `translate(${bo.x}px, ${bo.y}px)`
      }

      // ---- Orange body ----
      if (isLoginError) {
        r.orangeMouth.style.left = 80 + orangePos.faceX + 'px'
        r.orangeMouth.style.top = '130px'
      }
      if (isShowingPwd) {
        r.charOrange.style.transform = 'skewX(0deg)'
      } else {
        r.charOrange.style.transform = `skewX(${orangePos.bodySkew}deg)`
      }

      if (isLoginError) {
        r.orangeEyes.style.left = '60px'
        r.orangeEyes.style.top = '95px'
        r.orangePupilL.style.transform = 'translate(-3px, 4px)'
        r.orangePupilR.style.transform = 'translate(-3px, 4px)'
      } else if (isLookingAway) {
        r.orangeEyes.style.left = '50px'
        r.orangeEyes.style.top = '75px'
        r.orangePupilL.style.transform = 'translate(-5px, -5px)'
        r.orangePupilR.style.transform = 'translate(-5px, -5px)'
      } else if (isShowingPwd) {
        r.orangeEyes.style.left = '50px'
        r.orangeEyes.style.top = '85px'
        r.orangePupilL.style.transform = 'translate(-5px, -4px)'
        r.orangePupilR.style.transform = 'translate(-5px, -4px)'
      } else {
        r.orangeEyes.style.left = 82 + orangePos.faceX + 'px'
        r.orangeEyes.style.top = 90 + orangePos.faceY + 'px'
        const oo = this.calcPupilOffset(r.orangePupilL, 5)
        r.orangePupilL.style.transform = `translate(${oo.x}px, ${oo.y}px)`
        r.orangePupilR.style.transform = `translate(${oo.x}px, ${oo.y}px)`
      }

      // ---- Yellow body ----
      if (isShowingPwd) {
        r.charYellow.style.transform = 'skewX(0deg)'
      } else {
        r.charYellow.style.transform = `skewX(${yellowPos.bodySkew}deg)`
      }

      if (isLoginError) {
        r.yellowEyes.style.left = '35px'
        r.yellowEyes.style.top = '45px'
        r.yellowPupilL.style.transform = 'translate(-3px, 4px)'
        r.yellowPupilR.style.transform = 'translate(-3px, 4px)'
        r.yellowMouth.style.left = '30px'
        r.yellowMouth.style.top = '92px'
        r.yellowMouth.style.transform = 'rotate(-8deg)'
      } else if (isLookingAway) {
        r.yellowEyes.style.left = '20px'
        r.yellowEyes.style.top = '30px'
        r.yellowPupilL.style.transform = 'translate(-5px, -5px)'
        r.yellowPupilR.style.transform = 'translate(-5px, -5px)'
        r.yellowMouth.style.left = '15px'
        r.yellowMouth.style.top = '78px'
        r.yellowMouth.style.transform = 'rotate(0deg)'
      } else if (isShowingPwd) {
        r.yellowEyes.style.left = '20px'
        r.yellowEyes.style.top = '35px'
        r.yellowPupilL.style.transform = 'translate(-5px, -4px)'
        r.yellowPupilR.style.transform = 'translate(-5px, -4px)'
        r.yellowMouth.style.left = '10px'
        r.yellowMouth.style.top = '88px'
        r.yellowMouth.style.transform = 'rotate(0deg)'
      } else {
        r.yellowEyes.style.left = 52 + yellowPos.faceX + 'px'
        r.yellowEyes.style.top = 40 + yellowPos.faceY + 'px'
        const yo = this.calcPupilOffset(r.yellowPupilL, 5)
        r.yellowPupilL.style.transform = `translate(${yo.x}px, ${yo.y}px)`
        r.yellowPupilR.style.transform = `translate(${yo.x}px, ${yo.y}px)`
        r.yellowMouth.style.left = 40 + yellowPos.faceX + 'px'
        r.yellowMouth.style.top = 88 + yellowPos.faceY + 'px'
        r.yellowMouth.style.transform = 'rotate(0deg)'
      }
    },
    triggerLoginError() {
      clearTimeout(this.errorRecoverTimer)
      this.errorRecoverTimer = null

      const r = this.$refs
      const shakeEls = [r.purpleEyes, r.blackEyes, r.orangeEyes, r.yellowEyes, r.yellowMouth, r.orangeMouth]
      shakeEls.forEach(el => el && el.classList.remove('shake-head'))
      void document.body.offsetHeight

      this.isLoginError = true
      this.updateCharacters()

      r.orangeMouth && r.orangeMouth.classList.add('visible')

      setTimeout(() => {
        shakeEls.forEach(el => el && el.classList.add('shake-head'))
      }, 350)

      this.errorRecoverTimer = setTimeout(() => {
        this.isLoginError = false
        this.errorRecoverTimer = null
        r.orangeMouth && r.orangeMouth.classList.remove('visible')
        shakeEls.forEach(el => el && el.classList.remove('shake-head'))
        this.updateCharacters()
      }, 2500)
    }
  }
}
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
