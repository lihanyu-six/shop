import request from './request'

export function sendCode(phone) {
  return request.post('/auth/send-code', { phone })
}

export function login(phone, code) {
  return request.post('/auth/login', { phone, code })
}

export function getProfile() {
  return request.get('/auth/profile')
}

export function updateProfile(data) {
  return request.put('/auth/profile', data)
}
