<script setup>
import ScheduleHeader from '@/components/ScheduleHeader.vue'

defineProps({
  days: Array,
  timeSlots: Array,
  lessons: Array,
})
</script>

<template>
  <main>
    <ScheduleHeader :days="days" :timeSlots="timeSlots" :lessons="lessons" />
  </main>
</template>

<style scoped></style>
