<template>
  <div class="notifications-container">
    <van-nav-bar
      title="消息通知"
      left-arrow
      @click-left="$router.back()"
      :border="false"
    />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="notification-list">
        <!-- New notices from backend, pinned at top -->
        <div
          v-for="item in notifications"
          :key="item.id"
          class="notification-item"
          :class="{ 'new-notice': item.is_new }"
          @click="viewDetail(item)"
        >
          <div class="icon-wrapper" :class="{ 'new-icon': item.is_new }">
            <van-icon :name="item.is_new ? 'volume-o' : 'info-o'" :size="22" :color="item.is_new ? '#ee0a24' : '#1989fa'" />
          </div>
          <div class="content-wrapper">
            <h4>
              <van-tag v-if="item.is_new" type="danger" size="small" style="margin-right: 6px">NEW</van-tag>
              {{ item.title }}
            </h4>
            <p class="message">{{ item.content }}</p>
            <p class="time">{{ item.time }}</p>
          </div>
        </div>

        <van-empty
          v-if="notifications.length === 0"
          description="暂无消息"
        />
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNotices } from '@/api/notices'

const router = useRouter()

const refreshing = ref(false)
const notifications = ref([])

async function loadNotifications() {
  try {
    const res = await getNotices()
    const noticeList = res.notices || []
    
    // Sort by created_at descending, newest first (pinned at top)
    const sorted = [...noticeList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
    notifications.value = sorted.map((item, index) => {
      const date = new Date(item.created_at)
      const now = new Date()
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
      
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        time: formatTime(date),
        is_new: diffDays <= 3 // Messages within 3 days are marked as new
      }
    })
  } catch (e) {
    console.error('加载消息通知失败:', e)
  }
}

async function onRefresh() {
  await loadNotifications()
  refreshing.value = false
}

function formatTime(date) {
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return `今天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } else if (diffDays === 1) {
    return `昨天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
}

function viewDetail(item) {
  router.push(`/notice/${item.id}`)
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped lang="less">
.notifications-container {
  min-height: 100vh;
  background: #f5f6f7;
}

.notification-list {
  padding: 12px 16px;
}

.notification-item {
  background: #fff;
  border-radius: 12px;
  padding: 18px 16px;
  margin-bottom: 12px;
  display: flex;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &:active {
    transform: scale(0.98);
    background: #fafafa;
  }

  &:last-child {
    margin-bottom: 0;
  }

  &.new-notice {
    background: #fff8f0;
    border: 1px solid #ffe4cc;
    box-shadow: 0 2px 8px rgba(238, 10, 36, 0.08);
  }
}

.icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #e8f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &.new-icon {
    background: #fff0f0;
  }
}

.content-wrapper {
  flex: 1;
  min-width: 0;

  h4 {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
  }

  .message {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
    margin: 0 0 10px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .time {
    font-size: 13px;
    color: #999;
    margin: 0;
  }
}
</style>
