<template>
  <div class="home-container page-container">
    <div class="home-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="header-title">首页</div>
      </div>
    </div>
    
    <div class="home-content">
      <div class="banner-section">
        <div class="banner">
          <div class="banner-content">
            <h2>智慧食堂欢迎您</h2>
            <p>开启智慧食堂数字化升级</p>
            <div class="banner-btn">
              <span>开启智慧食堂数字化升级</span>
            </div>
          </div>
          <div class="banner-image">
            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop" alt="智慧食堂" />
          </div>
        </div>
      </div>
      
      <div class="quick-menu">
        <div class="menu-item" @click="$router.push('/menu')">
          <div class="menu-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <van-icon name="shopping-cart-o" size="28" color="#fff" />
          </div>
          <span>快速订餐</span>
        </div>
        <div class="menu-item" @click="$router.push('/orders')">
          <div class="menu-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <van-icon name="orders-o" size="28" color="#fff" />
          </div>
          <span>预定记录</span>
        </div>
        <div class="menu-item" @click="$router.push('/feedback')">
          <div class="menu-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <van-icon name="chat-o" size="28" color="#fff" />
          </div>
          <span>意见反馈</span>
        </div>
        <div class="menu-item" @click="$router.push('/surveys')">
          <div class="menu-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            <van-icon name="question-o" size="28" color="#fff" />
          </div>
          <span>问卷调查</span>
        </div>
      </div>
      
      <div class="daily-menu-section">
        <div class="section-header" @click="$router.push('/menu')">
          <h3>每日菜谱</h3>
          <van-icon name="arrow" />
        </div>
        <div class="menu-card">
          <div class="menu-info">
            <p>查看每日菜品</p>
          </div>
          <div class="menu-preview">
            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=120&fit=crop" alt="菜品" />
          </div>
        </div>
      </div>
      
      <div class="notice-section">
        <div class="section-header">
          <h3>食堂动态</h3>
          <span class="more-link" @click="$router.push('/notices')">更多公告</span>
        </div>
        <div class="notice-list">
          <div class="notice-item" v-for="(notice, index) in notices.slice(0, 3)" :key="notice?.id || index" @click="viewNotice(notice)">
            <div class="notice-img">
              <img :src="notice?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=140&fit=crop'" alt="公告" />
            </div>
            <div class="notice-text">
              <h4>{{ notice?.title || '食堂上新公告公示' }}</h4>
              <span class="notice-date">{{ notice?.created_at || '2026年1月21日' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <van-tabbar v-model="activeTab" @change="onTabChange">
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="user-circle-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNotices } from '@/api/notices'

const router = useRouter()

const activeTab = ref(0)
const notices = ref([])

async function loadData() {
  try {
    const noticeRes = await getNotices()
    notices.value = noticeRes.notices || []
  } catch (e) {
    console.error(e)
  }
}

function viewNotice(notice) {
  if (notice?.id) {
    router.push(`/notices/${notice.id}`)
  }
}

function onTabChange(index) {
  if (index === 1) {
    router.push('/profile')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.home-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 50px;
}

.home-header {
  position: relative;
  padding: 20px 16px 0;
  z-index: 10;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.1;
  border-radius: 0 0 30px 30px;
  background-image: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  padding-bottom: 15px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
}

.header-actions {
  display: flex;
  gap: 15px;
  color: #646566;
}

.home-content {
  padding: 0 16px 20px;
}

.banner-section {
  margin-bottom: 20px;
}

.banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  position: relative;
}

.banner-content {
  z-index: 1;
  
  h2 {
    font-size: 22px;
    font-weight: bold;
    color: #fff;
    margin: 0 0 8px;
  }
  
  p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 12px;
  }
}

.banner-btn {
  display: inline-block;
  background: rgba(255, 255, 255, 0.25);
  padding: 6px 16px;
  border-radius: 20px;
  color: #fff;
  font-size: 12px;
  backdrop-filter: blur(4px);
}

.banner-image {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  z-index: 1;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.quick-menu {
  background: #fff;
  border-radius: 16px;
  padding: 20px 10px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #323233;
}

.menu-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.daily-menu-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  h3 {
    font-size: 17px;
    font-weight: 600;
    color: #323233;
    margin: 0;
  }
}

.menu-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-info {
  p {
    font-size: 14px;
    color: #969799;
    margin: 0;
  }
}

.menu-preview {
  width: 100px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.notice-section {
  margin-bottom: 20px;
}

.more-link {
  font-size: 13px;
  color: #969799;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  gap: 12px;
}

.notice-img {
  width: 100px;
  height: 70px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.notice-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  h4 {
    font-size: 14px;
    color: #323233;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .notice-date {
    font-size: 12px;
    color: #969799;
  }
}
</style>
