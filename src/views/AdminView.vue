<script setup>
import { useScheduleStore } from '@/stores/schedule'
import { storeToRefs } from 'pinia'

const schedule = useScheduleStore()
console.log('schedule - ', schedule)

const { teachers } = storeToRefs(schedule)
console.log('teachers - ', teachers)
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Администрирование</h1>
    <h2 class="text-xl font-semibold mb-4">Управление преподавателями</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="teacher in teachers"
        :key="teacher.id"
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
      >
        <img
          :src="`/images/teachers/${teacher.photo}`"
          :alt="teacher.name"
          class="w-full object-cover"
          @error="$event.target.src = '/images/teachers/default-avatar.jpg'"
        />
        <div class="p-4">
          <p class="font-semibold text-lg mb-2">{{ teacher.name }}</p>
          <div class="flex gap-2">
            <button
              class="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            >
              Редактировать
            </button>
            <button
              class="flex-1 px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
