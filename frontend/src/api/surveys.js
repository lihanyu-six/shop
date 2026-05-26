import request from './request'

export function getSurveys() {
  return request.get('/surveys')
}

export function getSurveyDetail(id) {
  return request.get(`/surveys/${id}`)
}

export function submitSurveyResponse(id, answers) {
  return request.post(`/surveys/${id}/responses`, { answers })
}

export function getMyResponse(id) {
  return request.get(`/surveys/${id}/my-response`)
}
