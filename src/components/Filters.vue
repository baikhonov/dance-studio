<script setup>
const props = defineProps({
  directions: Array,
  levels: Array,
})

const filters = defineModel({
  type: Object,
  required: true,
})

function updateDirection(event) {
  const value = event.target.value
  console.log(`Выбрано направление ${value}`)
  filters.value = {
    ...filters.value,
    direction: value,
  }
}

function updateLevel(event) {
  const value = event.target.value
  console.log(`Выбран уровень ${value}`)
  filters.value = {
    ...filters.value,
    level: value,
  }
}

const resetFilters = () => {
  filters.value = { direction: '', level: '' }
}
</script>

<template>
  <div class="filters flex gap-2">
    <select
      class="w-auto max-w-[200px] px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm text-gray-700 cursor-pointer"
      :value="filters.direction"
      @change="updateDirection"
    >
      <option value="">Все направления</option>
      <option v-for="direction in directions" :key="direction" :value="direction">
        {{ direction }}
      </option>
    </select>
    <select
      class="w-auto max-w-[200px] px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm text-gray-700 cursor-pointer"
      :value="filters.level"
      @change="updateLevel"
    >
      <option value="">Все уровни</option>
      <option v-for="level in levels" :key="level" :value="level">
        {{ level }}
      </option>
    </select>
    <button
      v-if="filters.direction || filters.level"
      @click="resetFilters"
      class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      ✕ Сбросить
    </button>
  </div>
</template>
