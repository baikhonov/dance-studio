<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  lesson: Object,
  isOpen: Boolean,
})

const emit = defineEmits(['close'])

const handleEscape = (event) => {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
})

const getDirectionColor = (direction) => {
  const lower = direction.toLowerCase()
  if (lower.includes('lady')) return 'border-purple-600'
  if (lower.includes('пар')) return 'border-orange-600'
  if (lower.includes('растяжка')) return 'border-blue-600'
  if (lower.includes('общее')) return 'border-teal-600'
  if (lower.includes('party') || lower.includes('вечеринка')) return 'border-red-600'
  return 'border-amber-600'
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50">
        <!-- Оверлей -->
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')">
          <!-- Контейнер для центрирования -->
          <div class="fixed inset-0 flex items-center justify-center p-4">
            <!-- Модальное окно -->
            <div
              class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden"
              @click.stop
            >
              <!-- Цветная полоска сверху (как у карточек) -->
              <div class="h-2 w-full" :class="getDirectionColor(lesson.direction)"></div>

              <!-- Контент с прокруткой -->
              <div class="overflow-y-auto p-6" style="max-height: calc(85vh - 8px)">
                <!-- Заголовок -->
                <h3 class="text-2xl font-bold text-gray-900 mb-3 pr-8">
                  {{ lesson.direction }}
                </h3>

                <!-- Время и уровень в одной строке -->
                <div class="flex items-center gap-3 mb-4 text-sm">
                  <span class="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-medium">
                    {{ lesson.time }} — {{ lesson.endTime }}
                  </span>
                  <span
                    v-if="lesson.level"
                    class="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {{ lesson.level }}
                  </span>
                </div>

                <!-- Преподаватели -->
                <div v-if="lesson.teachers && lesson.teachers.length > 0" class="mb-6">
                  <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    {{ lesson.teachers.length > 1 ? 'Преподаватели' : 'Преподаватель' }}
                  </h4>
                  <div class="flex flex-wrap gap-4">
                    <div
                      v-for="teacher in lesson.teachers"
                      :key="teacher.name"
                      class="flex items-center gap-3 bg-gray-50 rounded-lg p-3 min-w-[180px]"
                    >
                      <img
                        :src="`/images/teachers/${teacher.photo}`"
                        :alt="teacher.name"
                        class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                        @error="$event.target.src = '/images/teachers/default-avatar.jpg'"
                      />
                      <p class="font-semibold text-gray-800">{{ teacher.name }}</p>
                    </div>
                  </div>
                </div>
                <!-- Постер мероприятия -->
                <div v-else-if="lesson.type === 'party' && lesson.poster">
                  <img
                    :src="`/images/posters/${lesson.poster}`"
                    :alt="lesson.direction"
                    class="w-full mx-auto rounded-lg shadow-md"
                    @error="$event.target.src = '/images/events/default-party.jpg'"
                  />
                </div>
              </div>

              <!-- Крестик в углу -->
              <button
                @click="emit('close')"
                class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
