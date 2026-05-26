<template>
  <div class="cart-container page-container">
    <van-nav-bar title="购物车" left-arrow @click-left="onClickLeft" />
    
    <div class="order-info">
      <van-cell-group inset>
        <van-cell title="餐次" :value="mealTypeText" is-link @click="showMealPicker = true" />
        <van-cell title="用餐日期" :value="cartStore.orderDate" is-link @click="showDatePicker = true" />
      </van-cell-group>
    </div>
    
    <div class="cart-list" v-if="cartStore.cartItems.length > 0">
      <div class="cart-item" v-for="item in cartStore.cartItems" :key="item.dishId">
        <van-image :src="item.image" width="70" height="70" fit="cover" round />
        <div class="item-info">
          <h4>{{ item.dishName }}</h4>
          <p class="item-price">¥{{ item.price.toFixed(2) }}</p>
        </div>
        <div class="item-action">
          <van-stepper
            v-model="item.quantity"
            min="1"
            max="99"
            @change="() => cartStore.saveCart()"
          />
          <van-icon name="delete-o" color="#ee0a24" size="20" @click="removeItem(item.dishId)" />
        </div>
      </div>
    </div>
    <van-empty v-else description="购物车是空的" />
    
    <div class="remark-section" v-if="cartStore.cartItems.length > 0">
      <van-cell-group inset>
        <van-field
          v-model="remark"
          type="textarea"
          placeholder="添加备注（选填）"
          rows="2"
        />
      </van-cell-group>
    </div>
    
    <div class="bottom-bar" v-if="cartStore.cartItems.length > 0">
      <div class="bar-info">
        <span>合计：</span>
        <span class="total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
      </div>
      <van-button type="primary" round :loading="submitting" @click="submitOrder">提交订单</van-button>
    </div>
    
    <van-popup v-model:show="showMealPicker" position="bottom">
      <van-picker
        :columns="mealColumns"
        @confirm="onMealConfirm"
        @cancel="showMealPicker = false"
      />
    </van-popup>
    
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-picker
        :columns="dateColumns"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useCartStore } from '@/stores/cart'
import { createOrder } from '@/api/orders'

const router = useRouter()
const cartStore = useCartStore()

const remark = ref('')
const submitting = ref(false)
const showMealPicker = ref(false)
const showDatePicker = ref(false)

const mealColumns = [
  { text: '早餐', value: 'breakfast' },
  { text: '午餐', value: 'lunch' },
  { text: '晚餐', value: 'dinner' }
]

const mealTypeText = computed(() => {
  const map = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }
  return map[cartStore.mealType] || '午餐'
})

const dateColumns = computed(() => {
  const dates = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    dates.push({ text: dateStr, value: dateStr })
  }
  return dates
})

function removeItem(dishId) {
  showConfirmDialog({
    title: '提示',
    message: '确定删除该菜品吗？'
  }).then(() => {
    cartStore.removeItem(dishId)
  }).catch(() => {})
}

function onMealConfirm({ selectedOptions }) {
  cartStore.setMealType(selectedOptions[0].value)
  showMealPicker.value = false
}

function onDateConfirm({ selectedOptions }) {
  cartStore.setOrderDate(selectedOptions[0].value)
  showDatePicker.value = false
}

async function submitOrder() {
  submitting.value = true
  try {
    const res = await createOrder({
      mealType: cartStore.mealType,
      orderDate: cartStore.orderDate,
      items: cartStore.cartItems,
      remark: remark.value
    })
    showToast('下单成功')
    cartStore.clearCart()
    router.push(`/order-detail/${res.order.id}`)
  } finally {
    submitting.value = false
  }
}

function onClickLeft() {
  router.back()
}
</script>

<style scoped lang="less">
.order-info {
  margin: 15px 0;
}

.cart-list {
  padding: 0 15px;
}

.cart-item {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  align-items: center;
}

.item-info {
  flex: 1;
  
  h4 {
    font-size: 15px;
    margin-bottom: 5px;
  }
  
  .item-price {
    color: #ee0a24;
    font-size: 16px;
    font-weight: bold;
  }
}

.item-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.remark-section {
  margin: 15px 0;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.bar-info {
  .total-price {
    color: #ee0a24;
    font-size: 20px;
    font-weight: bold;
  }
}
</style>
