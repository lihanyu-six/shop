<template>
  <div class="profile-container">
    <div class="header-bg">
      <van-nav-bar
        title="我的"
        left-arrow
        @click-left="$router.back()"
        :border="false"
        class="nav-bar"
      >
        <template #right>
          <van-icon name="ellipsis" size="20" color="#fff" />
          <van-icon name="eye-o" size="20" color="#fff" style="margin-left: 15px" />
        </template>
      </van-nav-bar>

      <div class="user-info-section">
        <div class="avatar-wrapper">
          <img
            v-if="userStore.userInfo?.avatar"
            :src="userStore.userInfo.avatar"
            class="avatar-img"
          />
          <div v-else class="avatar-placeholder">
            {{ (userStore.userInfo?.name || '用').charAt(0) }}
          </div>
        </div>
        <div class="user-text">
          <h3>{{ userStore.userInfo?.name || '用户' }}</h3>
          <p>{{ userStore.userInfo?.department || '研发部' }} 001号</p>
        </div>
      </div>
    </div>

    <div class="menu-list">
      <div class="menu-item" @click="$router.push('/consumption')">
        <div class="menu-left">
          <div class="icon-box">
            <van-icon name="bill-o" size="20" color="#1989fa" />
          </div>
          <span>消费记录</span>
        </div>
        <van-icon name="arrow" color="#c8c9cc" size="16" />
      </div>

      <div class="menu-item" @click="$router.push('/notifications')">
        <div class="menu-left">
          <div class="icon-box">
            <van-icon name="bell" size="20" color="#1989fa" />
          </div>
          <span>消息通知</span>
        </div>
        <van-icon name="arrow" color="#c8c9cc" size="16" />
      </div>
    </div>

    <van-tabbar v-model="activeTabBar" @change="onTabChange" class="custom-tabbar">
      <van-tabbar-item icon="home-o" @click="$router.push('/home')">首页</van-tabbar-item>
      <van-tabbar-item icon="user-circle-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const activeTabBar = ref(1)

function onTabChange(index) {
  if (index === 0) {
    router.push('/home')
  }
}
</script>

<style scoped lang="less">
.profile-container {
  min-height: 100vh;
  background: #f5f6f7;
  position: relative;
  padding-bottom: 60px;
}

.header-bg {
  background: linear-gradient(180deg, #3b7df7 0%, #4a8ae8 50%, #6aa4f8 100%);
  padding-bottom: 50px;
  position: relative;
  padding-top: 0;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.5;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%);
    background-size: 60px 60px;
    background-position: 0 0, 0 30px, 30px -30px, -30px 0px;
  }
}

.nav-bar {
  background: transparent !important;

  :deep(.van-nav-bar__title) {
    color: #fff;
    font-size: 17px;
    font-weight: 500;
  }

  :deep(.van-nav-bar__left .van-icon) {
    color: #fff;
    font-size: 20px;
  }

  :deep(.van-nav-bar__right) {
    display: flex;
    align-items: center;
  }
}

.user-info-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 25px 24px 35px;
  position: relative;
  z-index: 1;
}

.avatar-wrapper {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  overflow: hidden;
  border: 2.5px solid rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 28px;
  font-weight: 500;
}

.user-text {
  color: #fff;

  h3 {
    font-size: 20px;
    margin-bottom: 8px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  p {
    font-size: 14px;
    opacity: 0.95;
    letter-spacing: 0.3px;
  }
}

.menu-list {
  margin: -25px 18px 20px;
  position: relative;
  z-index: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:active {
    background: #f8f9fa;
    transform: scale(0.98);
  }
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 14px;

  .icon-box {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #e8f2ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  span {
    font-size: 16px;
    color: #333;
    font-weight: 400;
    letter-spacing: 0.3px;
  }
}

.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;

  :deep(.van-tabbar-item--active) {
    color: #1989fa;
  }
}
</style>
