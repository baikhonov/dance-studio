import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('admin_token') || null)

  const isAdmin = computed(() => !!token.value)

  const login = (password) => {
    if (password === '123') {
      token.value = 'fake-jwt-token'
      localStorage.setItem('admin_token', token.value)
      return true
    }
    return false
  }

  const logout = () => {
    token.value = null
    localStorage.removeItem('admin_token')
  }

  return { token, isAdmin, login, logout }
})
