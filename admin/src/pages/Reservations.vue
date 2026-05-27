<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getOrderList,
  updateOrderStatus,
  type OrderRecord
} from '../api/orders'

const keyword = ref('')
const filterStatus = ref('')
const filterMealType = ref('')
const filterOrderDate = ref('')
const tableData = ref<OrderRecord[]>([])
const loading = ref(false)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const detailVisible = ref(false)
const detailData = ref<OrderRecord | null>(null)

const mealTypeMap: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐'
}

const statusMap: Record<string, { text: string; type: string }> = {
  pending: { text: '待取餐', type: 'warning' },
  confirmed: { text: '已取餐', type: 'success' },
  picked: { text: '已取餐', type: 'success' },
  cancelled: { text: '已取消', type: 'info' }
}

const fetchOrderList = async () => {
  loading.value = true
  try {
    const res = await getOrderList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: keyword.value || undefined,
      status: filterStatus.value || undefined,
      mealType: filterMealType.value || undefined,
      orderDate: filterOrderDate.value || undefined
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchOrderList()
}

const handleReset = () => {
  keyword.value = ''
  filterStatus.value = ''
  filterMealType.value = ''
  filterOrderDate.value = ''
  pagination.current = 1
  fetchOrderList()
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchOrderList()
}

const handleCurrentChange = (val: number) => {
  pagination.current = val
  fetchOrderList()
}

const handleDetail = (row: OrderRecord) => {
  detailData.value = row
  detailVisible.value = true
}

const handleStatusChange = (row: OrderRecord, newStatus: string) => {
  const statusText = statusMap[newStatus]?.text || newStatus
  ElMessageBox.confirm(`确定将此订单状态改为"${statusText}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateOrderStatus(row.id, newStatus)
      ElMessage.success('状态更新成功')
      fetchOrderList()
    } catch (error) {
      console.error('更新状态失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchOrderList()
})
</script>

<template>
  <div class="reservations-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>预约管理</el-breadcrumb-item>
      <el-breadcrumb-item>预订订单</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="operation-bar">
      <div class="filter-group">
        <el-input
          v-model="keyword"
          placeholder="姓名/工号/订单号/取餐码"
          clearable
          style="width: 220px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select v-model="filterMealType" placeholder="餐类" clearable style="width: 100px" @change="handleSearch">
          <el-option label="早餐" value="breakfast" />
          <el-option label="午餐" value="lunch" />
          <el-option label="晚餐" value="dinner" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 100px" @change="handleSearch">
          <el-option label="待取餐" value="pending" />
          <el-option label="已取餐" value="confirmed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-date-picker
          v-model="filterOrderDate"
          type="date"
          placeholder="预定日期"
          value-format="YYYY-MM-DD"
          style="width: 150px"
          @change="handleSearch"
        />
      </div>
      <div class="button-group">
        <el-button type="primary" @click="handleSearch">搜索</el-button>
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
      <el-table-column prop="order_no" label="订单号" width="170" align="center" show-overflow-tooltip />
      <el-table-column prop="user_name" label="预订人" width="80" align="center" />
      <el-table-column prop="department" label="部门" width="90" align="center" show-overflow-tooltip />
      <el-table-column prop="employee_no" label="工号" width="80" align="center" />
      <el-table-column label="餐类" width="70" align="center">
        <template #default="{ row }">
          {{ mealTypeMap[row.meal_type] || row.meal_type }}
        </template>
      </el-table-column>
      <el-table-column prop="order_date" label="预定日期" width="110" align="center" />
      <el-table-column prop="pick_code" label="取餐码" width="80" align="center" />
      <el-table-column label="菜品" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.items?.map((i: any) => `${i.dish_name}x${i.quantity}`).join('、') || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="金额" width="70" align="center">
        <template #default="{ row }">
          ¥{{ row.total_amount?.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="(statusMap[row.status]?.type || 'info') as any" size="small">
            {{ statusMap[row.status]?.text || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="下单时间" width="170" align="center" />
      <el-table-column label="操作" width="140" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
          <el-dropdown v-if="row.status === 'pending'" trigger="click" @command="(cmd: string) => handleStatusChange(row, cmd)">
            <el-button type="success" link>取餐</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="confirmed">确认取餐</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button v-if="row.status === 'pending'" type="danger" link @click="handleStatusChange(row, 'cancelled')">取消</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="550px"
    >
      <template v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ detailData.order_no }}</el-descriptions-item>
          <el-descriptions-item label="取餐码">{{ detailData.pick_code }}</el-descriptions-item>
          <el-descriptions-item label="预订人">{{ detailData.user_name }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ detailData.department }}</el-descriptions-item>
          <el-descriptions-item label="工号">{{ detailData.employee_no }}</el-descriptions-item>
          <el-descriptions-item label="餐类">{{ mealTypeMap[detailData.meal_type] || detailData.meal_type }}</el-descriptions-item>
          <el-descriptions-item label="预定日期">{{ detailData.order_date }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="(statusMap[detailData.status]?.type || 'info') as any" size="small">
              {{ statusMap[detailData.status]?.text || detailData.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="下单时间" :span="2">{{ detailData.createdAt }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 16px 0 8px">菜品明细</h4>
        <el-table :data="detailData.items" border size="small">
          <el-table-column prop="dish_name" label="菜品" />
          <el-table-column prop="price" label="单价" width="80" align="center">
            <template #default="{ row }">¥{{ row.price?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="60" align="center" />
          <el-table-column label="小计" width="80" align="center">
            <template #default="{ row }">¥{{ (row.price * row.quantity)?.toFixed(2) }}</template>
          </el-table-column>
        </el-table>
        <div style="text-align: right; margin-top: 8px; font-weight: bold">
          合计：¥{{ detailData.total_amount?.toFixed(2) }}
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.reservations-container {
  background-color: #f0f2f5;
  padding: 20px;
  min-height: calc(100vh - 84px);
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 16px 20px;
  border-radius: 4px;
}

.filter-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.button-group {
  display: flex;
  gap: 10px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 4px;
}
</style>
