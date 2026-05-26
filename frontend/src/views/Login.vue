<template>
  <div class="login-container">
    <div class="login-header">
      <h1>常检食堂小助手</h1>
      <p>欢迎登录，开启便捷用餐服务</p>
    </div>
    
    <div class="login-form">
      <van-form @submit="handleLogin">
        <div class="input-group">
          <input
            v-model="phone"
            class="login-input"
            placeholder="请输入手机号"
            type="tel"
            maxlength="11"
          />
        </div>
        
        <div class="input-group code-group">
          <input
            v-model="code"
            class="login-input code-input"
            placeholder="请输入验证码"
          />
          <button
            class="code-btn"
            :disabled="countdown > 0"
            @click="sendCode"
          >
            {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
          </button>
        </div>

        <div class="slider-container" ref="sliderContainer" :class="{ 'slider-disabled': !canSlider }">
          <div class="slider-track"></div>
          <div class="slider-progress" :style="{ width: sliderWidth + '%' }"></div>
          <div 
            class="slider-btn" 
            ref="sliderBtn"
            :style="{ left: sliderLeft + 'px' }"
            @touchstart="handleSliderStart"
            @touchmove="handleSliderMove"
            @touchend="handleSliderEnd"
          >
            <svg class="slider-icon" viewBox="0 0 24 24" fill="none">
              <path d="M9 19L4 14L9 9M15 19L20 14L15 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="slider-tip" v-if="!sliderVerified">拖动滑块验证</div>
          <div class="slider-success" v-else>
            <svg class="success-icon" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            验证成功
          </div>
        </div>

        <div class="login-button">
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="!sliderVerified"
          >
            立即登录
          </button>
        </div>
      </van-form>
      
      <div class="login-notice">
        <p>该应用暂不对外人员开放，如您是内部员工，请联系后台管理人员！</p>
      </div>
    </div>

    <div class="login-footer">
      <div class="privacy-agreement">
        <svg class="check-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#3F7EFF"/>
          <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>登录代表我已阅读并同意</span>
        <span class="link">《用户隐私协议》</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { sendCode as sendCodeApi } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

const phone = ref('')
const code = ref('')
const countdown = ref(0)
const loading = ref(false)

const sliderVerified = ref(false)
const sliderWidth = ref(0)
const sliderLeft = ref(0)
const sliderContainer = ref(null)
const sliderBtn = ref(null)
let isDragging = false
let startX = 0
let containerWidth = 0

// 计算属性：判断是否可以拖动滑块
const canSlider = computed(() => {
  return phone.value.length === 11 && code.value.length > 0
})

async function sendCode() {
  if (!phone.value || phone.value.length !== 11) {
    showToast('请输入正确的手机号')
    return
  }
  
  await sendCodeApi(phone.value)
  showToast('验证码已发送')
  
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

async function handleLogin() {
  if (!phone.value || phone.value.length !== 11) {
    showToast('请输入正确的手机号')
    return
  }
  
  if (!code.value) {
    showToast('请输入验证码')
    return
  }
  
  if (!sliderVerified.value) {
    showToast('请完成滑块验证')
    return
  }
  
  loading.value = true
  try {
    await userStore.login(phone.value, code.value)
    showToast('登录成功')
    router.push('/home')
  } finally {
    loading.value = false
  }
}

function handleSliderStart(e) {
  if (sliderVerified.value || !canSlider.value) return
  isDragging = true
  startX = e.touches[0].clientX
  containerWidth = sliderContainer.value.offsetWidth - sliderBtn.value.offsetWidth
}

function handleSliderMove(e) {
  if (!isDragging || sliderVerified.value || !canSlider.value) return
  const currentX = e.touches[0].clientX
  let moveX = currentX - startX
  
  if (moveX < 0) moveX = 0
  if (moveX > containerWidth) moveX = containerWidth
  
  sliderLeft.value = moveX
  sliderWidth.value = (moveX / containerWidth) * 100
}

function handleSliderEnd() {
  if (!isDragging || sliderVerified.value || !canSlider.value) return
  isDragging = false
  
  if (sliderWidth.value >= 90) {
    sliderVerified.value = true
    sliderLeft.value = containerWidth
    sliderWidth.value = 100
  } else {
    sliderLeft.value = 0
    sliderWidth.value = 0
  }
}
</script>

<style scoped lang="less">
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #d7e8ff 0%, #f5f5f5 30%, #f5f5f5 70%, #d7e8ff 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: left;
  padding: 40px 0 30px;
  
  h1 {
    font-size: 32px;
    font-weight: bold;
    color: #333;
    margin: 0 0 12px;
  }
  
  p {
    font-size: 16px;
    color: #666;
    margin: 0;
  }
}

.login-form {
  flex: 1;
}

.input-group {
  margin-bottom: 16px;
  
  &.code-group {
    display: flex;
    gap: 12px;
  }
}

.login-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  background: #fff;
  box-sizing: border-box;
  outline: none;
  
  &::placeholder {
    color: #999;
  }
  
  &:focus {
    border-color: #3f7eff;
  }
  
  &.code-input {
    flex: 1;
  }
}

.code-btn {
  height: 48px;
  padding: 0 16px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #3f7eff;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  
  &:disabled {
    color: #999;
  }
}

.slider-container {
  position: relative;
  width: 100%;
  height: 48px;
  margin-bottom: 24px;
  
  &.slider-disabled {
    .slider-track {
      background: #f0f0f0;
    }
    
    .slider-btn {
      background: #e0e0e0;
      cursor: not-allowed;
      box-shadow: none;
    }
    
    .slider-icon {
      color: #999;
    }
    
    .slider-tip {
      color: #999;
    }
  }
}

.slider-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #e8f0ff;
  border-radius: 12px;
}

.slider-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #3f7eff 0%, #5c93ff 100%);
  border-radius: 12px;
  transition: none;
}

.slider-btn {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 2;
  touch-action: none;
}

.slider-icon {
  width: 24px;
  height: 24px;
  color: #3f7eff;
}

.slider-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #666;
  font-size: 14px;
  z-index: 1;
}

.slider-success {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #3f7eff;
  font-size: 14px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

.success-icon {
  width: 18px;
  height: 18px;
  color: #3f7eff;
}

.login-button {
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 26px;
  background: linear-gradient(90deg, #3f7eff 0%, #2563eb 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.6;
  }
}

.login-notice {
  text-align: center;
  padding: 0 20px;
  
  p {
    font-size: 13px;
    color: #999;
    line-height: 1.6;
    margin: 0;
  }
}

.login-footer {
  margin-top: auto;
  padding-bottom: 40px;
}

.privacy-agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #666;
  gap: 6px;
}

.check-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.link {
  color: #3f7eff;
}
</style>
