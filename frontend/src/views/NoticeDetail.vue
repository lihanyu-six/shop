<template>
  <div class="notice-detail-container page-container">
    <van-nav-bar title="动态详情" left-arrow @click-left="onClickLeft" />
    
    <div class="notice-content" v-if="notice">
      <div class="notice-header">
        <h2>{{ notice.title }}</h2>
        <p class="notice-time">{{ formatDate(notice.created_at) }}</p>
      </div>
      
      <div class="notice-image-wrapper" v-if="notice.image">
        <img :src="notice.image" alt="" />
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
  background: #fff;
}

.notice-header {
  padding: 20px 15px 12px;
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: #323233;
    margin: 0 0 10px;
    line-height: 1.4;
  }
}

.notice-time {
  font-size: 13px;
  color: #969799;
  margin: 0;
}

.notice-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.notice-body {
  padding: 20px 15px;
  
  p {
    font-size: 15px;
    line-height: 1.8;
    color: #323233;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
  }
}
</style>
