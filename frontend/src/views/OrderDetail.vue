<template>
  <div class="order-detail-container">
    <van-nav-bar title="确认订单" left-arrow @click-left="onClickLeft">
    </van-nav-bar>

    <div class="status-section" v-if="order">
      <div class="status-header" :class="order.status">
        <div class="status-icon-wrapper" :class="order.status">
          <van-icon v-if="order.status === 'confirmed'" name="success" size="28" color="#fff" />
          <van-icon v-else-if="order.status === 'cancelled'" name="cross" size="28" color="#fff" />
          <van-icon v-else-if="order.status === 'pending'" name="warning-o" size="28" color="#fff" />
        </div>
        <div class="status-text">
          <h3>{{ getStatusTitle(order.status) }}</h3>
          <p>{{ getStatusDesc(order.status) }}</p>
        </div>
      </div>
    </div>

    <div class="pick-code-section" v-if="order && order.status === 'confirmed'">
      <p class="code-label">您的取餐码为</p>
      <p class="code-value">{{ getMealTypeText(order.meal_type) }}-{{ order.pick_code || generatePickCode() }}</p>
    </div>

    <div class="items-section" v-if="items.length > 0">
      <div class="item-card" v-for="item in items" :key="item.id">
        <van-image :src="item.image || '/default-dish.png'" width="80" height="80" fit="cover" radius="8" />
        <div class="item-info">
          <h4>{{ item.dish_name }}</h4>
          <p class="item-remark">备注：{{ item.remark || '无' }}</p>
          <div class="item-bottom">
            <span class="item-price">¥{{ item.price.toFixed(2) }}</span>
            <span class="item-quantity">x{{ item.quantity }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="summary-section" v-if="order">
      <div class="summary-row">
        <span>共计{{ totalCount }}件商品</span>
        <span class="total-price">合计 ¥{{ order.total_amount.toFixed(2) }}</span>
      </div>
    </div>

    <div class="info-section" v-if="order">
      <h4>订单信息</h4>
      <div class="info-row">
        <span class="label">流水号</span>
        <span class="value">{{ order.order_no }}</span>
      </div>
      <div class="info-row">
        <span class="label">预定时间</span>
        <span class="value">{{ formatDate(order.created_at) }}</span>
      </div>
      <div class="info-row">
        <span class="label">备注信息</span>
        <span class="value">{{ order.remark || '无' }}</span>
      </div>
    </div>

    <div class="action-section" v-if="order">
      <button class="btn-cancel" @click="cancelOrder" v-if="order.status === 'confirmed'">取消预约</button>
      <button class="btn-home" @click="goHome">返回主页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getOrderDetail, cancelOrder as cancelOrderApi } from '@/api/orders'

const route = useRoute()
const router = useRouter()

const order = ref(null)
const items = ref([])

const totalCount = computed(() => {
  return items.value.reduce((sum, item) => sum + item.quantity, 0)
})

async function loadOrderDetail() {
  try {
    const res = await getOrderDetail(route.params.id)
    order.value = res.order
    items.value = res.items || []
  } catch (e) {
    console.error(e)
  }
}

async function cancelOrder() {
  showConfirmDialog({
    title: '提示',
    message: '确定取消该订单吗？'
  }).then(async () => {
    await cancelOrderApi(route.params.id)
    showToast('取消成功')
    loadOrderDetail()
  }).catch(() => {})
}

function getStatusTitle(status) {
  const map = { pending: '待取餐', confirmed: '预定成功', cancelled: '已取消', picked: '已取餐' }
  return map[status] || status
}

function getStatusDesc(status) {
  const map = {
    pending: '请准时前往食堂取餐',
    confirmed: '请准时前往食堂取餐',
    cancelled: '您的预定已取消成功',
    picked: '您已成功取餐'
  }
  return map[status] || ''
}

function getMealTypeText(type) {
  const map = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }
  return map[type] || type
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function generatePickCode() {
  return String(Math.floor(Math.random() * 900) + 100)
}

function onClickLeft() {
  router.back()
}

function goHome() {
  router.push('/home')
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped lang="less">
.order-detail-container {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 100px;

  :deep(.van-nav-bar) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }

  .status-section {
    margin-top: 46px;
  }

  .status-section {
    background: #fff;
    padding: 25px 20px;

    .status-header {
      display: flex;
      align-items: center;
      gap: 15px;

      &.confirmed {
        .status-icon-wrapper {
          background: linear-gradient(135deg, #1989fa 0%, #06c160 100%);
        }
      }

      &.cancelled {
        .status-icon-wrapper {
          background: linear-gradient(135deg, #969799 0%, #bdc3c7 100%);
        }
      }

      &.pending,
      &.picked {
        .status-icon-wrapper {
          background: linear-gradient(135deg, #ff976a 0%, #ff6b35 100%);
        }
      }

      .status-icon-wrapper {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .status-text {
        h3 {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }

        p {
          font-size: 14px;
          color: #999;
        }
      }
    }
  }

  .pick-code-section {
    background: #fff;
    padding: 25px 20px;
    text-align: center;
    border-top: 1px solid #f5f5f5;

    .code-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }

    .code-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      letter-spacing: 1px;
    }
  }

  .items-section {
    padding: 15px;

    .item-card {
      display: flex;
      gap: 12px;
      background: #fff;
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 10px;

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
          margin-bottom: 8px;
        }

        .item-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .item-price {
            font-size: 16px;
            font-weight: bold;
            color: #333;
          }

          .item-quantity {
            font-size: 14px;
            color: #999;
          }
        }
      }
    }
  }

  .summary-section {
    background: #fff;
    padding: 15px 20px;
    margin: 0 15px;
    border-radius: 12px;

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 15px;
      color: #333;

      .total-price {
        color: #1989fa;
        font-weight: bold;
        font-size: 18px;
      }
    }
  }

  .info-section {
    background: #fff;
    margin: 15px;
    border-radius: 12px;
    padding: 15px 20px;

    h4 {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-size: 14px;
        color: #999;
      }

      .value {
        font-size: 14px;
        color: #333;
        text-align: right;
        max-width: 60%;
      }
    }
  }

  .action-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 15px 20px;
    display: flex;
    gap: 15px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

    button {
      flex: 1;
      padding: 12px 0;
      border-radius: 25px;
      font-size: 15px;
      font-weight: bold;
      cursor: pointer;
      border: none;
    }

    .btn-cancel {
      background: #f5f5f5;
      color: #666;
    }

    .btn-home {
      background: linear-gradient(135deg, #1989fa 0%, #06c160 100%);
      color: #fff;
    }
  }
}
</style>
