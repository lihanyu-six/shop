import request from './request'

export function submitFeedback(data) {
  return request.post('/feedback', data)
}

export function getFeedbackList() {
  return request.get('/feedback')
}

export function getFeedbackDetail(id) {
  return request.get(`/feedback/${id}`)
}
