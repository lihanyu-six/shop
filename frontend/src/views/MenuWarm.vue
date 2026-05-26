<template>
  <div class="menu-warm-container">
    <div class="warm-header">
      <div class="header-decoration">
        <div class="deco-left">
          <div class="deco-placeholder wheat"></div>
        </div>
        <h1 class="main-title">每日菜谱</h1>
        <div class="deco-right">
          <div class="deco-placeholder veggie"></div>
        </div>
      </div>
    </div>

    <div class="date-info">
      <span class="date-text">{{ currentDate }}</span>
      <span class="weekday">{{ currentWeekday }}</span>
    </div>

    <div class="meal-section" v-for="meal in meals" :key="meal.type">
      <div class="meal-header">
        <span class="meal-title">« {{ meal.name }} »</span>
      </div>

      <div class="dish-grid">
        <div class="dish-item" v-for="(dish, index) in meal.dishes" :key="index">
          <div class="dish-image-circle">
            <img :src="dish.image" :alt="dish.name" />
          </div>
          <p class="dish-name">{{ dish.name }}</p>
        </div>
      </div>

      <div class="more-dishes">
        <p class="more-title">还有更多菜品</p>
        <div class="more-tags">
          <span class="tag-item" v-for="(item, idx) in meal.moreDishes" :key="idx">{{ item }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentDate = computed(() => {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  return `${month}/${day}`
})

const currentWeekday = computed(() => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[new Date().getDay()]
})

const meals = ref([
  {
    type: 'breakfast',
    name: '早餐',
    dishes: [
      { name: '肉丝面', image: 'https://images.unsplash.com/photo-1585032226651-759b73142ba2?w=200&h=200&fit=crop' },
      { name: '油条豆浆', image: 'https://images.unsplash.com/photo-1541696490-8744a5dc0228?w=200&h=200&fit=crop' },
      { name: '大肉包', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&h=200&fit=crop' }
    ],
    moreDishes: ['油条', '大肉包', '南瓜粥', '肠粉', '肉丝面', '胡辣汤', '我是文案最多八个字']
  },
  {
    type: 'lunch',
    name: '午餐',
    dishes: [
      { name: '红烧肉', image: 'https://images.unsplash.com/photo-1623689049151-99ba656302d4?w=200&h=200&fit=crop' },
      { name: '回锅肉', image: 'https://images.unsplash.com/photo-1609183480238-4f70b7a278e7?w=200&h=200&fit=crop' },
      { name: '辣椒炒肉', image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=200&h=200&fit=crop' }
    ],
    moreDishes: ['香辣小龙虾', '回锅肉', '山芋蒸排骨', '腊鱼', '胡辣汤', '我是文案最多八个字']
  }
])
</script>

<style scoped lang="less">
.menu-warm-container {
  min-height: 100vh;
  background: #fef9f3;
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(243, 156, 18, 0.03) 35px, rgba(243, 156, 18, 0.03) 36px),
    repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(243, 156, 18, 0.03) 35px, rgba(243, 156, 18, 0.03) 36px);
  padding-bottom: 40px;
}

.warm-header {
  padding: 20px;
  text-align: center;
}

.header-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  position: relative;

  .deco-left, .deco-right {
    width: 60px;
    height: 60px;

    .deco-placeholder {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-size: cover;

      &.wheat {
        background: linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #d35400 100%);
        position: relative;

        &::before {
          content: '🌾';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 28px;
        }
      }

      &.veggie {
        background: linear-gradient(135deg, #27ae60 0%, #229954 50%, #1e8449 100%);
        position: relative;

        &::before {
          content: '🥕';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 28px;
        }
      }
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .main-title {
    font-size: 42px;
    font-weight: bold;
    color: #d35400;
    text-shadow: 3px 3px 0 #f39c12, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
    letter-spacing: 4px;
    margin: 0;
  }
}

.date-info {
  text-align: right;
  padding: 10px 20px;

  .date-text {
    font-size: 14px;
    color: #d35400;
    margin-right: 8px;
  }

  .weekday {
    font-size: 14px;
    color: #e67e22;
  }
}

.meal-section {
  margin: 25px 15px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(211, 84, 0, 0.08);

  .meal-header {
    text-align: center;
    margin-bottom: 18px;

    .meal-title {
      display: inline-block;
      font-size: 18px;
      font-weight: bold;
      color: #d35400;
      background: linear-gradient(135deg, #fef5e7 0%, #fdebd0 100%);
      padding: 8px 30px;
      border-radius: 20px;
      border: 2px solid #f39c12;
    }
  }

  .dish-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 20px;

    .dish-item {
      text-align: center;

      .dish-image-circle {
        width: 85px;
        height: 85px;
        border-radius: 50%;
        overflow: hidden;
        margin: 0 auto 10px;
        border: 3px solid #f39c12;
        background: #fff;
        box-shadow: 0 4px 12px rgba(243, 156, 18, 0.2);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .dish-name {
        font-size: 14px;
        color: #333;
        font-weight: 600;
        margin: 0;
      }
    }
  }

  .more-dishes {
    border-top: 2px dashed #f5e6d3;
    padding-top: 15px;

    .more-title {
      font-size: 13px;
      color: #999;
      margin: 0 0 12px;
    }

    .more-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .tag-item {
        font-size: 13px;
        color: #d68910;
        background: #fef9e7;
        padding: 6px 14px;
        border-radius: 15px;
        border: 1px solid #f9e79f;
      }
    }
  }
}
</style>
