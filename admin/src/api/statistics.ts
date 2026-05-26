import request from './request'

export interface TodayStats {
  reservationCount: number
  breakfastSummary: {
    totalOrders: number
    totalAmount: number
    dishCount: number
  }
  lunchSummary: {
    totalOrders: number
    totalAmount: number
    dishCount: number
  }
}

export interface OrderItem {
  id: number
  orderId: number
  dishId: number
  dishName: string
  price: number
  quantity: number
  remark?: string
}

export interface Order {
  id: number
  userName: string
  department?: string
  employeeNo?: string
  mealType: string
  pickCode: string
  remark?: string
  createdAt: string
  items?: OrderItem[]
}

export interface OrderListParams {
  page?: number
  pageSize?: number
  status?: string
  mealType?: string
  startDate?: string
  endDate?: string
  keyword?: string
}

export interface OrderListResponse {
  list: Order[]
  total: number
  page: number
  pageSize: number
}

export function getTodayStats(): Promise<TodayStats> {
  return request.get('/statistics/today')
}

export function getOrderList(params: OrderListParams): Promise<OrderListResponse> {
  return request.get('/statistics/orders', { params })
}

export function exportOrders(params: Omit<OrderListParams, 'page' | 'pageSize'>): Promise<Blob> {
  return request.get('/statistics/orders/export', {
    params,
    responseType: 'blob'
  })
}
