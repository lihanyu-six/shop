<template>
  <div class="feedback-container page-container">
    <van-nav-bar title="意见反馈" left-arrow @click-left="onClickLeft" />
    
    <van-form @submit="submitFeedback">
      <van-cell-group inset>
        <van-field
          v-model="form.feedbackType"
          name="feedbackType"
          label="反馈类型"
          placeholder="请选择反馈类型"
          readonly
          is-link
          @click="showTypePicker = true"
          :rules="[{ required: true, message: '请选择反馈类型' }]"
        />
        <van-field
          v-model="form.content"
          name="content"
          type="textarea"
          label="反馈内容"
          placeholder="请输入反馈内容"
          rows="6"
          :rules="[{ required: true, message: '请输入反馈内容' }]"
        />
      </van-cell-group>
      
      <div class="submit-section">
        <van-button type="primary" round block native-type="submit" :loading="submitting">提交反馈</van-button>
      </div>
    </van-form>
    
    <div class="history-link" @click="router.push('/feedback-list')">
      <van-icon name="clock-o" />
      <span>查看历史反馈</span>
      <van-icon name="arrow" />
    </div>
    
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { submitFeedback as submitFeedbackApi } from '@/api/feedback'

const router = useRouter()

const submitting = ref(false)
const showTypePicker = ref(false)
const form = reactive({
  feedbackType: '',
  content: ''
})

const typeColumns = [
  { text: '菜品口味', value: 'taste' },
  { text: '服务态度', value: 'service' },
  { text: '环境卫生', value: 'environment' },
  { text: '其他问题', value: 'other' }
]

function onTypeConfirm({ selectedOptions }) {
  form.feedbackType = selectedOptions[0].text
  showTypePicker.value = false
}

async function submitFeedback() {
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
.submit-section {
  padding: 20px;
}

.history-link {
  background: #fff;
  padding: 15px;
  margin: 0 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #323233;
}
</style>
