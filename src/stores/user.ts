import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('admin_token'))
  const isAdmin = computed(() => Boolean(token.value))

  const login = (password: string): boolean => {
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
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
