<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search, Download } from '@element-plus/icons-vue'
import {
  getTodayStats,
  getOrderList,
  exportOrders,
  type TodayStats,
  type Order,
} from '@/api/statistics'

const loading = ref(false)
const refreshLoading = ref(false)
const exportLoading = ref(false)

const stats = reactive<TodayStats>({
  reservationCount: 0,
  breakfastSummary: {
    totalOrders: 0,
    totalAmount: 0,
    dishCount: 0,
  },
  lunchSummary: {
    totalOrders: 0,
    totalAmount: 0,
    dishCount: 0,
  },
})

const searchForm = reactive({
  keyword: '',
  mealType: '',
  department: '',
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const tableData = ref<Order[]>([])

const currentDate = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

async function fetchTodayStats() {
  try {
    const data = await getTodayStats()
    Object.assign(stats, data)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

async function fetchOrderList() {
  loading.value = true
  try {
    const data = await getOrderList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      mealType: searchForm.mealType || undefined,
    })
    tableData.value = data.list
    pagination.total = data.total
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.current = 1
  fetchOrderList()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.mealType = ''
  searchForm.department = ''
  pagination.current = 1
  fetchOrderList()
}

async function handleRefresh() {
  refreshLoading.value = true
  try {
    await Promise.all([fetchTodayStats(), fetchOrderList()])
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('刷新数据失败')
  } finally {
    refreshLoading.value = false
  }
}

async function handleExport() {
  exportLoading.value = true
  try {
    const blob = await exportOrders({
      keyword: searchForm.keyword || undefined,
      mealType: searchForm.mealType || undefined,
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `订餐数据导出_${new Date().toLocaleDateString('zh-CN')}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

function handlePageChange(page: number) {
  pagination.current = page
  fetchOrderList()
}

function handleSizeChange(size: number) {
  pagination.pageSize = size
  pagination.current = 1
  fetchOrderList()
}

function formatDishes(order: Order): string {
  if (!order.items || order.items.length === 0) return '-'
  return order.items
    .map((item) => {
      let text = item.dishName
      if (item.remark) {
        text += `（${item.remark}）`
      }
      text += `X${item.quantity}`
      return text
    })
    .join(', ')
}

function formatMealType(mealType: string): string {
  const map: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
  }
  return map[mealType] || mealType
}

onMounted(() => {
  fetchTodayStats()
  fetchOrderList()
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 顶部标题区域 -->
    <div class="header-section">
      <div class="header-left">
        <h2 class="page-title">今日统计概览</h2>
        <p class="update-time">当日最新数据实时同步（当前日期：{{ currentDate }}）</p>
      </div>
      <el-button type="primary" :icon="Refresh" :loading="refreshLoading" @click="handleRefresh">
        刷新数据
      </el-button>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <h3 class="stat-title">今日预定人数</h3>
            <p class="stat-number">{{ stats.reservationCount }}</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <h3 class="stat-title">早餐汇总（预定时间：00:00-07:00）</h3>
            <p class="stat-number">{{ stats.breakfastSummary.totalOrders }}</p>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <h3 class="stat-title">午餐汇总（预定时间：00:00-07:00）</h3>
            <p class="stat-number">{{ stats.lunchSummary.totalOrders }}</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card shadow="never" class="search-card">
      <div class="search-form">
        <el-input
          v-model="searchForm.keyword"
          placeholder="请输入姓名"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="searchForm.mealType" placeholder="所有" clearable style="width: 140px">
          <el-option label="早餐" value="breakfast" />
          <el-option label="午餐" value="lunch" />
          <el-option label="晚餐" value="dinner" />
        </el-select>
        <el-select v-model="searchForm.department" placeholder="所有部门" clearable style="width: 160px">
          <el-option label="部门1" value="部门1" />
          <el-option label="部门2" value="部门2" />
          <el-option label="部门3" value="部门3" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :icon="Download" :loading="exportLoading" @click="handleExport" class="export-btn">
          导出数据
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格区域 -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        empty-text="暂无数据"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="userName" label="姓名" width="100" align="center" />
        <el-table-column prop="department" label="部门" width="120" align="center" />
        <el-table-column prop="employeeNo" label="工号" width="100" align="center" />
        <el-table-column label="餐次类型" width="110" align="center">
          <template #default="{ row }">
            {{ formatMealType(row.mealType) }}
          </template>
        </el-table-column>
        <el-table-column label="菜品" min-width="250" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatDishes(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="菜品备注" width="120" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="pickCode" label="取餐码" width="100" align="center" />
        <el-table-column label="预定时间" width="180" align="center">
          <template #default="{ row }">
            {{ row.createdAt }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页区域 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  width: 100%;
}

/* 顶部标题区域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.update-time {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 统计卡片区域 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.stat-content {
  padding: 10px 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-title {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  margin: 0;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #409EFF;
  margin: 0;
  line-height: 1;
}

/* 搜索筛选区域 */
.search-card {
  margin-bottom: 20px;
}

.search-card :deep(.el-card__body) {
  padding: 20px;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.export-btn {
  margin-left: auto;
}

/* 数据表格区域 */
.table-card {
  margin-bottom: 20px;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

/* 分页区域 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .header-section {
    flex-direction: column;
    gap: 16px;
  }

  .search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .export-btn {
    margin-left: 0;
  }

  .page-title {
    font-size: 20px;
  }

  .stat-number {
    font-size: 28px;
  }
}
</style>
