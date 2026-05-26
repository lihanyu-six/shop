<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  importUsers,
  exportUsers,
  type User
} from '../api/users'

const keyword = ref('')
const tableData = ref<User[]>([])
const loading = ref(false)
const importLoading = ref(false)
const exportLoading = ref(false)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增人员')
const formRef = ref<FormInstance>()
const formData = reactive({
  name: '',
  department: '',
  employeeNo: '',
  phone: ''
})
const isEdit = ref(false)
const editId = ref<number | null>(null)

const fileInputRef = ref<HTMLInputElement>()

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请输入部门', trigger: 'blur' }
  ],
  employeeNo: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { pattern: /^[0-9]+$/, message: '工号必须为数字', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
}

const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: keyword.value || undefined
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchUserList()
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchUserList()
}

const handleCurrentChange = (val: number) => {
  pagination.current = val
  fetchUserList()
}

const resetForm = () => {
  formData.name = ''
  formData.department = ''
  formData.employeeNo = ''
  formData.phone = ''
  isEdit.value = false
  editId.value = null
}

const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增人员'
  dialogVisible.value = true
}

const handleEdit = (row: User) => {
  resetForm()
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑人员'
  formData.name = row.name
  formData.department = row.department || ''
  formData.employeeNo = row.employeeNo || ''
  formData.phone = row.phone
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value && editId.value) {
        await updateUser(editId.value, {
          name: formData.name,
          department: formData.department,
          employeeNo: formData.employeeNo,
          phone: formData.phone
        })
        ElMessage.success('编辑成功')
      } else {
        await createUser({
          name: formData.name,
          department: formData.department,
          employeeNo: formData.employeeNo,
          phone: formData.phone
        })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      fetchUserList()
    } catch (error) {
      console.error('操作失败:', error)
    }
  })
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm('确定要删除该人员吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      fetchUserList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleStatusChange = async (row: User) => {
  try {
    const newStatus = !row.loginDisabled
    await toggleUserStatus(row.id, newStatus)
    ElMessage.success(newStatus ? '已启用' : '已禁用')
    fetchUserList()
  } catch (error) {
    console.error('状态切换失败:', error)
    fetchUserList()
  }
}

const handleImportClick = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  importLoading.value = true
  try {
    const res = await importUsers(file)
    ElMessage.success(`导入成功，共导入 ${res.count} 条数据`)
    fetchUserList()
  } catch (error) {
    console.error('导入失败:', error)
  } finally {
    importLoading.value = false
    if (input) {
      input.value = ''
    }
  }
}

const handleExport = async () => {
  exportLoading.value = true
  try {
    const blob = await exportUsers({
      keyword: keyword.value || undefined
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `人员列表_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  fetchUserList()
})
</script>

<template>
  <div class="users-container">
    <div class="operation-bar">
      <el-input
        v-model="keyword"
        placeholder="类型名称"
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
          导入
        </el-button>
        <el-button
          type="danger"
          :loading="exportLoading"
          @click="handleExport"
        >
          导出
        </el-button>
        <el-button
          type="danger"
          @click="handleAdd"
        >
          新增人员
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
      <el-table-column prop="name" label="姓名" min-width="100" align="center" />
      <el-table-column prop="department" label="部门" min-width="120" align="center" />
      <el-table-column prop="employeeNo" label="工号" width="100" align="center" />
      <el-table-column prop="phone" label="手机号码" width="140" align="center" />
      <el-table-column label="添加人" width="100" align="center">
        <template #default>
          admin
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="添加时间" width="180" align="center" />
      <el-table-column label="是否启用" width="100" align="center">
        <template #default="{ row }">
          <el-switch
            :model-value="!row.loginDisabled"
            active-color="#67C23A"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作栏" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            link
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
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
        label-width="80px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="工号" prop="employeeNo">
          <el-input v-model="formData.employeeNo" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号码" maxlength="11" />
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
.users-container {
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
