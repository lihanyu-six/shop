import request from './request'

export interface DishItem {
  id: number
  name: string
  description: string
  detailDescription: string
  price: number
  image: string
  categoryId: number
  categoryName: string
  mealType: string
  status: number
  createdBy: string
  createdAt: string
}

export interface DishListParams {
  page?: number
  pageSize?: number
  keyword?: string
  categoryId?: number | string
  mealType?: string
}

export interface DishListResponse {
  list: DishItem[]
  total: number
  page: number
  pageSize: number
}

export function getDishList(params: DishListParams): Promise<DishListResponse> {
  return request.get('/admin/dishes', { params })
}

export function createDish(data: {
  name: string
  description?: string
  detailDescription?: string
  price: number
  image?: string
  categoryId: number
  mealType?: string
  status?: number
}): Promise<{ id: number }> {
  return request.post('/admin/dishes', data)
}

export function updateDish(id: number, data: Partial<{
  name: string
  description: string
  detailDescription: string
  price: number
  image: string
  categoryId: number
  mealType: string
  status: number
}>): Promise<void> {
  return request.put(`/admin/dishes/${id}`, data)
}

export function deleteDish(id: number): Promise<void> {
  return request.delete(`/admin/dishes/${id}`)
}
