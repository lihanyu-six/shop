import request from './request'

export interface ConsumptionRecord {
  id: number
  user_id: number
  employee_no: string
  card_no: string
  user_name: string
  department: string
  consumption_time: string
  amount: number
  balance: number
  serial_no: string
  machine_no: string
  created_at: string
}

export interface ConsumptionListParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export function getConsumptionList(params: ConsumptionListParams) {
  return request.get('/consumption', { params })
}

export function importConsumption(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/consumption/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
