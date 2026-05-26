<template>
  <div class="menu-container">
    <van-nav-bar title="订餐" left-arrow @click-left="onClickLeft">
      <template #right>
        <van-icon name="ellipsis" size="20" style="margin-right: 15px" />
        <van-icon name="user-o" size="20" />
      </template>
    </van-nav-bar>

    <div class="date-selector">
      <div class="date-item" v-for="(date, index) in weekDates" :key="index"
        :class="{ active: selectedDateIndex === index }"
        @click="selectDate(index)">
        <div class="weekday">{{ date.weekday }}</div>
        <div class="day">{{ date.day }}</div>
      </div>
    </div>

    <div class="meal-tabs">
      <div class="tab-item" :class="{ active: selectedMeal === 'breakfast' }"
        @click="switchMeal('breakfast')">
        <span>早餐</span>
        <span class="status" :class="{ expired: isBreakfastExpired }">
          {{ isBreakfastExpired ? '已过期' : '可预定' }}
        </span>
      </div>
      <div class="tab-item" :class="{ active: selectedMeal === 'lunch' }"
        @click="switchMeal('lunch')">
        <span>午餐</span>
      </div>
    </div>

    <div class="time-tip" v-if="!isMealExpired">
      <van-icon name="volume-o" color="#ff976a" />
      <span>{{ mealTimeTip }}</span>
    </div>

    <div class="main-content">
      <div class="category-sidebar">
        <div class="category-item"
          v-for="(cat, index) in categories"
          :key="cat.id"
          :class="{ active: selectedCategory === index }"
          @click="selectedCategory = index">
          {{ cat.name }}
        </div>
      </div>

      <div class="dish-content">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <div class="dish-list" v-if="currentDishes.length > 0">
            <div class="dish-card" v-for="dish in currentDishes" :key="dish.id"
              @click="showDishDetail(dish)">
              <van-image :src="dish.image" width="100%" height="160px" fit="cover" radius="12" />
              <div class="dish-info">
                <h4>{{ dish.name }}</h4>
                <p class="dish-desc">{{ dish.description }}</p>
                <div class="dish-bottom">
                  <span class="dish-price">¥{{ dish.price.toFixed(2) }}</span>
                  <div class="quantity-control" v-if="getQuantity(dish.id) > 0">
                    <button class="btn-minus" @click.stop="decreaseQuantity(dish)">-</button>
                    <span class="quantity">{{ getQuantity(dish.id) }}</span>
                    <button class="btn-plus" @click.stop="increaseQuantity(dish)">+</button>
                  </div>
                  <button class="btn-add" v-else @click.stop="showDishDetail(dish)">+</button>
                </div>
              </div>
            </div>
          </div>
          <van-empty v-else description="暂无菜品" />
        </van-pull-refresh>
      </div>
    </div>

    <div class="bottom-bar" :class="{ disabled: isMealExpired }">
      <div class="cart-icon-wrapper" @click="showCartPopup = true">
        <div class="cart-icon">
          <van-icon name="shopping-cart-o" size="24" color="#fff" />
          <van-badge :content="cartStore.totalCount" v-if="cartStore.totalCount > 0" />
        </div>
      </div>
      <div class="bar-info">
        <div class="price">¥{{ cartStore.totalPrice.toFixed(2) }}</div>
        <div class="count-tip" v-if="cartStore.totalCount > 0">已选择{{ cartStore.totalCount }}件商品</div>
      </div>
      <button class="btn-checkout" :disabled="isMealExpired || cartStore.totalCount === 0"
        @click="goToCheckout">
        {{ isMealExpired ? '该餐品未到预定时间，请重新选择！' : '去结算' }}
      </button>
    </div>

    <van-popup v-model:show="showCartPopup" position="bottom" round :style="{ height: '60%' }">
      <div class="cart-popup">
        <div class="popup-header">
          <h3>购物车</h3>
          <span class="clear-btn" @click="clearCart" v-if="cartStore.cartItems.length > 0">清空</span>
        </div>
        <div class="cart-list">
          <div class="cart-item" v-for="item in cartStore.cartItems" :key="item.dishId">
            <van-image :src="item.image" width="70" height="70" fit="cover" radius="8" />
            <div class="item-info">
              <h4>{{ item.dishName }}</h4>
              <p class="item-price">¥{{ item.price.toFixed(2) }}</p>
            </div>
            <div class="item-action">
              <button class="btn-minus" @click="cartStore.updateQuantity(item.dishId, item.quantity - 1)">-</button>
              <span>{{ item.quantity }}</span>
              <button class="btn-plus" @click="cartStore.updateQuantity(item.dishId, item.quantity + 1)">+</button>
            </div>
          </div>
        </div>
        <div class="popup-bottom">
          <div class="total">¥{{ cartStore.totalPrice.toFixed(2) }}</div>
          <button class="btn-checkout" @click="goToCheckoutFromCart">去结算</button>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showDishPopup" position="bottom" round :style="{ height: '70%' }">
      <div class="dish-detail-popup" v-if="currentDish">
        <van-image :src="currentDish.image" width="100%" height="200" fit="cover" />
        <div class="detail-content">
          <h3>{{ currentDish.name }}</h3>
          <p class="detail-price">¥{{ currentDish.price.toFixed(2) }}</p>
          <p class="detail-desc">{{ currentDish.description }}</p>

          <div class="option-section" v-if="currentDish.tastes && currentDish.tastes.length > 0">
            <h4>口味</h4>
            <div class="option-tags">
              <span class="tag" v-for="taste in currentDish.tastes" :key="taste"
                :class="{ active: selectedTaste === taste }"
                @click="selectedTaste = taste">
                {{ taste }}
              </span>
            </div>
          </div>

          <div class="option-section" v-if="currentDish.specs && currentDish.specs.length > 0">
            <h4>规格</h4>
            <div class="option-tags">
              <span class="tag" v-for="spec in currentDish.specs" :key="spec"
                :class="{ active: selectedSpec === spec }"
                @click="selectedSpec = spec">
                {{ spec }}
              </span>
            </div>
          </div>

          <div class="quantity-section">
            <h4>数量</h4>
            <div class="quantity-control">
              <button class="btn-minus" @click="detailQuantity = Math.max(1, detailQuantity - 1)">-</button>
              <span class="quantity">{{ detailQuantity }}</span>
              <button class="btn-plus" @click="detailQuantity++">+</button>
            </div>
          </div>

          <div class="detail-bottom">
            <span class="total-price">¥{{ (currentDish.price * detailQuantity).toFixed(2) }}</span>
            <button class="btn-add-cart" @click="addToCartFromDetail">加入购物车</button>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useCartStore } from '@/stores/cart'
