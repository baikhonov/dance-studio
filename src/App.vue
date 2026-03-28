<script setup>
import { RouterView } from 'vue-router'
import { useScheduleStore } from '@/stores/schedule'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const scheduleStore = useScheduleStore()
const userStore = useUserStore()
const { days, timeSlots, lessons } = storeToRefs(scheduleStore)
const { isAdmin } = storeToRefs(userStore)
</script>

<template>
  <header class="my-8 text-center">
    <h1 class="text-4xl font-light tracking-widest text-gray-800 uppercase mb-2">Школа танцев</h1>

    <div v-if="!isAdmin" class="mt-2">
      <router-link to="/login" class="text-sm text-amber-600 hover:text-amber-700">
        Вход для администратора
      </router-link>
    </div>
    <div v-else class="mt-2 flex justify-center gap-4">
      <span class="text-sm text-green-600">✓ Администратор</span>
      <button @click="userStore.logout()" class="text-sm text-red-600 hover:text-red-700">
        Выйти
      </button>
    </div>
  </header>

  <RouterView />

  <footer class="my-6 text-center text-gray-600">© 2026 Школа танцев. Все права защищены.</footer>
</template>

<style>
html {
  height: 100%;
}
body {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  margin: 0;
  padding: 10px;
  font-family: Arial, sans-serif;
  background: #f5f5f5;
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
  margin: 0 auto 30px;
}
footer {
  margin-top: auto;
}
</style>
