<template>
  <div class="notices-container page-container">
    <van-nav-bar title="食堂动态" left-arrow @click-left="onClickLeft" />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="notice-list" v-if="notices.length > 0">
        <div class="notice-card" v-for="item in notices" :key="item.id" @click="goToNotice(item.id)">
          <div class="notice-image" v-if="item.image">
            <img :src="item.image" alt="" />
          </div>
          <div class="notice-info" :class="{ 'full-width': !item.image }">
            <h4 class="notice-title">{{ item.title }}</h4>
            <p class="notice-date">{{ formatDate(item.created_at) }}</p>
          </div>
        </div>
      </div>
      <van-empty v-else description="暂无动态信息" />
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
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
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
  padding: 15px;
}

.notice-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  
  &:active {
    opacity: 0.8;
  }
}

.notice-image {
  flex-shrink: 0;
  width: 100px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.notice-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  
  &.full-width {
    .notice-title {
      display: block;
      -webkit-line-clamp: unset;
    }
  }
}

.notice-title {
  font-size: 15px;
  color: #323233;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-date {
  font-size: 13px;
  color: #969799;
  margin: 0;
}
</style>
