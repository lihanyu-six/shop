<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getConsumptionList,
  importConsumption,
  type ConsumptionRecord
} from '../api/consumption'

const keyword = ref('')
const tableData = ref<ConsumptionRecord[]>([])
const loading = ref(false)
const importLoading = ref(false)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const fileInputRef = ref<HTMLInputElement>()

const fetchConsumptionList = async () => {
  loading.value = true
  try {
    const res = await getConsumptionList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: keyword.value || undefined
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error) {
    console.error('获取消费记录失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchConsumptionList()
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchConsumptionList()
}

const handleCurrentChange = (val: number) => {
  pagination.current = val
  fetchConsumptionList()
}

const handleImportClick = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.name.match(/\.(xls|xlsx)$/i)) {
    ElMessage.error('请上传Excel文件（.xls或.xlsx）')
    return
  }

  importLoading.value = true
  try {
    const res = await importConsumption(file)
    ElMessage.success(`导入成功，共导入 ${res.count} 条数据`)
    fetchConsumptionList()
  } catch (error) {
    console.error('导入失败:', error)
  } finally {
    importLoading.value = false
    if (input) {
      input.value = ''
    }
  }
}

onMounted(() => {
  fetchConsumptionList()
})
</script>

<template>
  <div class="consumption-container">
    <div class="operation-bar">
      <el-input
        v-model="keyword"
        placeholder="工号搜索"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <div class="button-group">
        <input
          ref="fileInputRef"
          type="file"
          accept=".xls,.xlsx"
          style="display: none"
          @change="handleFileChange"
        />
        <el-button
          type="danger"
          :loading="importLoading"
          @click="handleImportClick"
        >
          导入表格
        </el-button>
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
      <el-table-column prop="employee_no" label="工号" width="100" align="center" />
      <el-table-column prop="card_no" label="卡号" width="140" align="center" />
      <el-table-column prop="user_name" label="姓名" width="100" align="center" />
      <el-table-column prop="department" label="部门名称" width="120" align="center" />
      <el-table-column prop="consumption_time" label="消费时间" width="180" align="center" />
      <el-table-column prop="amount" label="消费金额" width="110" align="center">
        <template #default="{ row }">
          {{ row.amount?.toFixed(1) }}
        </template>
      </el-table-column>
      <el-table-column prop="balance" label="卡余额" width="110" align="center">
        <template #default="{ row }">
          {{ row.balance?.toFixed(1) }}
        </template>
      </el-table-column>
      <el-table-column prop="serial_no" label="卡流水号" width="120" align="center" />
      <el-table-column prop="machine_no" label="机号" width="80" align="center" />
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style scoped>
.consumption-container {
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