import { getCategories, getDailyMenu } from '@/api/dishes'

const router = useRouter()
const cartStore = useCartStore()

const refreshing = ref(false)
const dishes = ref([])
const categories = ref([
  { id: 1, name: '精选套餐' },
  { id: 2, name: '热销产品' },
  { id: 3, name: '新品上线' },
  { id: 4, name: '家常炒菜' },
  { id: 5, name: '甜品点心' },
  { id: 6, name: '蔬菜汤汁' },
  { id: 7, name: '酒水饮品' }
])
const selectedCategory = ref(0)
const selectedMeal = ref('lunch')
const selectedDateIndex = ref(2)
const showCartPopup = ref(false)
const showDishPopup = ref(false)
const currentDish = ref(null)
const selectedTaste = ref('')
const selectedSpec = ref('')
const detailQuantity = ref(1)

const weekDates = computed(() => {
  const dates = []
  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + mondayOffset + i)
    dates.push({
      weekday: weekdays[i],
      day: date.getDate(),
      date: date.toISOString().split('T')[0]
    })
  }
  return dates
})

const selectedDate = computed(() => weekDates.value[selectedDateIndex.value]?.date)

const isBreakfastExpired = computed(() => {
  const now = new Date()
  const hours = now.getHours()
  return hours >= 10
})

const isMealExpired = computed(() => {
  if (selectedMeal.value === 'breakfast') {
    return isBreakfastExpired.value
  }
  return false
})

const mealTimeTip = computed(() => {
  if (selectedMeal.value === 'breakfast') {
    return '早餐可预定的时间为: 6:00-8:00'
  }
  return '午餐可预定的时间为: 11:00-13:00'
})

const currentDishes = computed(() => {
  return dishes.value
})

watch(selectedDate, () => {
  loadDishes()
})

watch(selectedMeal, () => {
  loadDishes()
})

