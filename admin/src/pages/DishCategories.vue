<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getDishCategories,
  createDishCategory,
  updateDishCategory,
  deleteDishCategory,
  type DishCategory
} from '../api/dishCategories'

const keyword = ref('')
const tableData = ref<DishCategory[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('新增类别')
const formRef = ref<FormInstance>()
const formData = reactive({
  name: '',
  showInDailyMenu: true
})
const isEdit = ref(false)
const editId = ref<number | null>(null)

const formRules: FormRules = {
  name: [{ required: true, message: '请输入类别名称', trigger: 'blur' }]
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getDishCategories({ keyword: keyword.value || undefined })
    tableData.value = res
  } catch (error) {
    console.error('获取类别列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchList()
}

const resetForm = () => {
  formData.name = ''
  formData.showInDailyMenu = true
  isEdit.value = false
  editId.value = null
}

const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增类别'
  dialogVisible.value = true
}

const handleEdit = (row: DishCategory) => {
  resetForm()
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑类别'
  formData.name = row.name
  formData.showInDailyMenu = !!row.showInDailyMenu
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value && editId.value) {
        await updateDishCategory(editId.value, {
          name: formData.name,
          showInDailyMenu: formData.showInDailyMenu
        })
        ElMessage.success('编辑成功')
      } else {
        await createDishCategory({
          name: formData.name,
          showInDailyMenu: formData.showInDailyMenu
        })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      fetchList()
    } catch (error) {
      console.error('操作失败:', error)
    }
  })
}

const handleDelete = (row: DishCategory) => {
  ElMessageBox.confirm('确定要删除该类别吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteDishCategory(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error: any) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleShowChange = async (row: DishCategory, value: boolean) => {
  try {
    await updateDishCategory(row.id, { showInDailyMenu: value })
    ElMessage.success(value ? '已开启展示' : '已关闭展示')
    fetchList()
  } catch (error) {
    console.error('更新状态失败:', error)
    fetchList()
  }
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="categories-container">
    <div class="operation-bar">
      <el-input
        v-model="keyword"
        placeholder="类型名称"
        clearable
        style="width: 200px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <div class="button-group">
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="name" label="类别名称" min-width="120" align="center" />
      <el-table-column prop="createdBy" label="添加人" width="100" align="center">
        <template #default>admin</template>
      </el-table-column>
      <el-table-column prop="createdAt" label="添加时间" width="180" align="center" />
      <el-table-column label="是否展示在每日菜单" width="180" align="center">
        <template #default="{ row }">
          <el-switch
            :model-value="!!row.showInDailyMenu"
            active-color="#67C23A"
            @change="(val: boolean) => handleShowChange(row, val)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作栏" width="140" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="450px" :close-on-click-modal="false" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px">
        <el-form-item label="类别名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入类别名称" />
        </el-form-item>
        <el-form-item label="是否展示在每日菜单">
          <el-switch v-model="formData.showInDailyMenu" active-color="#67C23A" />
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
.categories-container {
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
</style>
