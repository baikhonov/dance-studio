<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const password = ref('')
const error = ref('')

const login = async () => {
  if (await userStore.login(password.value)) {
    router.push('/')
  } else {
    error.value = 'Неверный пароль'
  }
}
</script>

<template>
  <div class="flex items-center justify-center bg-gray-100 dark:bg-slate-900">
    <div class="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-transparent dark:border-slate-700 w-96">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-slate-100">Вход для администратора</h2>

      <div class="mb-4">
        <label class="block text-gray-700 dark:text-slate-300 mb-2">Пароль</label>
        <input
          type="password"
          v-model="password"
          @keyup.enter="login"
          class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <button
        @click="login"
        class="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors"
      >
        Войти
      </button>

      <p v-if="error" class="text-red-500 dark:text-red-400 text-sm mt-3 text-center">{{ error }}</p>
    </div>
  </div>
</template>
