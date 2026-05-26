import request from './request'

export interface ReservationItem {
  id: number
  category: string
  timeSlot: string
  startTime: string
  endTime: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ReservationListParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface ReservationListResponse {
  list: ReservationItem[]
  total: number
  page: number
  pageSize: number
}

export interface ReservationSetting {
  id: number
  mealType: string
  advanceDays: string
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
}

export function getReservationList(params: ReservationListParams): Promise<ReservationListResponse> {
  return request.get('/reservations/list', { params })
}

export function createReservation(data: {
  category: string
  timeSlot: string
  startTime: string
  endTime: string
  createdBy?: string
}): Promise<{ id: number }> {
  return request.post('/reservations', data)
}

export function updateReservation(id: number, data: {
  category: string
  timeSlot: string
  startTime: string
  endTime: string
}): Promise<void> {
  return request.put(`/reservations/${id}`, data)
}

export function deleteReservation(id: number): Promise<void> {
  return request.delete(`/reservations/${id}`)
}

export function getReservationSettings(): Promise<ReservationSetting[]> {
  return request.get('/reservations/settings')
}

export function saveReservationSettings(settings: Array<{
  mealType: string
  advanceDays: string
  startTime: string
  endTime: string
}>): Promise<void> {
  return request.post('/reservations/settings', { settings })
}
