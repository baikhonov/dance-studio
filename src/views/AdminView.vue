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
  <div class="space-y-8">
    <h1 class="text-2xl font-bold text-gray-900">Администрирование</h1>

    <div class="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 xl:gap-8 items-start">
      <section class="rounded-2xl border border-blue-100 bg-white p-4 md:p-5 shadow-sm">
        <div class="flex flex-col gap-3 mb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-semibold text-gray-900">Управление преподавателями</h2>
            <span class="px-2.5 py-1 text-xs md:text-sm font-medium rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
              Всего: {{ teachers.length }}
            </span>
          </div>
          <p class="text-sm text-gray-600">Состав и карточки преподавателей</p>
        </div>

        <button
          type="button"
          @click="openTeacherModal()"
          class="mb-4 px-3.5 py-2 text-sm md:text-base bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          Добавить преподавателя
        </button>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="teacher in teachers"
            :key="teacher.id"
            role="button"
            tabindex="0"
            :aria-label="`Карточка преподавателя ${teacher.name}`"
            class="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            @click="openTeacherModal(teacher)"
            @keydown.enter="openTeacherModal(teacher)"
            @keydown.space.prevent="openTeacherModal(teacher)"
          >
            <img
              :src="`/images/teachers/${teacher.photo}`"
              :alt="teacher.name"
              class="w-14 h-14 rounded-full object-cover shrink-0 pointer-events-none"
              @error="setFallbackImage($event, '/images/teachers/default-avatar.jpg')"
            />
            <p class="font-semibold text-base leading-tight text-gray-900">
              {{ teacher.name }}
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-emerald-100 bg-white p-4 md:p-5 shadow-sm">
        <div class="flex flex-col gap-3 mb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-semibold text-gray-900">Управление направлениями</h2>
            <span
              class="px-2.5 py-1 text-xs md:text-sm font-medium rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap"
            >
              Всего: {{ directions.length }}
            </span>
          </div>
          <p class="text-sm text-gray-600">Справочник направлений для расписания</p>
        </div>

        <button
          type="button"
          @click="openDirectionModal()"
          class="mb-4 px-3.5 py-2 text-sm md:text-base bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          Добавить направление
        </button>

        <ul class="space-y-2">
          <li
            v-for="direction in directions"
            :key="direction.id"
            role="button"
            tabindex="0"
            :aria-label="`Элемент направления ${direction.name}`"
            class="min-h-11 px-3 py-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between gap-3 hover:border-emerald-200 hover:bg-emerald-50/40 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
            @click="openDirectionModal(direction)"
            @keydown.enter="openDirectionModal(direction)"
            @keydown.space.prevent="openDirectionModal(direction)"
          >
            <span class="font-medium text-gray-800 leading-tight">{{ direction.name }}</span>
            <span class="text-emerald-600 text-sm font-semibold" aria-hidden="true">></span>
          </li>
        </ul>
      </section>
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
