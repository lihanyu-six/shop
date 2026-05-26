import request from './request'

export interface FeedbackItem {
  id: number
  feedbackType: string
  content: string
  images: string[] | null
  replyStatus: number
  replyContent: string | null
  replyTime: string | null
  createdAt: string
  name: string
  department: string
  employeeNo: string
}

export interface FeedbackListParams {
  page?: number
  pageSize?: number
  keyword?: string
  feedbackType?: string
}

export interface FeedbackListResponse {
  list: FeedbackItem[]
  total: number
  page: number
  pageSize: number
}

export function getFeedbackList(params: FeedbackListParams): Promise<FeedbackListResponse> {
  return request.get('/feedback/admin/list', { params })
}

export function replyFeedback(id: number, replyContent: string): Promise<{ message: string }> {
  return request.post(`/feedback/admin/${id}/reply`, { replyContent })
}
