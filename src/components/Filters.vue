<script setup lang="ts">
import type { Direction, Filters as ScheduleFilters, Level } from '@/types/lesson'

defineProps<{
  directions: Direction[]
  levels: Level[]
}>()

const filters = defineModel<ScheduleFilters>({ required: true })

function updateDirection(event: Event) {
  const rawValue = (event.target as HTMLSelectElement | null)?.value ?? ''
  const value = rawValue ? Number(rawValue) : null
  filters.value = {
    ...filters.value,
    direction: value,
  }
}

function updateLevel(event: Event) {
  const rawValue = (event.target as HTMLSelectElement | null)?.value ?? ''
  const value = rawValue ? Number(rawValue) : null
  filters.value = {
    ...filters.value,
    level: value,
  }
}

const resetFilters = () => {
  filters.value = { direction: null, level: null }
}
</script>

<template>
  <div class="filters flex flex-row flex-nowrap items-center gap-2 w-full md:w-auto">
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
    <select
      class="min-w-0 flex-1 md:flex-none md:w-auto md:max-w-[200px] px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm text-gray-700 cursor-pointer"
      :value="filters.level"
      @change="updateLevel"
    >
      <option value="">Все уровни</option>
      <option v-for="level in levels" :key="level.id" :value="level.id">
        {{ level.name }}
      </option>
    </select>
    <button
      v-if="filters.direction || filters.level"
      @click="resetFilters"
      class="shrink-0 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      ✕ Сбросить
    </button>
  </div>
</template>
