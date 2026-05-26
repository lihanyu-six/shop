import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: number
  username: string
  role: string
  token: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  function login(user: UserInfo) {
    token.value = user.token
    userInfo.value = user
    localStorage.setItem('token', user.token)
    localStorage.setItem('userInfo', JSON.stringify(user))
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  function initUser() {
    const storedInfo = localStorage.getItem('userInfo')
    if (storedInfo) {
      try {
        userInfo.value = JSON.parse(storedInfo)
      } catch {
        userInfo.value = null
      }
    }
  }

  initUser()

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
  }
})
