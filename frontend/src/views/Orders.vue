<template>
  <div class="orders-container page-container">
    <van-nav-bar title="我的订单" />
    
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="全部" name="" />
      <van-tab title="待取餐" name="pending" />
      <van-tab title="已完成" name="confirmed" />
      <van-tab title="已取消" name="cancelled" />
    </van-tabs>
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="order-list" v-if="orders.length > 0">
        <div class="order-card" v-for="order in orders" :key="order.id" @click="$router.push(`/order-detail/${order.id}`)">
          <div class="order-header">
            <span class="order-no">{{ order.order_no }}</span>
            <van-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</van-tag>
          </div>
          <div class="order-info">
            <p><span>餐次：</span>{{ getMealTypeText(order.meal_type) }}</p>
            <p><span>用餐日期：</span>{{ order.order_date }}</p>
            <p><span>下单时间：</span>{{ formatDate(order.created_at) }}</p>
          </div>
          <div class="order-items" v-if="order.items && order.items.length > 0">
            <div class="item-row" v-for="item in order.items" :key="item.id">
              <span class="item-name">{{ item.dish_name }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
            </div>
          </div>
          <div class="order-footer">
            <span class="total-price">合计：¥{{ order.total_amount.toFixed(2) }}</span>
            <div class="order-actions" v-if="order.status === 'confirmed'">
              <van-button size="small" type="danger" plain @click.stop="cancelOrder(order.id)">取消订单</van-button>
            </div>
          </div>
        </div>
      </div>
      <van-empty v-else description="暂无订单" />
    </van-pull-refresh>
    
    <van-tabbar v-model="activeTabBar" @change="onTabChange">
      <van-tabbar-item icon="home-o" @click="$router.push('/home')">首页</van-tabbar-item>
      <van-tabbar-item icon="user-circle-o" @click="$router.push('/profile')">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getOrders, cancelOrder as cancelOrderApi } from '@/api/orders'

const router = useRouter()

const activeTab = ref('')
const activeTabBar = ref(0)
const refreshing = ref(false)
const orders = ref([])

watch(activeTab, () => {
  loadOrders()
})

async function loadOrders() {
  try {
    const res = await getOrders({ status: activeTab.value })
    orders.value = res.orders
  } catch (e) {
    console.error(e)
  }
}

async function cancelOrder(id) {
  showConfirmDialog({
    title: '提示',
    message: '确定取消该订单吗？'
  }).then(async () => {
    await cancelOrderApi(id)
    showToast('取消成功')
    loadOrders()
  }).catch(() => {})
}

async function onRefresh() {
  await loadOrders()
  refreshing.value = false
}

function getStatusType(status) {
  const map = { pending: 'warning', confirmed: 'success', cancelled: 'default' }
  return map[status] || 'default'
}

function getStatusText(status) {
  const map = { pending: '待取餐', confirmed: '已预订', cancelled: '已取消' }
  return map[status] || status
}

function getMealTypeText(type) {
  const map = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }
  return map[type] || type
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function onTabChange(index) {
  if (index === 0) {
    router.push('/home')
  } else if (index === 1) {
    router.push('/profile')
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped lang="less">
.order-list {
  padding: 10px 15px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebedf0;
}

.order-no {
  font-size: 14px;
  color: #969799;
}

.order-info {
  p {
    font-size: 14px;
    margin-bottom: 6px;
    
    span {
      color: #969799;
    }
  }
}

.order-items {
  padding: 10px 0;
  border-top: 1px solid #ebedf0;
  border-bottom: 1px solid #ebedf0;
  margin: 10px 0;
  
  .item-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    padding: 4px 0;
    
    .item-name {
      color: #323233;
    }
    
    .item-quantity {
      color: #969799;
    }
  }
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebedf0;
}

.total-price {
  color: #ee0a24;
  font-size: 16px;
  font-weight: bold;
}
</style>
