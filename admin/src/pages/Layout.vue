<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <aside :class="['sidebar', { 'is-collapse': isCollapse }]">
      <!-- Logo 区域 -->
      <div class="logo-container">
        <h1 class="logo-title" v-show="!isCollapse">食堂订餐管理系统</h1>
        <h1 class="logo-title logo-title-short" v-show="isCollapse">食堂</h1>
      </div>

      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        :collapse-transition="true"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>首页/今日统计概览</template>
        </el-menu-item>

        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>人员管理</template>
        </el-menu-item>

        <el-menu-item index="/feedback">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>意见反馈</template>
        </el-menu-item>

        <el-menu-item index="/surveys">
          <el-icon><Document /></el-icon>
          <template #title>调查问卷</template>
        </el-menu-item>

        <el-sub-menu index="/reservations">
          <template #title>
            <el-icon><Calendar /></el-icon>
            <span>预约管理</span>
          </template>
          <el-menu-item index="/reservations">
            <el-icon><List /></el-icon>
            <template #title>预订订单</template>
          </el-menu-item>
          <el-menu-item index="/reservation-settings">
            <el-icon><Setting /></el-icon>
            <template #title>时段规则设置</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/dishes">
          <template #title>
            <el-icon><Food /></el-icon>
            <span>菜品管理</span>
          </template>
          <el-menu-item index="/dish-categories">
            <el-icon><FolderOpened /></el-icon>
            <template #title>菜品类别</template>
          </el-menu-item>
          <el-menu-item index="/dishes">
            <el-icon><Bowl /></el-icon>
            <template #title>菜品列表</template>
          </el-menu-item>
          <el-menu-item index="/dish-specs">
            <el-icon><Grid /></el-icon>
            <template #title>菜品规格</template>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/orders">
          <el-icon><Wallet /></el-icon>
          <template #title>消费记录</template>
        </el-menu-item>

        <el-menu-item index="/notices">
          <el-icon><Bell /></el-icon>
          <template #title>通知公告</template>
        </el-menu-item>
      </el-menu>

      <!-- 底部折叠按钮 -->
      <div class="collapse-btn-wrapper" @click="toggleSidebar">
        <el-icon class="collapse-icon" :class="{ 'is-rotate': isCollapse }">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <div class="main-container" :class="{ 'is-collapse': isCollapse }">
      <!-- 顶部导航栏 -->
      <header class="navbar">
        <div class="navbar-left">
          <!-- 面包屑导航 -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="navbar-right">
          <!-- 折叠侧边栏按钮 -->
          <el-tooltip content="折叠侧边栏" placement="bottom">
            <el-button text @click="toggleSidebar" class="navbar-btn">
              <el-icon :size="20"><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
            </el-button>
          </el-tooltip>

          <!-- 全屏按钮 -->
          <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom">
            <el-button text @click="toggleFullscreen" class="navbar-btn">
              <el-icon :size="20">
                <FullScreen v-if="!isFullscreen" />
                <ScaleToOriginal v-else />
              </el-icon>
            </el-button>
          </el-tooltip>

          <!-- 用户头像下拉菜单 -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">
                {{ userStore.userInfo?.username?.charAt(0)?.toUpperCase() || 'A' }}
              </el-avatar>
              <span class="username" v-show="!isCollapse">{{ userStore.userInfo?.username || '管理员' }}</span>
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Lock /></el-icon>
                  修改密码
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 主内容区 -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataAnalysis,
  User,
  ChatDotRound,
  Document,
  Calendar,
  List,
  Setting,
  Food,
  FolderOpened,
  Bowl,
  Grid,
  Wallet,
  Bell,
  Fold,
  Expand,
  FullScreen,
  ScaleToOriginal,
  ArrowDown,
  Lock,
  SwitchButton,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const isFullscreen = ref(false)

const activeMenu = computed(() => route.path)

const currentRoute = computed(() => route)

function toggleSidebar() {
  isCollapse.value = !isCollapse.value
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}

function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      ElMessage.info('个人信息功能开发中')
      break
    case 'password':
      ElMessage.info('修改密码功能开发中')
      break
    case 'logout':
      handleLogout()
      break
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    userStore.logout()
    router.push('/login')
    ElMessage.success('退出成功')
  } catch {
    // 用户取消
  }
}

function handleResize() {
  if (window.innerWidth < 992) {
    isCollapse.value = true
  } else {
    isCollapse.value = false
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)

  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 220px;
  height: 100%;
  background-color: #304156;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar.is-collapse {
  width: 64px;
}

/* Logo 区域 */
.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background-color: #263445;
  overflow: hidden;
}

.logo-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-title-short {
  font-size: 14px;
}

/* 侧边栏菜单 */
.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

/* 底部折叠按钮 */
.collapse-btn-wrapper {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #bfcbd9;
  transition: all 0.3s ease;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.collapse-btn-wrapper:hover {
  color: #409EFF;
  background-color: rgba(255, 255, 255, 0.05);
}

.collapse-icon {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.collapse-icon.is-rotate {
  transform: rotate(180deg);
}

/* 右侧内容区 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s ease;
  min-width: 0;
}

/* 顶部导航栏 */
.navbar {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  flex-shrink: 0;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar-btn {
  padding: 8px;
}

/* 用户信息区域 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  background-color: #409EFF;
  color: #fff;
  font-weight: 500;
}

.username {
  font-size: 14px;
  color: #333;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 12px;
  color: #999;
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f0f2f5;
  overflow-y: auto;
  overflow-x: auto;
}

/* 路由切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar,
.main-content::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sidebar-menu::-webkit-scrollbar-thumb,
.main-content::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover,
.main-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(144, 147, 153, 0.5);
}

/* 响应式调整 */
@media (max-width: 992px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1001;
    height: 100vh;
  }

  .sidebar.is-collapse {
    transform: translateX(-64px);
  }

  .main-container {
    margin-left: 0 !important;
  }

  .username {
    display: none;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 12px;
  }

  .main-content {
    padding: 12px;
  }
}
</style>
