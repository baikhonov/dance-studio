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
const levelsMenuRef = ref<HTMLElement | null>(null)

function updateDirection(event: Event) {
  const rawValue = (event.target as HTMLSelectElement | null)?.value ?? ''
  const value = rawValue ? Number(rawValue) : null
  filters.value = {
    ...filters.value,
    direction: value,
  }
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
  isLevelsOpen.value = false
}

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
  isLevelsOpen.value = !isLevelsOpen.value
}

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as Node | null
  if (!levelsMenuRef.value || !target) return
  if (!levelsMenuRef.value.contains(target)) {
    isLevelsOpen.value = false
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
      <select
        class="min-w-0 flex-1 md:flex-none md:w-auto md:max-w-[200px] px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm text-gray-700 cursor-pointer"
        :value="filters.direction"
        @change="updateDirection"
      >
        <option value="">Все направления</option>
        <option v-for="direction in directions" :key="direction.id" :value="direction.id">
          {{ direction.name }}
        </option>
      </select>
      <div
        ref="levelsMenuRef"
        class="relative z-50 min-w-0 flex-1 md:flex-none md:w-auto md:max-w-[220px]"
      >
        <button
          type="button"
          class="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm text-gray-700 cursor-pointer inline-flex items-center justify-between gap-2"
          @click.stop="toggleLevelsMenu"
        >
          <span class="inline-flex items-center gap-2 truncate">
            <span class="h-2.5 w-2.5 rounded-full shrink-0" :style="selectedLevelDotStyle"></span>
            <span class="truncate">{{ selectedLevelLabel }}</span>
          </span>
          <span class="text-xs text-gray-500">▼</span>
        </button>

        <div
          v-if="isLevelsOpen"
          class="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
        >
          <button
            type="button"
            class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 inline-flex items-center gap-2"
            @click="selectLevel(null)"
          >
            <span class="h-2.5 w-2.5 rounded-full" :style="getLevelDotStyle(DEFAULT_LEVEL_COLOR)"></span>
            <span>Все уровни</span>
          </button>
          <button
            v-for="level in levels"
            :key="level.id"
            type="button"
            class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 inline-flex items-center gap-2"
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
        class="hidden md:inline-flex shrink-0 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
        class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        ✕ Сбросить
      </button>
      <span class="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full text-center">
        Найдено: {{ filteredCount ?? 0 }}
      </span>
    </div>
  </div>
</template>
