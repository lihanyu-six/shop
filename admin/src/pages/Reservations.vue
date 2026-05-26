<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getReservationList,
  createReservation,
  updateReservation,
  deleteReservation,
  type ReservationItem
} from '../api/reservations'

const keyword = ref('')
const tableData = ref<ReservationItem[]>([])
const loading = ref(false)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增预约')
const formRef = ref<FormInstance>()
const formData = reactive({
  category: '',
  timeSlot: '当日',
  startTime: '',
  endTime: ''
})
const isEdit = ref(false)
const editId = ref<number | null>(null)

const formRules: FormRules = {
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  timeSlot: [{ required: true, message: '请选择预约时间难度', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const categoryOptions = ['早餐', '午餐', '晚餐']
const timeSlotOptions = ['前一天', '当日']

const fetchReservationList = async () => {
  loading.value = true
  try {
    const res = await getReservationList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: keyword.value || undefined
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error) {
    console.error('获取预约列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchReservationList()
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchReservationList()
}

const handleCurrentChange = (val: number) => {
  pagination.current = val
  fetchReservationList()
}

const resetForm = () => {
  formData.category = ''
  formData.timeSlot = '当日'
  formData.startTime = ''
  formData.endTime = ''
  isEdit.value = false
  editId.value = null
}

const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增预约'
  dialogVisible.value = true
}

const handleEdit = (row: ReservationItem) => {
  resetForm()
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑预约'
  formData.category = row.category
  formData.timeSlot = row.timeSlot
  formData.startTime = row.startTime
  formData.endTime = row.endTime
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value && editId.value) {
        await updateReservation(editId.value, {
          category: formData.category,
          timeSlot: formData.timeSlot,
          startTime: formData.startTime,
          endTime: formData.endTime
        })
        ElMessage.success('编辑成功')
      } else {
        await createReservation({
          category: formData.category,
          timeSlot: formData.timeSlot,
          startTime: formData.startTime,
          endTime: formData.endTime
        })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      fetchReservationList()
    } catch (error) {
      console.error('操作失败:', error)
    }
  })
}

const handleDelete = (row: ReservationItem) => {
  ElMessageBox.confirm('确定要删除该预约记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteReservation(row.id)
      ElMessage.success('删除成功')
      fetchReservationList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchReservationList()
})
</script>

<template>
  <div class="reservations-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>预约管理</el-breadcrumb-item>
      <el-breadcrumb-item>预订订单</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="warning-bar">
      <el-icon><InfoFilled /></el-icon>
      <span>早餐、午餐类只只需配置一条记录！！！否则按最新一条记录取值</span>
    </div>

    <div class="operation-bar">
      <el-input
        v-model="keyword"
        placeholder="类型名称"
        clearable
        style="width: 200px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <div class="button-group">
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="info" @click="handleSearch">导出</el-button>
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
      <el-table-column prop="category" label="类别" width="90" align="center" />
      <el-table-column prop="timeSlot" label="预约时间段量" width="120" align="center" />
      <el-table-column label="预约时间" width="140" align="center">
        <template #default="{ row }">
          {{ row.startTime }} - {{ row.endTime }}
        </template>
      </el-table-column>
      <el-table-column prop="createdBy" label="添加人" width="90" align="center" />
      <el-table-column prop="createdAt" label="添加时间" width="170" align="center" />
      <el-table-column label="操作栏" width="140" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="类别" prop="category">
          <el-select v-model="formData.category" placeholder="请选择类别" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预约时间段量" prop="timeSlot">
          <el-select v-model="formData.timeSlot" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in timeSlotOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker
            v-model="formData.startTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker
            v-model="formData.endTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
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

.warning-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 14px;
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
