<template>
  <div class="feedback-list-container page-container">
    <van-nav-bar title="反馈记录" left-arrow @click-left="onClickLeft" />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="feedback-list" v-if="feedbacks.length > 0">
        <div class="feedback-card" v-for="item in feedbacks" :key="item.id">
          <div class="feedback-header">
            <span class="feedback-type">{{ item.feedbackType }}</span>
            <van-tag :type="item.replyStatus === 1 ? 'success' : 'default'">
              {{ item.replyStatus === 1 ? '已回复' : '待回复' }}
            </van-tag>
          </div>
          <div class="feedback-content">
            <p>{{ item.content }}</p>
          </div>
          <div class="reply-section" v-if="item.replyStatus === 1">
            <div class="reply-label">管理员回复：</div>
            <p class="reply-content">{{ item.replyContent }}</p>
          </div>
          <div class="feedback-time">{{ formatDate(item.created_at) }}</div>
        </div>
      </div>
      <van-empty v-else description="暂无反馈记录" />
    </van-pull-refresh>
    
    <div class="add-fab" @click="router.push('/feedback')">
      <van-icon name="plus" size="24" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFeedbackList } from '@/api/feedback'

const router = useRouter()

const refreshing = ref(false)
const feedbacks = ref([])

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

function formatDate(dateStr) {
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
.feedback-list {
  padding: 10px;
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
  font-weight: bold;
}

.feedback-content {
  margin-bottom: 10px;
  
  p {
    font-size: 14px;
    color: #323233;
  }
}

.reply-section {
  background: #f7f8fa;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.reply-label {
  font-size: 13px;
  color: #1989fa;
  margin-bottom: 5px;
}

.reply-content {
  font-size: 14px;
  color: #323233;
}

.feedback-time {
  font-size: 12px;
  color: #969799;
  text-align: right;
}

.add-fab {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 50px;
  height: 50px;
  background: #1989fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4);
}
</style>
