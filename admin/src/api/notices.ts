import request from './request'

export interface Notice {
  id: number
  title: string
  content: string
  type: string
  status: number
  created_at: string
}

export interface NoticeListParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface NoticeFormData {
  title: string
  content: string
  type: string
}

export function getNoticeList(params: NoticeListParams) {
  return request.get('/admin/notices', { params })
}

export function createNotice(data: NoticeFormData) {
  return request.post('/admin/notices', data)
}

export function updateNotice(id: number, data: NoticeFormData) {
  return request.put(`/admin/notices/${id}`, data)
}

export function deleteNotice(id: number) {
  return request.delete(`/admin/notices/${id}`)
}
