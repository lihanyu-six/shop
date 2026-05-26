<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getNoticeList,
  createNotice,
  updateNotice,
  deleteNotice,
  type Notice,
  type NoticeFormData
} from '../api/notices'

const keyword = ref('')
const tableData = ref<Notice[]>([])
const loading = ref(false)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('发布公告')
const formRef = ref<FormInstance>()
const formData = reactive<NoticeFormData>({
  title: '',
  content: '',
  type: ''
})
const isEdit = ref(false)
const editId = ref<number | null>(null)

const formRules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ]
}

const noticeTypes = ['公告', '通知', '紧急']

const fetchNoticeList = async () => {
  loading.value = true
  try {
    const res = await getNoticeList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: keyword.value || undefined
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error) {
    console.error('获取公告列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchNoticeList()
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchNoticeList()
}

const handleCurrentChange = (val: number) => {
  pagination.current = val
  fetchNoticeList()
}

const resetForm = () => {
  formData.title = ''
  formData.content = ''
  formData.type = ''
  isEdit.value = false
  editId.value = null
}

const handleAdd = () => {
  resetForm()
  dialogTitle.value = '发布公告'
  dialogVisible.value = true
}

const handleEdit = (row: Notice) => {
  resetForm()
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑公告'
  formData.title = row.title
  formData.content = row.content
  formData.type = row.type || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value && editId.value) {
        await updateNotice(editId.value, {
          title: formData.title,
          content: formData.content,
          type: formData.type
        })
        ElMessage.success('编辑成功')
      } else {
        await createNotice({
          title: formData.title,
          content: formData.content,
          type: formData.type
        })
        ElMessage.success('发布成功')
      }
      dialogVisible.value = false
      fetchNoticeList()
    } catch (error) {
      console.error('操作失败:', error)
    }
  })
}

const handleDelete = (row: Notice) => {
  ElMessageBox.confirm('确定要删除该公告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteNotice(row.id)
      ElMessage.success('删除成功')
      fetchNoticeList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchNoticeList()
})
</script>

<template>
  <div class="notices-container">
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
        <el-button
          type="danger"
          @click="handleAdd"
        >
          发布公告
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
      <el-table-column prop="title" label="标题" min-width="180" align="center" />
      <el-table-column prop="type" label="类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.type === '紧急' ? 'danger' : row.type === '通知' ? 'warning' : 'info'">
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" min-width="200" align="center" show-overflow-tooltip />
      <el-table-column label="发告人" width="100" align="center">
        <template #default>
          admin
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="添加时间" width="180" align="center" />
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
      width="600px"
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
            <el-option
              v-for="type in noticeTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="5"
            placeholder="请输入内容"
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
.notices-container {
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
