<template>
  <div class="profile-container page-container">
    <van-nav-bar title="个人中心" />
    
    <div class="user-header">
      <div class="user-avatar">
        <van-icon name="user-circle-o" size="70" />
      </div>
      <div class="user-info">
        <h3>{{ userStore.userInfo?.name || '用户' }}</h3>
        <p>{{ userStore.userInfo?.phone || '' }}</p>
      </div>
    </div>
    
    <van-cell-group inset class="menu-group">
      <van-cell title="个人信息" is-link @click="openEdit" />
      <van-cell title="我的订单" is-link @click="$router.push('/orders')" />
      <van-cell title="意见反馈" is-link @click="$router.push('/feedback-list')" />
      <van-cell title="通知公告" is-link @click="$router.push('/notices')" />
      <van-cell title="调查问卷" is-link @click="$router.push('/surveys')" />
    </van-cell-group>
    
    <div class="logout-section">
      <van-button type="danger" block round plain @click="logout">退出登录</van-button>
    </div>
    
    <van-tabbar v-model="activeTabBar" @change="onTabChange">
      <van-tabbar-item icon="home-o" @click="$router.push('/home')">首页</van-tabbar-item>
      <van-tabbar-item icon="user-circle-o">我的</van-tabbar-item>
    </van-tabbar>
    
    <van-popup v-model:show="showEdit" position="bottom" round>
      <div class="edit-popup">
        <div class="popup-header">
          <h3>编辑个人信息</h3>
          <van-icon name="cross" @click="showEdit = false" />
        </div>
        <van-form @submit="saveProfile">
          <van-cell-group>
            <van-field
              v-model="editForm.name"
              label="姓名"
              placeholder="请输入姓名"
            />
            <van-field
              v-model="editForm.department"
              label="部门"
              placeholder="请输入部门"
            />
          </van-cell-group>
          <div class="popup-footer">
            <van-button type="primary" round block native-type="submit" :loading="saving">保存</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const activeTabBar = ref(1)
const showEdit = ref(false)
const saving = ref(false)
const editForm = reactive({
  name: '',
  department: ''
})

function onTabChange(index) {
  if (index === 0) {
    router.push('/home')
  }
}

function logout() {
  showConfirmDialog({
    title: '提示',
    message: '确定退出登录吗？'
  }).then(() => {
    userStore.logout()
    router.push('/login')
  }).catch(() => {})
}

function openEdit() {
  editForm.name = userStore.userInfo?.name || ''
  editForm.department = userStore.userInfo?.department || ''
  showEdit.value = true
}

async function saveProfile() {
  if (!editForm.name) {
    showToast('请输入姓名')
    return
  }
  
  saving.value = true
  try {
    await userStore.updateUserInfo(editForm)
    showToast('保存成功')
    showEdit.value = false
  } finally {
    saving.value = false
  }
}


</script>

<style scoped lang="less">
.user-header {
  background: #fff;
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.user-avatar {
  color: #1989fa;
}

.user-info {
  h3 {
    font-size: 18px;
    margin-bottom: 5px;
  }
  
  p {
    font-size: 14px;
    color: #969799;
  }
}

.menu-group {
  margin-bottom: 20px;
}

.logout-section {
  padding: 0 20px;
}

.edit-popup {
  padding: 20px;
  min-height: 50vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    font-size: 18px;
  }
}

.popup-footer {
  margin-top: 30px;
}
</style>
