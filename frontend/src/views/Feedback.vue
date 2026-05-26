<template>
  <div class="feedback-container page-container">
    <van-nav-bar title="意见反馈" left-arrow @click-left="onClickLeft" />
    
    <div class="form-wrapper">
      <div class="form-section">
        <div class="section-label">反馈类型</div>
        <div class="type-tags">
          <div 
            class="type-tag" 
            :class="{ active: form.feedbackType === item.value }"
            v-for="item in typeColumns" 
            :key="item.value"
            @click="form.feedbackType = item.value"
          >
            {{ item.text }}
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <div class="section-label">反馈内容</div>
        <van-field
          v-model="form.content"
          type="textarea"
          placeholder="请输入反馈内容"
          rows="6"
          :show-word-limit="true"
          maxlength="500"
          class="content-field"
        />
      </div>
      
      <div class="form-section">
        <van-uploader 
          v-model="fileList" 
          multiple 
          :max-count="3"
          :after-read="afterRead"
          :preview-size="[80, 80]"
        >
          <div class="upload-btn">
            <van-icon name="plus" size="24" color="#969799" />
          </div>
        </van-uploader>
      </div>
      
      <div class="form-section anonymous-section" @click="toggleAnonymous">
        <span>是否匿名</span>
        <van-switch v-model="form.isAnonymous" size="22" />
      </div>
    </div>
    
    <div class="submit-section">
      <van-button type="primary" round block @click="submitFeedback" :loading="submitting">提交</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { submitFeedback as submitFeedbackApi } from '@/api/feedback'

const router = useRouter()

const submitting = ref(false)
const fileList = ref([])
const form = reactive({
  feedbackType: '',
  content: '',
  isAnonymous: false,
  images: []
})

const typeColumns = [
  { text: '反馈类型', value: 'taste' },
  { text: '反馈类型', value: 'service' },
  { text: '反馈类型', value: 'environment' }
]

function afterRead(file) {
  form.images.push(file.file)
}

function toggleAnonymous() {
  form.isAnonymous = !form.isAnonymous
}

async function submitFeedback() {
  if (!form.feedbackType) {
    showToast('请选择反馈类型')
    return
  }
  if (!form.content.trim()) {
    showToast('请输入反馈内容')
    return
  }
  
  submitting.value = true
  try {
    await submitFeedbackApi(form)
    showToast('提交成功')
    router.back()
  } finally {
    submitting.value = false
  }
}

function onClickLeft() {
  router.back()
}
</script>

<style scoped lang="less">
.form-wrapper {
  padding: 15px;
}

.form-section {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
}

.section-label {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 12px;
}

.type-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.type-tag {
  padding: 8px 16px;
  border: 1px solid #1989fa;
  border-radius: 18px;
  font-size: 14px;
  color: #1989fa;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
  
  &.active {
    background: #1989fa;
    color: #fff;
  }
}

.content-field {
  :deep(.van-field__control) {
    min-height: 120px;
  }
}

.upload-btn {
  width: 80px;
  height: 80px;
  background: #f7f8fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.anonymous-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  color: #323233;
  cursor: pointer;
  
  &:active {
    opacity: 0.7;
  }
}

.submit-section {
  padding: 0 15px 30px;
}
</style>
