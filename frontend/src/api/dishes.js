import request from './request'

export function getCategories() {
  return request.get('/dishes/categories')
}

export function getDishes(params) {
  return request.get('/dishes', { params })
}

export function getDailyMenu(params) {
  return request.get('/dishes/daily', { params })
}

export function getDishDetail(id) {
  return request.get(`/dishes/${id}`)
}
