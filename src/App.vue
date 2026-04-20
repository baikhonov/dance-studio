<script setup lang="ts">
import { AUTH_UNAUTHORIZED_EVENT } from '@/api/http'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted } from 'vue'

const userStore = useUserStore()
const { isAdmin } = storeToRefs(userStore)

const router = useRouter()
const route = useRoute()

const pageTitle = computed(() => {
  if (route.path === '/') {
    return 'Расписание занятий'
  }

  return ''
})

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}

const handleUnauthorized = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
})

onUnmounted(() => {
  window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
})
</script>

<template>
  <header
    class="mx-auto mb-3 grid w-full max-w-[1800px] grid-cols-[1fr_auto] gap-2 border-b border-gray-200 pb-2 md:grid-cols-[1fr_auto_1fr] md:items-center"
  >
    <div class="min-w-0">
      <router-link to="/" class="inline-flex items-center">
        <h1 class="truncate text-base font-semibold tracking-[0.2em] text-gray-800 uppercase md:text-lg">
          Школа танцев
        </h1>
      </router-link>
    </div>

    <div class="justify-self-end md:justify-self-end">
      <div v-if="!isAdmin" class="text-right">
        <router-link to="/login" class="text-sm text-amber-600 hover:text-amber-700">
          Войти
        </router-link>
      </div>
      <div v-else class="flex items-center justify-end gap-4">
        <router-link to="/admin" class="text-sm text-blue-600 hover:text-blue-700">Админка</router-link>
        <button @click="handleLogout" class="text-sm text-red-600 hover:text-red-700">Выйти</button>
      </div>
    </div>

    <div class="col-span-2 flex justify-center md:col-span-1 md:col-start-2 md:row-start-1">
      <h2 v-if="pageTitle" class="text-lg font-semibold text-gray-800 md:text-xl">{{ pageTitle }}</h2>
    </div>
  </header>
  <main>
    <RouterView />
  </main>

  <footer class="my-6 text-center text-gray-600">© 2026 Школа танцев. Все права защищены.</footer>
</template>

<style lang="scss">
html {
  height: 100%;
}
body {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  margin: 0;
  padding: 20px;
  font-family: Arial, sans-serif;
  background: #f5f5f5;

  @media (max-width: 768px) {
    padding: 10px;
  }
}
#app {
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  height: 100%;
}
main {
  width: 100%;
  max-width: 1800px;
  margin: 0 auto 16px;
}
footer {
  margin-top: auto;
}
</style>