async function loadDishes() {
  try {
    const res = await getDailyMenu({
      date: selectedDate.value,
      mealType: selectedMeal.value
    })
    dishes.value = (res.dishes || []).map(dish => ({
      ...dish,
      tastes: dish.tastes || ['多油', '清爽'],
      specs: dish.specs || ['少盐', '清爽', '清淡']
    }))
  } catch (e) {
    console.error(e)
  }
}

function selectDate(index) {
  selectedDateIndex.value = index
}

function switchMeal(meal) {
  if (meal === 'breakfast' && isBreakfastExpired.value) {
    showToast('早餐预定时间已过')
    return
  }
  selectedMeal.value = meal
}

function getQuantity(dishId) {
  const item = cartStore.cartItems.find(i => i.dishId === dishId)
  return item?.quantity || 0
}

function increaseQuantity(dish) {
  const currentQty = getQuantity(dish.id)
  if (currentQty === 0) {
    cartStore.addItem(dish, 1)
  } else {
    cartStore.updateQuantity(dish.id, currentQty + 1)
  }
}

function decreaseQuantity(dish) {
  const currentQty = getQuantity(dish.id)
  if (currentQty > 0) {
    cartStore.updateQuantity(dish.id, currentQty - 1)
  }
}

function showDishDetail(dish) {
  currentDish.value = dish
  selectedTaste.value = dish.tastes?.[0] || ''
  selectedSpec.value = dish.specs?.[0] || ''
  detailQuantity.value = getQuantity(dish.id) || 1
  showDishPopup.value = true
}

function addToCartFromDetail() {
  if (!currentDish.value) return

  const existingQty = getQuantity(currentDish.value.id)
  const addQty = detailQuantity.value - existingQty

  if (addQty > 0) {
    cartStore.addItem({
      ...currentDish.value,
      taste: selectedTaste.value,
      spec: selectedSpec.value
    }, addQty)
  }

  showToast('已加入购物车')
  showDishPopup.value = false
}

function clearCart() {
  cartStore.clearCart()
  showToast('购物车已清空')
}

function goToCheckout() {
  if (isMealExpired.value) {
    showToast('该餐品未到预定时间')
    return
  }
  if (cartStore.totalCount === 0) {
    showToast('请先选择商品')
    return
  }
  showCartPopup.value = false
  router.push('/cart')
}

function goToCheckoutFromCart() {
  showCartPopup.value = false
  router.push('/cart')
}

async function onRefresh() {
  await loadDishes()
  refreshing.value = false
}

function onClickLeft() {
  router.back()
}

onMounted(() => {
  loadDishes()
})
</script>

<style scoped lang="less">
.menu-container {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 80px;
}

.date-selector {
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 15px 10px;
  border-bottom: 1px solid #eee;

  .date-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 12px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;

    &.active {
      background: #1989fa;

      .weekday, .day {
        color: #fff;
      }
    }

    .weekday {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .day {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }
}

.meal-tabs {
  background: #fff;
  display: flex;
  padding: 15px;
  gap: 30px;
  border-bottom: 1px solid #eee;

  .tab-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    color: #666;
    cursor: pointer;
    position: relative;

    &.active {
      color: #333;
      font-weight: bold;

      &::after {
        content: '';
        position: absolute;
        bottom: -15px;
        left: 50%;
        transform: translateX(-50%);
        width: 30px;
        height: 3px;
        background: #1989fa;
        border-radius: 2px;
      }
    }

    .status {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      background: #e8f4fd;
      color: #1989fa;

      &.expired {
        background: #f5f5f5;
        color: #999;
      }
    }
  }
}

.time-tip {
  background: #fffbeb;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #ff976a;
  margin-bottom: 1px;
}

.main-content {
  display: flex;
  height: calc(100vh - 280px);
  overflow: hidden;
}

.category-sidebar {
  width: 85px;
  background: #f5f5f5;
  overflow-y: auto;
  flex-shrink: 0;

  .category-item {
    padding: 18px 10px;
    text-align: center;
    font-size: 13px;
    color: #666;
    cursor: pointer;
    border-left: 3px solid transparent;

    &.active {
      background: #fff;
      color: #1989fa;
      font-weight: bold;
      border-left-color: #1989fa;
    }
  }
}

