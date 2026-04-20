import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loginRequest } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('admin_token'))
  const isAdmin = computed(() => Boolean(token.value))

  const login = async (password: string): Promise<boolean> => {
    try {
      const jwt = await loginRequest(password)
      token.value = jwt
      localStorage.setItem('admin_token', token.value)
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    token.value = null
    localStorage.removeItem('admin_token')
  }

  return { token, isAdmin, login, logout }
})
