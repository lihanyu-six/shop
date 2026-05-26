<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getFeedbackList,
  replyFeedback,
  type FeedbackItem
} from '../api/feedback'

const keyword = ref('')
const feedbackType = ref('')
const tableData = ref<FeedbackItem[]>([])
const loading = ref(false)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const replyDialogVisible = ref(false)
const replyFormRef = ref()
const currentReplyId = ref<number | null>(null)
const replyContent = ref('')
const imagePreviewVisible = ref(false)
const previewImages = ref<string[]>([])
const previewIndex = ref(0)

const feedbackTypeOptions = [
  { label: '类型1', value: '类型1' },
  { label: '类型2', value: '类型2' },
  { label: '类型3', value: '类型3' }
]

const fetchFeedbackList = async () => {
  loading.value = true
  try {
    const res = await getFeedbackList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: keyword.value || undefined,
      feedbackType: feedbackType.value || undefined
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error) {
    console.error('获取反馈列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchFeedbackList()
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchFeedbackList()
}

const handleCurrentChange = (val: number) => {
  pagination.current = val
  fetchFeedbackList()
}

const handlePreviewImage = (images: string[], index: number) => {
  if (!images || images.length === 0) return
  previewImages.value = images
  previewIndex.value = index
  imagePreviewVisible.value = true
}

const handleReply = (row: FeedbackItem) => {
  currentReplyId.value = row.id
  replyContent.value = row.replyContent || ''
  replyDialogVisible.value = true
}

const handleConfirmReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  if (currentReplyId.value === null) return
  
  try {
    await replyFeedback(currentReplyId.value, replyContent.value)
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    fetchFeedbackList()
  } catch (error) {
    console.error('回复失败:', error)
  }
}

onMounted(() => {
  fetchFeedbackList()
})
</script>

<template>
  <div class="feedback-container">
    <div class="operation-bar">
      <div class="search-group">
        <el-input
          v-model="keyword"
          placeholder="类型名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="feedbackType"
          placeholder="类型1"
          clearable
          style="width: 140px; margin-left: 12px"
          @change="handleSearch"
        >
          <el-option
            v-for="item in feedbackTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button type="primary" @click="handleSearch" style="margin-left: 12px">搜索</el-button>
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
      <el-table-column prop="name" label="姓名" width="80" align="center" />
      <el-table-column prop="department" label="部门" width="90" align="center" />
      <el-table-column prop="employeeNo" label="工号" width="80" align="center" />
      <el-table-column prop="feedbackType" label="反馈类型" width="90" align="center" />
      <el-table-column prop="content" label="反馈内容" min-width="160" align="center" show-overflow-tooltip />
      <el-table-column label="反馈图片" width="120" align="center">
        <template #default="{ row }">
          <div class="image-cell" v-if="row.images && row.images.length > 0">
            <el-image
              v-for="(img, idx) in row.images.slice(0, 2)"
              :key="idx"
              :src="img"
              :preview-src-list="row.images"
              :initial-index="idx"
              fit="cover"
              class="feedback-image"
              @click="handlePreviewImage(row.images!, idx)"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="反馈时间" width="170" align="center" />
      <el-table-column label="回复状态" width="90" align="center">
        <template #default="{ row }">
          <span :class="{ 'text-yes': row.replyStatus === 1, 'text-no': row.replyStatus !== 1 }">
            {{ row.replyStatus === 1 ? '是' : '否' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作栏" width="100" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            @click="handleReply(row)"
          >
            回复
          </el-button>
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
      v-model="replyDialogVisible"
      title="回复反馈"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="{ replyContent }" label-width="80px">
        <el-form-item label="回复内容">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmReply">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.feedback-container {
  background-color: #f0f2f5;
  padding: 20px;
  min-height: calc(100vh - 84px);
}

.operation-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 16px 20px;
  border-radius: 4px;
}

.search-group {
  display: flex;
  align-items: center;
}

.image-cell {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.feedback-image {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #e4e7ed;
}

.text-yes {
  color: #67c23a;
}

.text-no {
  color: #f56c6c;
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
