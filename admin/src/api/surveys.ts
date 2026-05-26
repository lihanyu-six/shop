import request from './request'

export interface SurveyItem {
  id: number
  title: string
  description: string
  questions: any[]
  status: number
  statusText: string
  createdAt: string
  participantCount: number
}

export interface SurveyListParams {
  page?: number
  pageSize?: number
  status?: string | number
  startDate?: string
  endDate?: string
  keyword?: string
}

export interface SurveyListResponse {
  list: SurveyItem[]
  total: number
  page: number
  pageSize: number
}

export interface SurveyStatistics {
  survey: SurveyItem
  totalResponses: number
  statistics: Array<{
    question: string
    type: string
    options?: Record<string, number>
    answers?: string[]
  }>
}

export function getSurveyList(params: SurveyListParams): Promise<SurveyListResponse> {
  return request.get('/surveys/admin/list', { params })
}

export function getSurveyStatistics(id: number): Promise<SurveyStatistics> {
  return request.get(`/surveys/admin/${id}/statistics`)
}

export function exportSurveyData(id: number): Promise<any[]> {
  return request.get(`/surveys/admin/${id}/export`)
}

export function createSurvey(data: {
  title: string
  description?: string
  questions: any[]
  status?: number
}): Promise<{ id: number }> {
  return request.post('/surveys/admin', data)
}

export function updateSurvey(id: number, data: Partial<{
  title: string
  description: string
  questions: any[]
  status: number
}>): Promise<void> {
  return request.put(`/surveys/admin/${id}`, data)
}

export function deleteSurvey(id: number): Promise<void> {
  return request.delete(`/surveys/admin/${id}`)
}