.dish-content {
  flex: 1;
  overflow-y: auto;
  background: #fff;
  padding: 10px;
}

.dish-list {
  .dish-card {
    background: #fff;
    border-radius: 12px;
    margin-bottom: 15px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .dish-info {
      padding: 12px;

      h4 {
        font-size: 15px;
        margin-bottom: 6px;
        color: #333;
      }

      .dish-desc {
        font-size: 12px;
        color: #999;
        margin-bottom: 10px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .dish-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .dish-price {
          color: #ff6b35;
          font-size: 18px;
          font-weight: bold;
        }
      }
    }
  }
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;

  button {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid #ddd;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;

    &.btn-plus {
      background: #1989fa;
      color: #fff;
      border-color: #1989fa;
    }
  }

  .quantity {
    font-size: 15px;
    font-weight: bold;
    min-width: 20px;
    text-align: center;
  }
}

.btn-add {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1989fa;
  color: #fff;
  border: none;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

  &.disabled {
    background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);

    .btn-checkout {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  .cart-icon-wrapper {
    position: relative;
    cursor: pointer;

    .cart-icon {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border: 3px solid #764ba2;

      :deep(.van-badge) {
        position: absolute;
        top: -5px;
        right: -5px;
      }
    }
  }

  .bar-info {
    flex: 1;
    color: #fff;

    .price {
      font-size: 20px;
      font-weight: bold;
    }

    .count-tip {
      font-size: 12px;
      opacity: 0.9;
    }
  }

  .btn-checkout {
    padding: 10px 25px;
    background: #fff;
    color: #667eea;
    border: none;
    border-radius: 25px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
    }
  }
}

.cart-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;

    h3 {
      font-size: 18px;
      font-weight: bold;
    }

    .clear-btn {
      color: #999;
      font-size: 14px;
      cursor: pointer;
    }
  }

  .cart-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 15px;

    .cart-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;

      .item-info {
        flex: 1;

        h4 {
          font-size: 14px;
          margin-bottom: 6px;
        }

        .item-price {
          color: #ff6b35;
          font-size: 15px;
          font-weight: bold;
        }
      }

      .item-action {
        display: flex;
        align-items: center;
        gap: 10px;

        button {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1px solid #ddd;
          background: #fff;
          font-size: 16px;
          cursor: pointer;

          &.btn-plus {
            background: #1989fa;
            color: #fff;
            border-color: #1989fa;
          }
        }

        span {
          font-size: 15px;
          font-weight: bold;
          min-width: 20px;
          text-align: center;
        }
      }
    }
  }

  .popup-bottom {
    padding: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #eee;

    .total {
      font-size: 22px;
      font-weight: bold;
      color: #ff6b35;
    }

    .btn-checkout {
      padding: 10px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border: none;
      border-radius: 25px;
      font-size: 15px;
      font-weight: bold;
      cursor: pointer;
    }
  }
}

.dish-detail-popup {
  .detail-content {
    padding: 20px;

    h3 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .detail-price {
      color: #ff6b35;
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .detail-desc {
      color: #666;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .option-section {
      margin-bottom: 20px;

      h4 {
        font-size: 15px;
        font-weight: bold;
        margin-bottom: 12px;
      }

      .option-tags {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;

        .tag {
          padding: 8px 18px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 14px;
          color: #666;
          cursor: pointer;

          &.active {
            border-color: #1989fa;
            background: #e8f4fd;
            color: #1989fa;
          }
        }
      }
    }

    .quantity-section {
      margin-bottom: 30px;

      h4 {
        font-size: 15px;
        font-weight: bold;
        margin-bottom: 12px;
      }

      .quantity-control {
        display: flex;
        align-items: center;
        gap: 15px;

        button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #ddd;
          background: #fff;
          font-size: 18px;
          cursor: pointer;

          &.btn-plus {
            background: #1989fa;
            color: #fff;
            border-color: #1989fa;
          }
        }

        .quantity {
          font-size: 18px;
          font-weight: bold;
          min-width: 30px;
          text-align: center;
        }
      }
    }

    .detail-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 20px;
      border-top: 1px solid #eee;

      .total-price {
        font-size: 22px;
        font-weight: bold;
        color: #ff6b35;
      }

      .btn-add-cart {
        padding: 12px 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border: none;
        border-radius: 25px;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
      }
    }
  }
}
</style>
