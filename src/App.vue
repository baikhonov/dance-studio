<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { useScheduleStore } from '@/stores/schedule'
import { storeToRefs } from 'pinia'

const store = useScheduleStore()

const { days, timeSlots, lessons } = storeToRefs(store)
</script>

<template>
  <header class="my-8 text-center">
    <h1 class="text-4xl font-light tracking-widest text-gray-800 uppercase mb-2">Школа танцев</h1>
  </header>
  <RouterView />
  <footer class="my-6 text-center text-gray-600">© 2026 Школа танцев. Все права защищены.</footer>
</template>

<style>
body {
  margin: 0;
  padding: 10px;
  font-family: Arial, sans-serif;
  background: #f5f5f5;
}
main {
  max-width: 1800px;
  margin: 0 auto;
}
</style>
