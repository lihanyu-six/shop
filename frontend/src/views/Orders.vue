<template>
  <div class="orders-container">
    <van-nav-bar title="预定记录" left-arrow @click-left="onClickLeft">
      <template #right>
        <van-icon name="ellipsis" size="20" style="margin-right: 15px" />
        <van-icon name="user-o" size="20" />
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="order-list" v-if="orders.length > 0">
        <template v-for="(order, index) in orders" :key="order.id">
          <div class="date-divider" v-if="shouldShowDateDivider(index)">
            {{ formatDateCN(order.created_at) }}
          </div>

          <div class="order-card" @click="$router.push(`/order-detail/${order.id}`)">
            <div class="order-header">
              <span class="order-no">{{ getMealTypeText(order.meal_type) }}-{{ order.pick_code || '000' }}</span>
              <span class="meal-tag" :class="order.meal_type">{{ getMealTypeText(order.meal_type) }}</span>
            </div>

            <div class="order-item" v-if="order.items && order.items.length > 0">
              <van-image :src="order.items[0].image || '/default-dish.png'" width="70" height="70" fit="cover" radius="8" />
              <div class="item-info">
                <h4>{{ order.items[0].dish_name }}</h4>
                <p class="item-remark">备注：{{ order.items[0].remark || '麦乐鸡4块*1，板烧鸡腿堡*1' }}</p>
              </div>
            </div>

            <div class="order-footer">
              <div class="status-row" :class="order.status">
                <van-icon v-if="order.status === 'pending'" name="clock-o" size="16" color="#1989fa" />
                <van-icon v-else-if="order.status === 'confirmed' || order.status === 'picked'" name="checked" size="16" color="#07c160" />
                <van-icon v-else name="close" size="16" color="#969799" />
                <span>{{ getOrderStatusText(order.status) }}</span>
              </div>
              <span class="order-time">下单时间: {{ formatTime(order.created_at) }}</span>
            </div>
          </div>
        </template>
      </div>
      <van-empty v-else description="暂无预定记录" />
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getOrders } from '@/api/orders'

const router = useRouter()

const refreshing = ref(false)
const orders = ref([])

async function loadOrders() {
  try {
    const res = await getOrders({})
    orders.value = res.orders || []
  } catch (e) {
    console.error(e)
  }
}

function shouldShowDateDivider(index) {
  if (index === 0) return true

  const currentDate = new Date(orders.value[index].created_at).toDateString()
  const prevDate = new Date(orders.value[index - 1].created_at).toDateString()
  return currentDate !== prevDate
}

function formatDateCN(dateStr) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekday = weekdays[date.getDay()]

  return `${year}年${month}月${day}日 ${weekday}`
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
}

function getMealTypeText(type) {
  const map = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }
  return map[type] || type
}

function getOrderStatusText(status) {
  const map = {
    pending: '待取餐',
    confirmed: '已取餐',
    picked: '已取餐',
    cancelled: '已取消'
  }
  return map[status] || status
}

async function onRefresh() {
  await loadOrders()
  refreshing.value = false
}

function onClickLeft() {
  router.back()
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped lang="less">
.orders-container {
  background: #f5f5f5;
  min-height: 100vh;

  :deep(.van-nav-bar) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }

  .order-list {
    padding-top: 56px;

    .date-divider {
      text-align: center;
      padding: 15px 0;
      font-size: 13px;
      color: #999;
    }

    .order-card {
      margin: 0 15px 12px;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 15px;
        border-bottom: 1px solid #f5f5f5;

        .order-no {
          font-size: 14px;
          font-weight: bold;
          color: #333;
        }

        .meal-tag {
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 10px;

          &.breakfast,
          &.lunch,
          &.dinner {
            background: #e8f4fd;
            color: #1989fa;
          }
        }
      }

      .order-item {
        display: flex;
        gap: 12px;
        padding: 12px 15px;

        .item-info {
          flex: 1;

          h4 {
            font-size: 15px;
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
          }

          .item-remark {
            font-size: 12px;
            color: #999;
            line-height: 1.4;
          }
        }
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        border-top: 1px solid #f5f5f5;

        .status-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;

          &.pending {
            color: #1989fa;
          }

          &.confirmed,
          &.picked {
            color: #07c160;
          }

          &.cancelled {
            color: #969799;
          }
        }

        .order-time {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
}
</style>
