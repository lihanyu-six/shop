<template>
  <div class="menu-blue-container">
    <van-nav-bar title="Daily Menu" left-arrow @click-left="$router.back()">
      <template #right>
        <span class="nav-date">{{ currentDate }}</span>
      </template>
    </van-nav-bar>

    <div class="blue-header">
      <h1 class="main-title">每日（菜谱）</h1>
      <div class="title-decoration"></div>
    </div>

    <div class="meal-section" v-for="meal in meals" :key="meal.type">
      <div class="meal-header-blue">
        <span class="meal-tag">{{ meal.name }}</span>
        <span class="meal-en">{{ meal.enName }}</span>
      </div>

      <div class="dish-grid-blue">
        <div class="dish-card-blue" v-for="(dish, index) in meal.dishes" :key="index">
          <div class="dish-img-wrapper">
            <img :src="dish.image" :alt="dish.name" />
          </div>
          <p class="dish-name-blue">{{ dish.name }}</p>
        </div>
      </div>

      <div class="divider-dashed"></div>

      <div class="more-dishes-blue">
        <div class="more-tags-row">
          <span class="tag-blue" v-for="(item, idx) in meal.moreDishes.slice(0, 5)" :key="idx">{{ item }}</span>
        </div>
        <div class="more-tags-row">
          <span class="tag-blue highlight" v-for="(item, idx) in meal.moreDishes.slice(5)" :key="idx">{{ item }}</span>
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
  return `02/${String(day).padStart(2, '0')}周${['日','一','二','三','四','五','六'][now.getDay()]}`
})

const meals = ref([
  {
    type: 'breakfast',
    name: '早餐',
    enName: 'Breakfast',
    dishes: [
      { name: '肉丝面', image: 'https://images.unsplash.com/photo-1585032226651-759b73142ba2?w=300&h=200&fit=crop' },
      { name: '大肉包', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300&h=200&fit=crop' },
      { name: '油条', image: 'https://images.unsplash.com/photo-1541696490-8744a5dc0228?w=300&h=200&fit=crop' },
      { name: '南瓜粥', image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=300&h=200&fit=crop' },
      { name: '肠粉', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&h=200&fit=crop' },
      { name: '胡辣汤', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=200&fit=crop' }
    ],
    moreDishes: ['油条', '大肉包', '南瓜粥', '肠粉', '肉丝面', '胡辣汤', '我是文案最多八个字']
  },
  {
    type: 'lunch',
    name: '午餐',
    enName: 'Lunch',
    dishes: [
      { name: '红烧肉', image: 'https://images.unsplash.com/photo-1623689049151-99ba656302d4?w=300&h=200&fit=crop' },
      { name: '回锅肉', image: 'https://images.unsplash.com/photo-1609183480238-4f70b7a278e7?w=300&h=200&fit=crop' },
      { name: '辣椒炒肉', image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=300&h=200&fit=crop' },
      { name: '香辣小龙虾', image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=300&h=200&fit=crop' },
      { name: '山芋蒸排骨', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop' },
      { name: '腊鱼', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200&fit=crop' }
    ],
    moreDishes: ['香辣小龙虾', '回锅肉', '山芋蒸排骨', '腊鱼', '胡辣汤', '我是文案最多八个字']
  }
])
</script>

<style scoped lang="less">
.menu-blue-container {
  min-height: 100vh;
  background: #f8fbff;
}

:deep(.van-nav-bar) {
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-date {
  font-size: 13px;
  color: #1989fa;
  font-weight: 500;
}

.blue-header {
  background: #fff;
  padding: 25px 20px;
  text-align: center;
  position: relative;
  border-bottom: 1px solid #e8f4fd;

  .main-title {
    font-size: 32px;
    font-weight: bold;
    color: #1989fa;
    margin: 0 0 10px;
    letter-spacing: 2px;
  }

  .title-decoration {
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, transparent, #1989fa, transparent);
    margin: 0 auto;
  }
}

.meal-section {
  background: #fff;
  margin: 15px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(25, 137, 250, 0.06);

  .meal-header-blue {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;

    .meal-tag {
      background: #1989fa;
      color: #fff;
      padding: 6px 18px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
    }

    .meal-en {
      font-size: 13px;
      color: #999;
      font-style: italic;
    }
  }

  .dish-grid-blue {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 18px;

    .dish-card-blue {
      .dish-img-wrapper {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 16px;
        overflow: hidden;
        border: 2px solid #e8f4fd;
        margin-bottom: 8px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .dish-name-blue {
        font-size: 13px;
        color: #333;
        text-align: center;
        margin: 0;
        font-weight: 500;
      }
    }
  }

  .divider-dashed {
    border-top: 2px dashed #d6eaf8;
    margin: 15px 0;
  }

  .more-dishes-blue {
    .more-tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;

      .tag-blue {
        font-size: 13px;
        color: #2874a6;
        background: #ebf5fb;
        padding: 6px 14px;
        border-radius: 16px;
        border: 1px solid #aed6f1;

        &.highlight {
          color: #1989fa;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
