<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getDishList,
  createDish,
  updateDish,
  deleteDish,
  type DishItem
} from '../api/dishes'
import { getDishCategories } from '../api/dishCategories'

const router = useRouter()

const keyword = ref('')
const categoryIdFilter = ref('')
const mealTypeFilter = ref('')
const tableData = ref<DishItem[]>([])
const loading = ref(false)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const categoryOptions = ref<Array<{ id: number; name: string }>>([])
const mealTypeOptions = ['早餐', '午餐', '晚餐']

const dialogVisible = ref(false)
const dialogTitle = ref('新增菜品')
const formRef = ref<FormInstance>()
const formData = reactive({
  name: '',
  description: '',
  detailDescription: '',
  price: '' as any,
  image: '',
  categoryId: '' as any,
  mealType: ''
})
const isEdit = ref(false)
const editId = ref<number | null>(null)

const formRules: FormRules = {
  name: [{ required: true, message: '请输入菜品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择类别', trigger: 'change' }]
}

const fetchCategories = async () => {
  try {
    const res = await getDishCategories()
    categoryOptions.value = res.map(c => ({ id: c.id, name: c.name }))
  } catch (error) {
    console.error('获取类别列表失败:', error)
  }
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getDishList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: keyword.value || undefined,
      categoryId: categoryIdFilter.value || undefined,
      mealType: mealTypeFilter.value || undefined
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error) {
    console.error('获取菜品列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchList()
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchList()
}

const handleCurrentChange = (val: number) => {
  pagination.current = val
  fetchList()
}

const resetForm = () => {
  formData.name = ''
  formData.description = ''
  formData.detailDescription = ''
  formData.price = ''
  formData.image = ''
  formData.categoryId = ''
  formData.mealType = ''
  isEdit.value = false
  editId.value = null
}

const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增菜品'
  dialogVisible.value = true
}

const handleEdit = (row: DishItem) => {
  resetForm()
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑菜品'
  formData.name = row.name
  formData.description = row.description || ''
  formData.detailDescription = row.detail_description || ''
  formData.price = row.price
  formData.image = row.image || ''
  formData.categoryId = row.category_id
  formData.mealType = row.meal_type || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        detailDescription: formData.detailDescription,
        price: parseFloat(formData.price),
        image: formData.image,
        categoryId: parseInt(formData.categoryId),
        mealType: formData.mealType
      }

      if (isEdit.value && editId.value) {
        await updateDish(editId.value, data)
        ElMessage.success('编辑成功')
      } else {
        await createDish(data)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      fetchList()
    } catch (error) {
      console.error('操作失败:', error)
    }
  })
}

const handleDelete = (row: DishItem) => {
  ElMessageBox.confirm('确定要删除该菜品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteDish(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleSpecManage = (row: DishItem) => {
  router.push({ path: '/dish-specs', query: { dishId: row.id, dishName: row.name } })
}

onMounted(() => {
  fetchCategories()
  fetchList()
})
</script>

<template>
  <div class="dishes-container">
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
        <el-button type="primary" @click="handleAdd">新增菜品</el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="name" label="菜品名称" min-width="110" align="center" />
      <el-table-column label="图片" width="90" align="center">
        <template #default="{ row }">
          <el-image
            v-if="row.image"
            :src="row.image"
            :preview-src-list="[row.image]"
            :preview-teleported="true"
            fit="cover"
            style="width: 40px; height: 40px; border-radius: 4px;"
          >
            <template #error>
              <div class="image-error">无图</div>
            </template>
            <template #placeholder>
              <div class="image-loading">...</div>
            </template>
          </el-image>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="简介" min-width="120" align="center" show-overflow-tooltip />
      <el-table-column prop="detail_description" label="详细介绍" min-width="130" align="center" show-overflow-tooltip />
      <el-table-column prop="meal_type" label="类型" width="80" align="center" />
      <el-table-column prop="categoryName" label="类别" width="80" align="center" />
      <el-table-column prop="created_at" label="添加时间" width="170" align="center" />
      <el-table-column label="添加人" width="80" align="center">
        <template #default>admin</template>
      </el-table-column>
      <el-table-column label="操作栏" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleSpecManage(row)">菜品规格</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜品名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" placeholder="价格" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型">
              <el-select v-model="formData.mealType" placeholder="选择类型" style="width: 100%">
                <el-option v-for="item in mealTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="类别" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="请选择类别" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="详细介绍">
          <el-input v-model="formData.detailDescription" type="textarea" :rows="3" placeholder="请输入详细介绍" />
        </el-form-item>
        <el-form-item label="图片URL">
          <el-input v-model="formData.image" placeholder="请输入图片地址" />
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
.dishes-container {
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

.image-error,
.image-loading {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 12px;
  border-radius: 4px;
}

:deep(.el-image-viewer__wrapper) {
  z-index: 3000 !important;
}
</style>
