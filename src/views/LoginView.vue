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
  <div class="flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-bold mb-6 text-center">Вход для администратора</h2>

      <div class="mb-4">
        <label class="block text-gray-700 mb-2">Пароль</label>
        <input
          type="password"
          v-model="password"
          @keyup.enter="login"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <button
        @click="login"
        class="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors"
      >
        Войти
      </button>

      <p v-if="error" class="text-red-500 text-sm mt-3 text-center">{{ error }}</p>
    </div>
  </div>
</template>
