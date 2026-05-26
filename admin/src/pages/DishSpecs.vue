<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getDishSpecList,
  createDishSpec,
  updateDishSpec,
  deleteDishSpec,
  type DishSpecItem
} from '../api/dishSpecs'
import { getDishList, type DishItem } from '../api/dishes'

const route = useRoute()

const keyword = ref('')
const tableData = ref<DishSpecItem[]>([])
const loading = ref(false)
const currentDishName = ref((route.query.dishName as string) || '')

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const dishOptions = ref<Array<{ id: number; name: string }>>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增规格')
const formRef = ref<FormInstance>()
const formData = reactive({
  dishId: '' as any,
  specName: '',
  specContent: ''
})
const isEdit = ref(false)
const editId = ref<number | null>(null)

const formRules: FormRules = {
  dishId: [{ required: true, message: '请选择菜品', trigger: 'change' }],
  specName: [{ required: true, message: '请输入规格名称', trigger: 'blur' }],
  specContent: [{ required: true, message: '请输入规格内容', trigger: 'blur' }]
}

const fetchDishOptions = async () => {
  try {
    const res = await getDishList({ pageSize: 100 })
    dishOptions.value = res.list.map(d => ({ id: d.id, name: d.name }))
  } catch (error) {
    console.error('获取菜品列表失败:', error)
  }
}

const fetchList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: keyword.value || undefined
    }

    if (route.query.dishId) {
      params.dishId = route.query.dishId
    }

    const res = await getDishSpecList(params)
    tableData.value = res.list
    pagination.total = res.total
  } catch (error) {
    console.error('获取规格列表失败:', error)
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
  formData.dishId = route.query.dishId ? String(route.query.dishId) : ''
  formData.specName = ''
  formData.specContent = ''
  isEdit.value = false
  editId.value = null
}

const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增规格'
  dialogVisible.value = true
}

const handleEdit = (row: DishSpecItem) => {
  resetForm()
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑规格'
  formData.dishId = row.dish_id
  formData.specName = row.spec_name
  formData.specContent = row.spec_content
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value && editId.value) {
        await updateDishSpec(editId.value, {
          specName: formData.specName,
          specContent: formData.specContent
        })
        ElMessage.success('编辑成功')
      } else {
        await createDishSpec({
          dishId: parseInt(formData.dishId),
          specName: formData.specName,
          specContent: formData.specContent
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

const handleDelete = (row: DishSpecItem) => {
  ElMessageBox.confirm('确定要删除该规格吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteDishSpec(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchDishOptions()
  fetchList()
})
</script>

<template>
  <div class="specs-container">
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
        <el-button type="primary" @click="handleAdd">新增规格</el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="dishName" label="菜品名称" min-width="110" align="center" />
      <el-table-column prop="spec_name" label="规格名称" width="100" align="center" />
      <el-table-column prop="spec_content" label="规格内容" min-width="150" align="center" show-overflow-tooltip />
      <el-table-column prop="created_at" label="添加时间" width="170" align="center" />
      <el-table-column label="添加人" width="80" align="center">
        <template #default>admin</template>
      </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :close-on-click-modal="false" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="菜品" prop="dishId">
          <el-select v-model="formData.dishId" placeholder="请选择菜品" style="width: 100%" filterable>
            <el-option v-for="item in dishOptions" :key="item.id" :label="item.name" :value="String(item.id)" />
          </el-select>
        </el-form-item>
        <el-form-item label="规格名称" prop="specName">
          <el-input v-model="formData.specName" placeholder="如：口味、辣度、分量等" />
        </el-form-item>
        <el-form-item label="规格内容" prop="specContent">
          <el-input v-model="formData.specContent" type="textarea" :rows="3" placeholder="如：清淡、少辣、微辣（多个用逗号分隔）" />
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
.specs-container {
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
