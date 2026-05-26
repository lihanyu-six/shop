import request from './request'

export function getNotices() {
  return request.get('/notices')
}

export function getNoticeDetail(id) {
  return request.get(`/notices/${id}`)
}
