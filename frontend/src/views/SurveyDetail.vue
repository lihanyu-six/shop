<template>
  <div class="survey-detail-container page-container">
    <van-nav-bar title="调查问卷" left-arrow @click-left="onClickLeft" />
    
    <div class="survey-content" v-if="survey && !myResponse">
      <div class="survey-header">
        <h3>{{ survey.title }}</h3>
        <p class="survey-desc">{{ survey.description }}</p>
      </div>
      
      <van-form @submit="submitSurvey">
        <div class="questions-section">
          <div class="question-item" v-for="(q, qIndex) in survey.questions" :key="q.id">
            <h4 class="question-title">
              <span class="question-num">{{ qIndex + 1 }}.</span>
              {{ q.title }}
            </h4>
            
            <div v-if="q.type === 'radio'" class="options-group">
              <van-radio-group v-model="answers[q.id]">
                <van-radio v-for="(opt, oIndex) in q.options" :key="oIndex" :name="opt">
                  {{ opt }}
                </van-radio>
              </van-radio-group>
            </div>
            
            <div v-if="q.type === 'checkbox'" class="options-group">
              <van-checkbox-group v-model="answers[q.id]">
                <van-checkbox v-for="(opt, oIndex) in q.options" :key="oIndex" :name="opt">
                  {{ opt }}
                </van-checkbox>
              </van-checkbox-group>
            </div>
            
            <div v-if="q.type === 'text'" class="text-group">
              <van-field
                v-model="answers[q.id]"
                type="textarea"
                placeholder="请输入您的回答"
                rows="3"
              />
            </div>
          </div>
        </div>
        
        <div class="anonymous-section" @click="toggleAnonymous">
          <span>是否匿名</span>
          <van-switch v-model="isAnonymous" size="22" />
        </div>
        
        <div class="submit-section">
          <van-button type="primary" round block native-type="submit" :loading="submitting">提交问卷</van-button>
        </div>
      </van-form>
    </div>
    
    <div class="survey-completed" v-else-if="myResponse">
      <div class="completed-icon">
        <van-icon name="checked" color="#07c160" size="64" />
      </div>
      <h3>您已完成该问卷</h3>
      <p>感谢您的参与！</p>
      <van-button type="primary" round plain @click="router.back()">返回</van-button>
    </div>
    
    <van-loading v-if="!survey" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getSurveyDetail, submitSurveyResponse, getMyResponse } from '@/api/surveys'

const route = useRoute()
const router = useRouter()

const survey = ref(null)
const myResponse = ref(null)
const submitting = ref(false)
const isAnonymous = ref(false)
const answers = reactive({})

async function loadSurvey() {
  try {
    const [surveyRes, responseRes] = await Promise.all([
      getSurveyDetail(route.params.id),
      getMyResponse(route.params.id)
    ])
    survey.value = surveyRes.survey
    myResponse.value = responseRes.response
    
    if (!myResponse.value) {
      surveyRes.survey.questions.forEach(q => {
        if (q.type === 'checkbox') {
          answers[q.id] = []
        } else {
          answers[q.id] = ''
        }
      })
    }
  } catch (e) {
    console.error(e)
  }
}

function toggleAnonymous() {
  isAnonymous.value = !isAnonymous.value
}

async function submitSurvey() {
  submitting.value = true
  try {
    const submitData = {
      ...answers,
      isAnonymous: isAnonymous.value
    }
    await submitSurveyResponse(route.params.id, submitData)
    showToast('提交成功')
    myResponse.value = true
  } finally {
    submitting.value = false
  }
}

function onClickLeft() {
  router.back()
}

onMounted(() => {
  loadSurvey()
})
</script>

<style scoped lang="less">
.survey-content {
  padding: 10px;
}

.survey-header {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 10px;
  
  h3 {
    font-size: 18px;
    margin-bottom: 8px;
  }
  
  .survey-desc {
    font-size: 14px;
    color: #969799;
  }
}

.questions-section {
  background: #fff;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.question-item {
  margin-bottom: 25px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.question-title {
  font-size: 15px;
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
}

.question-num {
  color: #1989fa;
  font-weight: bold;
  margin-right: 5px;
}

.options-group {
  padding-left: 10px;
  
  :deep(.van-radio), :deep(.van-checkbox) {
    display: flex;
    margin-bottom: 12px;
  }
}

.text-group {
  padding-left: 10px;
}

.anonymous-section {
  background: #fff;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  color: #323233;
  cursor: pointer;
  
  &:active {
    opacity: 0.7;
  }
}

.submit-section {
  padding: 20px 10px;
}

.survey-completed {
  text-align: center;
  padding: 60px 20px;
  
  .completed-icon {
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 18px;
    margin-bottom: 10px;
  }
  
  p {
    color: #969799;
    margin-bottom: 30px;
  }
}
</style>
