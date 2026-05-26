import request from './request'

export interface DishSpecItem {
  id: number
  dishId: number
  dishName: string
  specName: string
  specContent: string
  createdBy: string
  createdAt: string
}

export interface DishSpecListParams {
  page?: number
  pageSize?: number
  keyword?: string
  dishId?: number | string
}

export interface DishSpecListResponse {
  list: DishSpecItem[]
  total: number
  page: number
  pageSize: number
}

export function getDishSpecList(params: DishSpecListParams): Promise<DishSpecListResponse> {
  return request.get('/dish-specs', { params })
}

export function createDishSpec(data: {
  dishId: number
  specName: string
  specContent: string
}): Promise<{ id: number }> {
  return request.post('/dish-specs', data)
}

export function updateDishSpec(id: number, data: {
  specName: string
  specContent: string
}): Promise<void> {
  return request.put(`/dish-specs/${id}`, data)
}

export function deleteDishSpec(id: number): Promise<void> {
  return request.delete(`/dish-specs/${id}`)
}
