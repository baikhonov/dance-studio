<script setup>
import Schedule from '@/components/Schedule.vue'

defineProps({
  days: Array,
  timeSlots: Array,
  lessons: Array,
})
</script>

<template>
  <main>
    <Schedule :days="days" :timeSlots="timeSlots" :lessons="lessons" />
  </main>
</template>

<style scoped></style>
