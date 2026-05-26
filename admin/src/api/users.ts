import request from './request'

export interface User {
  id: number
  name: string
  phone: string
  department?: string
  employeeNo?: string
  loginDisabled: boolean
  createdAt: string
  updatedAt: string
}

export interface UserListParams {
  page?: number
  pageSize?: number
  keyword?: string
  department?: string
  status?: 'active' | 'disabled'
}

export interface UserListResponse {
  list: User[]
  total: number
  page: number
  pageSize: number
}

export interface CreateUserParams {
  name: string
  phone: string
  department?: string
  employeeNo?: string
}

export interface UpdateUserParams {
  name?: string
  phone?: string
  department?: string
  employeeNo?: string
}

export function getUserList(params: UserListParams): Promise<UserListResponse> {
  return request.get('/users', { params })
}

export function createUser(data: CreateUserParams): Promise<User> {
  return request.post('/users', data)
}

export function updateUser(id: number, data: UpdateUserParams): Promise<User> {
  return request.put(`/users/${id}`, data)
}

export function deleteUser(id: number): Promise<{ message: string }> {
  return request.delete(`/users/${id}`)
}

export function toggleUserStatus(id: number, status: boolean): Promise<{ message: string; user: User }> {
  return request.patch(`/users/${id}/status`, { loginDisabled: !status })
}

export function importUsers(file: File): Promise<{ message: string; count: number }> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/users/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function exportUsers(params?: Omit<UserListParams, 'page' | 'pageSize'>): Promise<Blob> {
  return request.get('/users/export', {
    params,
    responseType: 'blob'
  })
}
