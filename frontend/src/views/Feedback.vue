<template>
  <div class="feedback-container page-container">
    <van-nav-bar title="意见反馈" left-arrow @click-left="onClickLeft" />

    <div class="content-wrapper">
      <!-- 提交反馈区域 -->
      <div class="submit-section">
        <div class="section-title">提交反馈</div>
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
              rows="4"
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

          <van-button type="primary" round block @click="submitFeedback" :loading="submitting">提交反馈</van-button>
        </div>
      </div>

      <!-- 历史反馈区域 -->
      <div class="history-section">
        <div class="section-title">我的反馈</div>

        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <div class="feedback-list" v-if="feedbacks.length > 0">
            <div class="feedback-card" v-for="item in feedbacks" :key="item.id">
              <div class="feedback-header">
                <span class="feedback-type">{{ getTypeName(item.feedback_type) }}</span>
                <van-tag :type="item.reply_status === 1 ? 'success' : 'default'" size="medium">
                  {{ item.reply_status === 1 ? '已回复' : '待回复' }}
                </van-tag>
              </div>
              <div class="feedback-content">
                <p>{{ item.content }}</p>
              </div>
              <div class="feedback-images" v-if="item.images && item.images.length">
                <van-image
                  v-for="(img, idx) in item.images"
                  :key="idx"
                  :src="img"
                  width="60"
                  height="60"
                  fit="cover"
                  radius="4"
                  @click="previewImage(item.images, idx)"
                />
              </div>
              <div class="reply-section" v-if="item.reply_status === 1">
                <div class="reply-header">
                  <van-icon name="chat-o" size="14" color="#1989fa" />
                  <span class="reply-label">商家回复</span>
                </div>
                <p class="reply-content">{{ item.reply_content }}</p>
                <div class="reply-time" v-if="item.reply_time">{{ formatDate(item.reply_time) }}</div>
              </div>
              <div class="feedback-time">{{ formatDate(item.created_at) }}</div>
            </div>
          </div>
          <van-empty v-else description="暂无反馈记录" />
        </van-pull-refresh>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import { submitFeedback as submitFeedbackApi, getFeedbackList } from '@/api/feedback'

const router = useRouter()

const submitting = ref(false)
const refreshing = ref(false)
const fileList = ref([])
const feedbacks = ref([])
const form = reactive({
  feedbackType: '',
  content: '',
  images: []
})

const typeColumns = [
  { text: '口味反馈', value: 'taste' },
  { text: '服务反馈', value: 'service' },
  { text: '环境反馈', value: 'environment' }
]

const typeMap = {
  taste: '口味反馈',
  service: '服务反馈',
  environment: '环境反馈'
}

function getTypeName(type) {
  return typeMap[type] || type
}

function afterRead(file) {
  form.images.push(file.file)
}

async function loadFeedbacks() {
  try {
    const res = await getFeedbackList()
    feedbacks.value = res.feedbacks
  } catch (e) {
    console.error(e)
  }
}

async function onRefresh() {
  await loadFeedbacks()
  refreshing.value = false
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
    form.feedbackType = ''
    form.content = ''
    form.images = []
    fileList.value = []
    await loadFeedbacks()
  } finally {
    submitting.value = false
  }
}

function previewImage(images, startIndex) {
  showImagePreview({ images, startPosition: startIndex })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function onClickLeft() {
  router.back()
}

onMounted(() => {
  loadFeedbacks()
})
</script>

<style scoped lang="less">
.content-wrapper {
  padding: 0 15px 30px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  padding: 15px 0 10px;
}

.form-wrapper {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
}

.form-section {
  margin-bottom: 15px;

  &:last-of-type {
    margin-bottom: 15px;
  }
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 10px;
}

.type-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.type-tag {
  padding: 6px 14px;
  border: 1px solid #1989fa;
  border-radius: 18px;
  font-size: 13px;
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
    min-height: 80px;
  }
}

.upload-btn {
  width: 70px;
  height: 70px;
  background: #f7f8fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.feedback-list {
  // list container
}

.feedback-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.feedback-type {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
}

.feedback-content {
  margin-bottom: 10px;

  p {
    font-size: 14px;
    color: #323233;
    line-height: 1.6;
  }
}

.feedback-images {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.reply-section {
  background: #f0f7ff;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  border-left: 3px solid #1989fa;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
}

.reply-label {
  font-size: 13px;
  color: #1989fa;
  font-weight: 500;
}

.reply-content {
  font-size: 14px;
  color: #323233;
  line-height: 1.6;
}

.reply-time {
  font-size: 12px;
  color: #969799;
  text-align: right;
  margin-top: 6px;
}

.feedback-time {
  font-size: 12px;
  color: #969799;
  text-align: right;
}
</style>
