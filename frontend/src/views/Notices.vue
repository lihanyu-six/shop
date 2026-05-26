<template>
  <div class="notices-container page-container">
    <van-nav-bar title="通知公告" left-arrow @click-left="onClickLeft" />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="notice-list" v-if="notices.length > 0">
        <div class="notice-card" v-for="item in notices" :key="item.id" @click="goToNotice(item.id)">
          <div class="notice-header">
            <h4>{{ item.title }}</h4>
            <van-tag size="small" :type="item.type === '公告' ? 'primary' : 'default'">
              {{ item.type || '通知' }}
            </van-tag>
          </div>
          <p class="notice-preview">{{ item.content.substring(0, 50) }}...</p>
          <div class="notice-time">{{ formatDate(item.created_at) }}</div>
        </div>
      </div>
      <van-empty v-else description="暂无通知公告" />
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNotices } from '@/api/notices'

const router = useRouter()

const refreshing = ref(false)
const notices = ref([])

async function loadNotices() {
  try {
    const res = await getNotices()
    notices.value = res.notices
  } catch (e) {
    console.error(e)
  }
}

async function onRefresh() {
  await loadNotices()
  refreshing.value = false
}

function goToNotice(id) {
  router.push(`/notice/${id}`)
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function onClickLeft() {
  router.back()
}

onMounted(() => {
  loadNotices()
})
</script>

<style scoped lang="less">
.notice-list {
  padding: 10px;
}

.notice-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  h4 {
    font-size: 16px;
    margin: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.notice-preview {
  font-size: 14px;
  color: #969799;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-time {
  font-size: 12px;
  color: #969799;
}
</style>
