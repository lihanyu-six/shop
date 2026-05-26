<template>
  <div class="surveys-container page-container">
    <van-nav-bar title="调查问卷" left-arrow @click-left="onClickLeft" />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="survey-list" v-if="surveys.length > 0">
        <div class="survey-card" v-for="item in surveys" :key="item.id" @click="goToSurvey(item.id)">
          <div class="survey-header">
            <h4>{{ item.title }}</h4>
            <van-tag type="success">进行中</van-tag>
          </div>
          <p class="survey-desc">{{ item.description || '暂无描述' }}</p>
          <div class="survey-footer">
            <span class="survey-time">{{ formatDate(item.created_at) }}</span>
            <van-icon name="arrow" />
          </div>
        </div>
      </div>
      <van-empty v-else description="暂无调查问卷" />
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSurveys } from '@/api/surveys'

const router = useRouter()

const refreshing = ref(false)
const surveys = ref([])

async function loadSurveys() {
  try {
    const res = await getSurveys()
    surveys.value = res.surveys
  } catch (e) {
    console.error(e)
  }
}

async function onRefresh() {
  await loadSurveys()
  refreshing.value = false
}

function goToSurvey(id) {
  router.push(`/survey/${id}`)
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function onClickLeft() {
  router.back()
}

onMounted(() => {
  loadSurveys()
})
</script>

<style scoped lang="less">
.survey-list {
  padding: 10px;
}

.survey-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
}

.survey-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  h4 {
    font-size: 16px;
    margin: 0;
  }
}

.survey-desc {
  font-size: 14px;
  color: #969799;
  margin-bottom: 10px;
}

.survey-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #ebedf0;
}

.survey-time {
  font-size: 12px;
  color: #969799;
}
</style>
