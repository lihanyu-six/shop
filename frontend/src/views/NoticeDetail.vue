<template>
  <div class="notice-detail-container page-container">
    <van-nav-bar title="公告详情" left-arrow @click-left="onClickLeft" />
    
    <div class="notice-content" v-if="notice">
      <div class="notice-header">
        <h2>{{ notice.title }}</h2>
        <div class="notice-meta">
          <van-tag :type="notice.type === '公告' ? 'primary' : 'default'">
            {{ notice.type || '通知' }}
          </van-tag>
          <span class="notice-time">{{ formatDate(notice.created_at) }}</span>
        </div>
      </div>
      <div class="notice-body">
        <p>{{ notice.content }}</p>
      </div>
    </div>
    
    <van-loading v-if="!notice" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getNoticeDetail } from '@/api/notices'

const route = useRoute()
const router = useRouter()

const notice = ref(null)

async function loadNotice() {
  try {
    const res = await getNoticeDetail(route.params.id)
    notice.value = res.notice
  } catch (e) {
    console.error(e)
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function onClickLeft() {
  router.back()
}

onMounted(() => {
  loadNotice()
})
</script>

<style scoped lang="less">
.notice-content {
  padding: 15px;
}

.notice-header {
  background: #fff;
  padding: 20px;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #ebedf0;
  
  h2 {
    font-size: 20px;
    margin-bottom: 15px;
  }
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notice-time {
  font-size: 13px;
  color: #969799;
}

.notice-body {
  background: #fff;
  padding: 20px;
  border-radius: 0 0 12px 12px;
  
  p {
    font-size: 15px;
    line-height: 1.8;
    color: #323233;
    white-space: pre-wrap;
  }
}
</style>
