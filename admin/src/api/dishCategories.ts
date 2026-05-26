import request from './request'

export interface DishCategory {
  id: number
  name: string
  sortOrder: number
  showInDailyMenu: number
  createdBy: string
  createdAt: string
}

export function getDishCategories(params?: { keyword?: string }): Promise<DishCategory[]> {
  return request.get('/dishes/categories', { params })
}

export function createDishCategory(data: {
  name: string
  sortOrder?: number
  showInDailyMenu?: boolean
}): Promise<{ id: number }> {
  return request.post('/dishes/categories', data)
}

export function updateDishCategory(id: number, data: Partial<{
  name: string
  sortOrder: number
  showInDailyMenu: boolean
}>): Promise<void> {
  return request.put(`/dishes/categories/${id}`, data)
}

export function deleteDishCategory(id: number): Promise<void> {
  return request.delete(`/dishes/categories/${id}`)
}
