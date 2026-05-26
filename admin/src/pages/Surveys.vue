<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getSurveyList,
  getSurveyStatistics,
  exportSurveyData,
  type SurveyItem
} from '../api/surveys'

const statusFilter = ref('全部')
const startDate = ref('')
const endDate = ref('')
const keyword = ref('')
const tableData = ref<SurveyItem[]>([])
const loading = ref(false)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const statisticsDialogVisible = ref(false)
const statisticsData = ref<any>(null)
const statisticsLoading = ref(false)

const fetchSurveyList = async () => {
  loading.value = true
  try {
    const res = await getSurveyList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: statusFilter.value === '全部' ? undefined : statusFilter.value,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
      keyword: keyword.value || undefined
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error) {
    console.error('获取问卷列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchSurveyList()
}

const handleReset = () => {
  statusFilter.value = '全部'
  startDate.value = ''
  endDate.value = ''
  keyword.value = ''
  pagination.current = 1
  fetchSurveyList()
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchSurveyList()
}

const handleCurrentChange = (val: number) => {
  pagination.current = val
  fetchSurveyList()
}

const handleViewStatistics = async (row: SurveyItem) => {
  statisticsDialogVisible.value = true
  statisticsLoading.value = true
  
  try {
    const res = await getSurveyStatistics(row.id)
    statisticsData.value = res
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    statisticsLoading.value = false
  }
}

const handleExportData = async (row: SurveyItem) => {
  try {
    const data = await exportSurveyData(row.id)
    
    let csvContent = '\uFEFF'
    const headers = ['姓名', '部门', '工号', '提交时间']
    
    if (data.length > 0 && data[0].answers) {
      Object.keys(data[0].answers).forEach(key => {
        headers.push(`问题${key}`)
      })
    }
    
    csvContent += headers.join(',') + '\n'
    
    data.forEach(item => {
      const row = [
        item.name || '',
        item.department || '',
        item.employee_no || '',
        item.createdAt || ''
      ]
      
      if (item.answers) {
        Object.values(item.answers).forEach(val => {
          row.push(Array.isArray(val) ? val.join(';') : (val || ''))
        })
      }
      
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n'
    })
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${row.title}_数据导出_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  fetchSurveyList()
})
</script>

<template>
  <div class="surveys-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>内容管理</el-breadcrumb-item>
      <el-breadcrumb-item>问答管理</el-breadcrumb-item>
      <el-breadcrumb-item>问卷统计</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="operation-bar">
      <div class="filter-group">
        <span class="filter-label">问卷类型：</span>
        <el-select v-model="statusFilter" placeholder="全部" style="width: 120px" @change="handleSearch">
          <el-option label="全部" value="全部" />
          <el-option label="已发布" value="1" />
          <el-option label="草稿" value="0" />
        </el-select>

        <span class="filter-label" style="margin-left: 20px">发布时间：</span>
        <el-date-picker
          v-model="startDate"
          type="date"
          placeholder="年 / 月 / 日"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 150px"
          @change="handleSearch"
        />
        <span style="margin: 0 6px">至</span>
        <el-date-picker
          v-model="endDate"
          type="date"
          placeholder="年 / 月 / 日"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 150px"
          @change="handleSearch"
        />

        <span class="filter-label" style="margin-left: 20px">问卷名称：</span>
        <el-input
          v-model="keyword"
          placeholder="请输入问卷名称"
          clearable
          style="width: 180px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />

        <el-button type="primary" style="margin-left: 12px" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <el-table
      :data="tableData"
      v-loading="loading"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="title" label="问卷类型" min-width="160" align="center" show-overflow-tooltip />
      <el-table-column prop="description" label="问卷简介" min-width="180" align="center" show-overflow-tooltip />
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.statusText }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="发布时间" width="170" align="center" />
      <el-table-column prop="participantCount" label="参与人数" width="100" align="center" />
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleViewStatistics(row)">查看统计</el-button>
          <el-button type="primary" link @click="handleExportData(row)">导出数据</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="prev, pager, next, ->, total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
        <template #default>
          <button class="btn-prev">上一页</button>
          <ul class="el-pager"><li class="number active">1</li><li class="number">2</li></ul>
          <button class="btn-next">下一页</button>
        </template>
      </el-pagination>
    </div>

    <el-dialog
      v-model="statisticsDialogVisible"
      title="问卷统计详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-loading="statisticsLoading">
        <div v-if="statisticsData" class="statistics-content">
          <h4>{{ statisticsData.survey.title }}</h4>
          <p class="total-info">总参与人数：{{ statisticsData.totalResponses }} 人</p>
          
          <div v-for="(stat, index) in statisticsData.statistics" :key="index" class="stat-item">
            <h5>{{ index + 1 }}. {{ stat.question }}</h5>
            
            <div v-if="stat.type === 'radio' || stat.type === 'checkbox'" class="chart-container">
              <div v-for="(count, option) in stat.options" :key="option" class="bar-row">
                <span class="option-label">{{ option }}</span>
                <div class="bar-wrapper">
                  <div 
                    class="bar-fill" 
                    :style="{ width: statisticsData.totalResponses > 0 ? (count / statisticsData.totalResponses * 100) + '%' : '0%' }"
                  ></div>
                </div>
                <span class="option-count">{{ count }} 人</span>
              </div>
            </div>
            
            <div v-else-if="stat.type === 'text'" class="text-answers">
              <div v-for="(answer, idx) in (stat.answers || []).slice(0, 10)" :key="idx" class="answer-item">
                {{ idx + 1 }}. {{ answer }}
              </div>
              <p v-if="(stat.answers || []).length > 10">... 共 {{ stat.answers.length }} 条回答</p>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.surveys-container {
  background-color: #f0f2f5;
  padding: 20px;
  min-height: calc(100vh - 84px);
}

.operation-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 16px 20px;
  border-radius: 4px;
}

.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}

.statistics-content h4 {
  margin-bottom: 12px;
  color: #303133;
}

.total-info {
  color: #909399;
  margin-bottom: 20px;
}

.stat-item {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item h5 {
  margin-bottom: 12px;
  color: #409EFF;
  font-size: 15px;
}

.chart-container {
  padding-left: 8px;
}

.bar-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.option-label {
  width: 120px;
  font-size: 13px;
  color: #606266;
  text-align: right;
  padding-right: 12px;
}

.bar-wrapper {
  flex: 1;
  height: 24px;
  background-color: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background-color: #409EFF;
  transition: width 0.3s ease;
  min-width: 2px;
}

.option-count {
  width: 60px;
  font-size: 13px;
  color: #909399;
  padding-left: 12px;
}

.text-answers {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 4px;
}

.answer-item {
  padding: 8px 0;
  font-size: 13px;
  color: #606266;
  border-bottom: 1px dashed #e4e7ed;
}

.answer-item:last-child {
  border-bottom: none;
}
</style>
