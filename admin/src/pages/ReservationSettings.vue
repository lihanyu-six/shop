<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getReservationSettings,
  saveReservationSettings,
  type ReservationSetting
} from '../api/reservations'

const loading = ref(false)
const saving = ref(false)

const formSettings = reactive<Array<{
  mealType: string
  advanceDays: string
  startTime: string
  endTime: string
}>>([
  {
    mealType: '早餐',
    advanceDays: '前一天',
    startTime: '12:00',
    endTime: '17:00'
  },
  {
    mealType: '中餐',
    advanceDays: '当日',
    startTime: '08:00',
    endTime: '11:00'
  }
])

const advanceDayOptions = ['前一天', '当日', '前两天']

const fetchSettings = async () => {
  loading.value = true
  try {
    const data = await getReservationSettings()
    
    if (data && data.length > 0) {
      const breakfast = data.find(s => s.mealType === '早餐')
      const lunch = data.find(s => s.mealType === '中餐' || s.mealType === '午餐')
      const dinner = data.find(s => s.mealType === '晚餐')

      if (breakfast) {
        formSettings[0].advanceDays = breakfast.advanceDays || '前一天'
        formSettings[0].startTime = breakfast.startTime || '12:00'
        formSettings[0].endTime = breakfast.endTime || '17:00'
      }

      if (lunch && formSettings[1]) {
        formSettings[1].mealType = lunch.mealType
        formSettings[1].advanceDays = lunch.advanceDays || '当日'
        formSettings[1].startTime = lunch.startTime || '08:00'
        formSettings[1].endTime = lunch.endTime || '11:00'
      }

      if (dinner) {
        if (!formSettings.find(s => s.mealType === '晚餐')) {
          formSettings.push({
            mealType: '晚餐',
            advanceDays: dinner.advanceDays || '当日',
            startTime: dinner.startTime || '14:00',
            endTime: dinner.endTime || '17:00'
          })
        }
      }
    }
  } catch (error) {
    console.error('获取设置失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSaveSettings = async () => {
  saving.value = true
  
  try {
    await saveReservationSettings(formSettings.map(s => ({
      mealType: s.mealType,
      advanceDays: s.advanceDays,
      startTime: s.startTime,
      endTime: s.endTime
    })))
    ElMessage.success('保存设置成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<template>
  <div class="settings-container">
    <div class="settings-card">
      <div class="card-header">
        <el-icon class="header-icon"><InfoFilled /></el-icon>
        <span>预约时段规则设置</span>
      </div>

      <div v-loading="loading" class="settings-content">
        <div 
          v-for="(setting, index) in formSettings" 
          :key="index"
          class="setting-section"
        >
          <h3 class="section-title">{{ setting.mealType }}预约设置</h3>
          
          <el-form label-width="120px" class="setting-form">
            <el-form-item label="预约时间难度">
              <el-select v-model="setting.advanceDays" style="width: 100%">
                <el-option
                  v-for="item in advanceDayOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>

            <div class="time-row">
              <div class="time-field">
                <label class="field-label">开始时间</label>
                <el-time-picker
                  v-model="setting.startTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="选择开始时间"
                  style="width: 100%"
                />
              </div>
              <div class="time-field">
                <label class="field-label">结束时间</label>
                <el-time-picker
                  v-model="setting.endTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="选择结束时间"
                  style="width: 100%"
                />
              </div>
            </div>
          </el-form>
        </div>

        <div class="save-wrapper">
          <el-button 
            type="primary" 
            :loading="saving"
            @click="handleSaveSettings"
          >
            <el-icon><Check /></el-icon>
            保存设置
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  background-color: #f0f2f5;
  padding: 20px;
  min-height: calc(100vh - 84px);
}

.settings-card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
}

.header-icon {
  font-size: 18px;
}

.settings-content {
  padding: 24px;
}

.setting-section {
  margin-bottom: 32px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.setting-section:last-of-type {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.setting-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.time-row {
  display: flex;
  gap: 32px;
}

.time-field {
  flex: 1;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.save-wrapper {
  display: flex;
  justify-content: flex-start;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style>
