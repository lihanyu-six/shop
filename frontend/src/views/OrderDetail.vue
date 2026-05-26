<template>
  <div class="order-detail-container page-container">
    <van-nav-bar title="订单详情" left-arrow @click-left="onClickLeft" />
    
    <div class="status-section" v-if="order">
      <div class="status-icon">
        <van-icon :name="statusIcon" :color="statusColor" size="48" />
      </div>
      <h3>{{ getStatusText(order.status) }}</h3>
      <p class="pick-code" v-if="order.pick_code">取餐码：{{ order.pick_code }}</p>
    </div>
    
    <div class="info-section" v-if="order">
      <van-cell-group inset>
        <van-cell title="订单编号" :value="order.order_no" />
        <van-cell title="餐次" :value="getMealTypeText(order.meal_type)" />
        <van-cell title="用餐日期" :value="order.order_date" />
        <van-cell title="下单时间" :value="formatDate(order.created_at)" />
        <van-cell title="备注" :value="order.remark || '无'" />
      </van-cell-group>
    </div>
    
    <div class="items-section" v-if="items.length > 0">
      <h4>菜品明细</h4>
      <van-cell-group inset>
        <van-cell v-for="item in items" :key="item.id" :title="item.dish_name">
          <template #label>¥{{ item.price.toFixed(2) }}</template>
          <template #right-icon>x{{ item.quantity }}</template>
        </van-cell>
      </van-cell-group>
    </div>
    
    <div class="total-section" v-if="order">
      <div class="total-row">
        <span>合计</span>
        <span class="total-price">¥{{ order.total_amount.toFixed(2) }}</span>
      </div>
    </div>
    
    <div class="action-section" v-if="order && order.status === 'confirmed'">
      <van-button type="danger" block round @click="cancelOrder">取消订单</van-button>
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

const statusIcon = computed(() => {
  const map = { pending: 'clock', confirmed: 'checked', cancelled: 'cross' }
  return map[order.value?.status] || 'info'
})

const statusColor = computed(() => {
  const map = { pending: '#ff976a', confirmed: '#07c160', cancelled: '#969799' }
  return map[order.value?.status] || '#969799'
})

async function loadOrderDetail() {
  try {
    const res = await getOrderDetail(route.params.id)
    order.value = res.order
    items.value = res.items
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

function getStatusText(status) {
  const map = { pending: '待取餐', confirmed: '预订成功', cancelled: '已取消' }
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

function onClickLeft() {
  router.push('/home')
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped lang="less">
.status-section {
  background: #fff;
  padding: 30px 20px;
  text-align: center;
  margin-bottom: 10px;
}

.status-icon {
  margin-bottom: 10px;
}

.pick-code {
  color: #1989fa;
  font-size: 16px;
  font-weight: bold;
  margin-top: 5px;
}

.info-section, .items-section, .total-section {
  margin-bottom: 10px;
}

.total-section {
  background: #fff;
  padding: 15px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
}

.total-price {
  color: #ee0a24;
  font-size: 20px;
  font-weight: bold;
}

.action-section {
  padding: 20px;
}
</style>
