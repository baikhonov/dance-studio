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
  levelStyle: CSSProperties
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

const formatTeacherNames = (teachers: Teacher[]): string =>
  teachers
    .map((teacher) => teacher.name.trim().split(/\s+/)[0] ?? teacher.name)
    .join(' и ')
</script>

<template>
  <div
    class="absolute rounded-lg shadow-sm overflow-hidden hover:shadow-md hover:brightness-[0.98] transition-all cursor-pointer border-l-2 md:border-l-2"
    :style="[cardStyle, levelStyle]"
    @click="emit('select')"
  >
    <div class="lesson-card-content h-full p-1 flex flex-col text-[10px] overflow-hidden">
      <p class="shrink-0 font-bold text-xs leading-tight truncate text-gray-900" :title="directionName">
        {{ directionName }}
      </p>

      <p class="text-xs text-gray-700 mt-0 font-medium">
        {{ levelName }}
      </p>

      <div class="text-xs font-medium mt-0.5 bg-white/50 px-1 py-0.5 rounded inline-block self-start">
        {{ lesson.time }}—{{ lesson.endTime }}
      </div>

      <div
        v-if="lesson.teachers && lesson.teachers.length > 0"
        class="pt-0.5"
      >
        <div class="flex justify-end shrink-0 -space-x-3 md:-space-x-2">
          <img
            v-for="(teacher, idx) in lesson.teachers"
            :key="teacher.name"
            :src="resolveTeacherPhotoUrl(teacher.photo)"
            :alt="teacher.name"
            class="w-7 h-7 rounded-full border md:border-2 border-white shadow-sm"
            :class="{
              'relative z-10': idx === 0 && lesson.teachers.length > 1,
            }"
            @error="setFallbackImage($event, DEFAULT_TEACHER_AVATAR)"
          />
        </div>
        <p
          class="mt-0.5 text-[10px] leading-tight text-gray-700 font-medium text-right truncate"
          :title="lesson.teachers.map((t) => t.name).join(', ')"
        >
          {{ formatTeacherNames(lesson.teachers) }}
        </p>
      </div>

      <div
        v-else-if="lesson.poster"
        class="flex items-center justify-end mt-0.5 pt-0.5"
      >
        <img
          :src="resolvePosterUrl(lesson.poster ?? '')"
          :alt="directionName"
          class="w-full rounded-md border border-white/90 shadow-sm object-cover"
          @error="setFallbackImage($event, DEFAULT_EVENT_POSTER)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-gray-900 {
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}
</style>
