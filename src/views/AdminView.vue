<script setup lang="ts">
import { ref } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import { storeToRefs } from 'pinia'
import TeacherModal from '@/components/TeacherModal.vue'
import DirectionModal from '@/components/DirectionModal.vue'
import type { Direction, NewDirection, NewTeacher, Teacher } from '@/types/lesson'

type TeacherDraft = NewTeacher & { id: null }
type DirectionDraft = NewDirection & { id: null }

const schedule = useScheduleStore()
const { teachers, directions } = storeToRefs(schedule)

const isTeacherModalOpen = ref(false)
const selectedTeacher = ref<Teacher | TeacherDraft | null>(null)
const isDirectionModalOpen = ref(false)
const selectedDirection = ref<Direction | DirectionDraft | null>(null)

const createEmptyTeacher = (): TeacherDraft => ({
  id: null,
  name: '',
  photo: '',
})

const openTeacherModal = (teacher?: Teacher | TeacherDraft) => {
  if (teacher) {
    selectedTeacher.value = teacher
  } else {
    selectedTeacher.value = createEmptyTeacher()
  }
  isTeacherModalOpen.value = true
}

const createEmptyDirection = (): DirectionDraft => ({
  id: null,
  name: '',
})

const openDirectionModal = (direction?: Direction | DirectionDraft) => {
  if (direction) {
    selectedDirection.value = direction
  } else {
    selectedDirection.value = createEmptyDirection()
  }
  isDirectionModalOpen.value = true
}

const closeTeacherModal = () => {
  isTeacherModalOpen.value = false
  selectedTeacher.value = null
}

const closeDirectionModal = () => {
  isDirectionModalOpen.value = false
  selectedDirection.value = null
}

const setFallbackImage = (event: Event, fallbackSrc: string) => {
  const image = event.target as HTMLImageElement | null
  if (image) {
    image.src = fallbackSrc
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Администрирование</h1>

        <h2 class="text-xl font-semibold mb-4">Управление преподавателями</h2>

    <div class="mb-8">
      <button
        type="button"
        @click="openTeacherModal()"
        class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
      >
        Добавить преподавателя
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="teacher in teachers"
        :key="teacher.id"
        role="button"
        tabindex="0"
        :aria-label="`Карточка преподавателя ${teacher.name}`"
        class="flex flex-col items-center p-4 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
        @click="openTeacherModal(teacher)"
        @keydown.enter="openTeacherModal(teacher)"
        @keydown.space.prevent="openTeacherModal(teacher)"
      >
        <img
          :src="`/images/teachers/${teacher.photo}`"
          :alt="teacher.name"
          class="w-full max-w-50 mb-3 object-cover pointer-events-none"
          @error="setFallbackImage($event, '/images/teachers/default-avatar.jpg')"
        />
        <p class="font-semibold text-lg text-center">{{ teacher.name }}</p>
      </div>
    </div>

    <h2 class="text-xl font-semibold mb-4">Управление направлениями</h2>
    <div class="mb-8">
      <button
        type="button"
        @click="openDirectionModal()"
        class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
      >
        Добавить направление
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
      <div
        v-for="direction in directions"
        :key="direction.id"
        role="button"
        tabindex="0"
        :aria-label="`Карточка направления ${direction.name}`"
        class="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
        @click="openDirectionModal(direction)"
        @keydown.enter="openDirectionModal(direction)"
        @keydown.space.prevent="openDirectionModal(direction)"
      >
        <p class="font-semibold text-lg text-center">{{ direction.name }}</p>
      </div>
    </div>

    <TeacherModal
      :is-open="isTeacherModalOpen"
      :teacher="selectedTeacher"
      @close="closeTeacherModal"
    />

    <DirectionModal
      :is-open="isDirectionModalOpen"
      :direction="selectedDirection"
      @close="closeDirectionModal"
    />
  </div>
</template>
