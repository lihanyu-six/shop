import request from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: UserInfo
}

export interface UserInfo {
  id: number
  name: string
  phone?: string
  department?: string
  employeeNo?: string
  role?: string
}

export function login(data: LoginParams): Promise<LoginResponse> {
  return request.post('/auth/admin/login', data)
}

export function logout(): Promise<{ message: string }> {
  return request.post('/auth/logout')
}

export function getCurrentUser(): Promise<{ user: UserInfo }> {
  return request.get('/auth/profile')
}
