<script setup lang="ts">
import {
  DEFAULT_EVENT_POSTER,
  DEFAULT_TEACHER_AVATAR,
  resolvePosterUrl,
  resolveTeacherPhotoUrl,
} from '@/utils/assets'
import type { CSSProperties } from 'vue'
import type { Lesson, Teacher } from '@/types/lesson'

type LessonCard = Lesson & { teachers: Teacher[] }

defineProps<{
  lesson: LessonCard
  directionName: string
  levelName: string
  directionClass: string
  cardStyle: CSSProperties
}>()

const emit = defineEmits<{
  select: []
}>()

const setFallbackImage = (event: Event, fallbackSrc: string) => {
  const image = event.target as HTMLImageElement | null
  if (image) {
    image.src = fallbackSrc
  }
}
</script>

<template>
  <div
    class="absolute rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer border-l-2 md:border-l-4"
    :class="directionClass"
    :style="cardStyle"
    @click="emit('select')"
  >
    <div class="lesson-card-content h-full p-1.5 flex flex-col text-[10px] overflow-y-auto">
      <p class="shrink-0 font-bold text-xs leading-tight truncate text-gray-900" :title="directionName">
        {{ directionName }}
      </p>

      <p class="text-xs text-gray-700 mt-0.5 font-medium">
        {{ levelName }}
      </p>

      <div class="text-xs font-medium mt-1 bg-white/50 px-1 py-0.5 rounded inline-block self-start">
        {{ lesson.time }}—{{ lesson.endTime }}
      </div>

      <div
        v-if="lesson.teachers && lesson.teachers.length > 0"
        class="flex items-center justify-between mt-1 pt-1 border-t border-white/50"
      >
        <p class="text-xs text-gray-700 font-medium max-w-[60%] truncate">
          {{ lesson.teachers.map((t) => t.name).join(' и ') }}
        </p>

        <div class="flex shrink-0 -space-x-4 md:-space-x-2 ml-1">
          <img
            v-for="(teacher, idx) in lesson.teachers"
            :key="teacher.name"
            :src="resolveTeacherPhotoUrl(teacher.photo)"
            :alt="teacher.name"
            class="w-9 h-9 rounded-full border-1 md:border-2 border-white shadow-sm"
            :class="{
              'relative z-10': idx === 0 && lesson.teachers.length > 1,
            }"
            @error="setFallbackImage($event, DEFAULT_TEACHER_AVATAR)"
          />
        </div>
      </div>

      <div
        v-else-if="lesson.type === 'event'"
        class="flex items-center justify-end mt-1 pt-1 border-t border-white/50"
      >
        <img
          :src="resolvePosterUrl(lesson.poster)"
          :alt="directionName"
          class="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
          @error="setFallbackImage($event, DEFAULT_EVENT_POSTER)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.lesson-card-content {
  scrollbar-width: thin;
  scrollbar-color: #999 #e0e0e0;
}

.lesson-card-content::-webkit-scrollbar {
  width: 4px;
}

.lesson-card-content::-webkit-scrollbar-track {
  background: #e0e0e0;
}

.lesson-card-content::-webkit-scrollbar-thumb {
  background: #999;
  border-radius: 4px;
}

.text-gray-900 {
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}
</style>
