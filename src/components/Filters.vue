<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Direction, Filters as ScheduleFilters, Level } from '@/types/lesson'
import { DEFAULT_LEVEL_COLOR, getLevelDotStyle } from '@/utils/levelColors'

const props = defineProps<{
  directions: Direction[]
  levels: Level[]
  filteredCount?: number
}>()

const filters = defineModel<ScheduleFilters>({ required: true })
const isLevelsOpen = ref(false)
const isDirectionsOpen = ref(false)
const levelsMenuRef = ref<HTMLElement | null>(null)
const directionsMenuRef = ref<HTMLElement | null>(null)

function selectDirection(value: number | null) {
  filters.value = {
    ...filters.value,
    direction: value,
  }
  isDirectionsOpen.value = false
}

function selectLevel(value: number | null) {
  filters.value = {
    ...filters.value,
    level: value,
  }
  isLevelsOpen.value = false
}

const resetFilters = () => {
  filters.value = { direction: null, level: null }
  isDirectionsOpen.value = false
  isLevelsOpen.value = false
}

const selectedDirectionLabel = computed(() => {
  if (filters.value.direction === null) return 'Все направления'
  return (
    props.directions.find((direction) => direction.id === filters.value.direction)?.name ??
    'Все направления'
  )
})

const selectedLevelLabel = computed(() => {
  if (filters.value.level === null) return 'Все уровни'
  return props.levels.find((level) => level.id === filters.value.level)?.name ?? 'Все уровни'
})

const selectedLevelColor = computed(() => {
  if (filters.value.level === null) return null
  return props.levels.find((level) => level.id === filters.value.level)?.color ?? null
})

const selectedLevelDotStyle = computed(() => getLevelDotStyle(selectedLevelColor.value))

const toggleLevelsMenu = () => {
  const next = !isLevelsOpen.value
  isLevelsOpen.value = next
  if (next) {
    isDirectionsOpen.value = false
  }
}

const toggleDirectionsMenu = () => {
  const next = !isDirectionsOpen.value
  isDirectionsOpen.value = next
  if (next) {
    isLevelsOpen.value = false
  }
}

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as Node | null
  if (!target) return

  if (!levelsMenuRef.value?.contains(target)) {
    isLevelsOpen.value = false
  }

  if (!directionsMenuRef.value?.contains(target)) {
    isDirectionsOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <div class="filters w-full md:w-auto">
    <div class="flex flex-row flex-nowrap items-center gap-2 w-full md:w-auto">
      <div
        ref="directionsMenuRef"
        class="relative z-50 min-w-0 flex-1 md:flex-none md:w-auto md:max-w-[200px]"
      >
        <button
          type="button"
          class="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm text-gray-700 cursor-pointer inline-flex items-center justify-between gap-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          @click.stop="toggleDirectionsMenu"
        >
          <span class="truncate">{{ selectedDirectionLabel }}</span>
          <span
            class="text-xs text-gray-500 dark:text-slate-400 transition-transform duration-200 ease-in-out"
            :class="{ 'rotate-180': isDirectionsOpen }"
            >▼</span
          >
        </button>

        <div
          v-if="isDirectionsOpen"
          class="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden dark:border-slate-600 dark:bg-slate-800"
        >
          <button
            type="button"
            class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="selectDirection(null)"
          >
            Все направления
          </button>
          <button
            v-for="direction in directions"
            :key="direction.id"
            type="button"
            class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="selectDirection(direction.id)"
          >
            {{ direction.name }}
          </button>
        </div>
      </div>
      <div
        ref="levelsMenuRef"
        class="relative z-50 min-w-0 flex-1 md:flex-none md:w-auto md:max-w-[220px]"
      >
        <button
          type="button"
          class="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm text-gray-700 cursor-pointer inline-flex items-center justify-between gap-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          @click.stop="toggleLevelsMenu"
        >
          <span class="inline-flex items-center gap-2 truncate">
            <span class="h-2.5 w-2.5 rounded-full shrink-0" :style="selectedLevelDotStyle"></span>
            <span class="truncate">{{ selectedLevelLabel }}</span>
          </span>
          <span
            class="text-xs text-gray-500 dark:text-slate-400 transition-transform duration-200 ease-in-out"
            :class="{ 'rotate-180': isLevelsOpen }"
            >▼</span
          >
        </button>

        <div
          v-if="isLevelsOpen"
          class="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden dark:border-slate-600 dark:bg-slate-800"
        >
          <button
            type="button"
            class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="selectLevel(null)"
          >
            <span class="h-2.5 w-2.5 rounded-full" :style="getLevelDotStyle(DEFAULT_LEVEL_COLOR)"></span>
            <span>Все уровни</span>
          </button>
          <button
            v-for="level in levels"
            :key="level.id"
            type="button"
            class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="selectLevel(level.id)"
          >
            <span class="h-2.5 w-2.5 rounded-full" :style="getLevelDotStyle(level.color)"></span>
            <span>{{ level.name }}</span>
          </button>
        </div>
      </div>
      <button
        v-if="filters.direction || filters.level"
        @click="resetFilters"
        class="hidden md:inline-flex shrink-0 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
      >
        ✕ Сбросить
      </button>
    </div>
    <div
      v-if="filters.direction || filters.level"
      class="mt-2 flex items-center justify-between gap-2 md:hidden"
    >
      <button
        @click="resetFilters"
        class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
      >
        ✕ Сбросить
      </button>
      <span class="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full text-center dark:text-slate-300 dark:bg-slate-700">
        Найдено: {{ filteredCount ?? 0 }}
      </span>
    </div>
  </div>
</template>
