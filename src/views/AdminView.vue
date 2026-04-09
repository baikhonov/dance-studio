<script setup>
import { ref } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import { storeToRefs } from 'pinia'

const schedule = useScheduleStore()
const { teachers } = storeToRefs(schedule)
const newTeacherName = ref('')
const newTeacherPhoto = ref('')

const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    newTeacherPhoto.value = file.name
  }
}

const createTeacher = () => {
  if (newTeacherName.value.trim() === '') {
    alert('Введите имя преподавателя')
    return
  }
  console.log('создаем учителя')

  const newTeacher = {
    name: newTeacherName.value,
    photo: newTeacherPhoto.value,
  }
  schedule.addTeacher(newTeacher)
  newTeacherName.value = ''
  newTeacherPhoto.value = ''
}

const deleteTeacher = (id) => {
  if (confirm('Вы уверены, что хотите удалить преподавателя?')) {
    schedule.deleteTeacher(id)
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Администрирование</h1>
    <h2 class="text-xl font-semibold mb-4">Управление преподавателями</h2>

    <form class="flex flex-col items-start gap-4 mb-8">
      <label class="flex-1">
        Имя преподавателя
        <input
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
          v-model="newTeacherName"
          type="text"
        />
      </label>
      <label class="flex-1">
        Фото преподавателя
        <input
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
          type="file"
          @change="handlePhotoUpload"
        />
      </label>
      <button
        class="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        type="submit"
        @click.prevent="createTeacher"
      >
        Отправить
      </button>
    </form>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="teacher in teachers"
        :key="teacher.id"
        class="flex flex-col items-center p-4 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
      >
        <img
          :src="`/images/teachers/${teacher.photo}`"
          :alt="teacher.name"
          class="w-full max-w-50 mb-3 object-cover"
          @error="$event.target.src = '/images/teachers/default-avatar.jpg'"
        />
        <div>
          <p class="font-semibold text-lg text-center mb-2">{{ teacher.name }}</p>
          <div class="flex gap-2">
            <button
              class="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            >
              Редактировать
            </button>
            <button
              class="flex-1 px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
              @click="deleteTeacher(teacher.id)"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
