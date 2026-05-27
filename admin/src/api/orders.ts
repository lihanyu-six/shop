import request from './request'

export interface OrderItem {
  id: number
  dish_id: number
  dish_name: string
  price: number
  quantity: number
  remark: string
  image: string
}

export interface OrderRecord {
  id: number
  user_id: number
  order_no: string
  meal_type: string
  order_date: string
  pick_code: string
  total_amount: number
  status: string
  remark: string
  user_name: string
  department: string
  employee_no: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface OrderListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  mealType?: string
  orderDate?: string
}

export interface OrderListResponse {
  list: OrderRecord[]
  total: number
  page: number
  pageSize: number
}

export function getOrderList(params: OrderListParams): Promise<OrderListResponse> {
  return request.get('/admin/orders/list', { params })
}

export function getOrderDetail(id: number): Promise<OrderRecord> {
  return request.get(`/admin/orders/${id}`)
}

export function updateOrderStatus(id: number, status: string): Promise<void> {
  return request.put(`/admin/orders/${id}/status`, { status })
}
