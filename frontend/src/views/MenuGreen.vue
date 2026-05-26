<template>
  <div class="menu-green-container">
    <div class="green-header">
      <div class="header-content">
        <span class="header-date">{{ currentDate }}</span>
        <h1 class="main-title">每日（菜谱）</h1>
        <p class="sub-title">*Daily Menu</p>
      </div>
    </div>

    <div class="green-body">
      <div class="meal-section-green" v-for="meal in meals" :key="meal.type">
        <div class="meal-badge">
          {{ meal.name }}
        </div>

        <div class="dish-grid-green">
          <div class="dish-card-green" v-for="(dish, index) in meal.dishes" :key="index">
            <div class="dish-img-box">
              <img :src="dish.image" :alt="dish.name" />
            </div>
            <p class="dish-name-green">{{ dish.name }}</p>
          </div>
        </div>

        <div class="divider-line"></div>

        <div class="more-dishes-green">
          <div class="tags-row">
            <span class="tag-green" v-for="(item, idx) in meal.moreDishes.slice(0, 5)" :key="idx">{{ item }}</span>
          </div>
          <div class="tags-row">
            <span class="tag-green special" v-for="(item, idx) in meal.moreDishes.slice(5)" :key="idx">{{ item }}</span>
          </div>
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
.menu-green-container {
  min-height: 100vh;
  background: #f0fdf4;
}

.green-header {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  padding: 30px 20px;
  text-align: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 30px;
    background: inherit;
    border-radius: 0 0 20px 20px;
  }

  .header-content {
    position: relative;
    z-index: 1;
  }

  .header-date {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 4px 14px;
    border-radius: 12px;
    font-size: 13px;
    margin-bottom: 12px;
  }

  .main-title {
    font-size: 34px;
    font-weight: bold;
    color: #fff;
    margin: 0 0 6px;
    letter-spacing: 3px;
  }

  .sub-title {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    margin: 0;
    font-style: italic;
  }
}

.green-body {
  padding: 25px 15px;
  position: relative;
  z-index: 1;
}

.meal-section-green {
  background: #fff;
  border-radius: 20px;
  padding: 22px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.08);

  .meal-badge {
    display: inline-block;
    background: #22c55e;
    color: #fff;
    padding: 8px 28px;
    border-radius: 20px;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 18px;
  }

  .dish-grid-green {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 18px;

    .dish-card-green {
      .dish-img-box {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 18px;
        overflow: hidden;
        border: 2px solid #bbf7d0;
        margin-bottom: 10px;
        transition: transform 0.3s;

        &:active {
          transform: scale(0.95);
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .dish-name-green {
        font-size: 13px;
        color: #166534;
        text-align: center;
        margin: 0;
        font-weight: 500;
      }
    }
  }

  .divider-line {
    border-top: 2px dashed #dcfce7;
    margin: 16px 0;
  }

  .more-dishes-green {
    .tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 8px;

      .tag-green {
        font-size: 13px;
        color: #15803d;
        background: #f0fdf4;
        padding: 7px 16px;
        border-radius: 18px;
        border: 1px solid #bbf7d0;

        &.special {
          color: #16a34a;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
