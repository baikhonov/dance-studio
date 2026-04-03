<script setup>
import Schedule from '@/components/Schedule.vue'

defineProps({
  days: Array,
  timeSlots: Array,
  lessons: Array,
})
</script>

<template>
  <Schedule :days="days" :timeSlots="timeSlots" :lessons="lessons" />
</template>

<style scoped></style>
