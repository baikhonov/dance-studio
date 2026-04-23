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
  levelTitle: string
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
    <div class="pointer-events-none absolute inset-0 hidden dark:block bg-slate-950/45"></div>
    <div class="lesson-card-content relative z-10 h-full p-1 flex flex-col text-[10px] overflow-hidden">
      <p class="shrink-0 font-bold text-xs leading-tight truncate text-gray-900" :title="directionName">
        {{ directionName }}
      </p>

      <p class="shrink-0 text-xs text-gray-700 dark:text-slate-200 mt-0 font-medium truncate" :title="levelTitle">
        {{ levelName }}
      </p>

      <div class="shrink-0 text-xs font-medium mt-0.5 bg-white/50 dark:bg-slate-800/80 dark:text-slate-100 px-1 py-0.5 rounded inline-block self-start">
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
          class="mt-0.5 text-[10px] leading-tight text-gray-700 dark:text-slate-300 font-medium text-right truncate"
          :title="lesson.teachers.map((t) => t.name).join(', ')"
        >
          {{ formatTeacherNames(lesson.teachers) }}
        </p>
      </div>

      <div
        v-else-if="lesson.poster"
        class="mt-0.5 pt-0.5 min-h-0"
      >
        <img
          :src="resolvePosterUrl(lesson.poster ?? '')"
          :alt="directionName"
          class="h-full w-full rounded-md object-cover"
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

:global(.dark) .lesson-card-content {
  background: rgba(15, 23, 42, 0.82);
}

:global(.dark) .text-gray-900 {
  color: #f8fafc;
  text-shadow: none;
}
</style>
