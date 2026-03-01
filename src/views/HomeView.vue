<script setup>
import ScheduleHeader from '@/components/ScheduleHeader.vue'

defineProps({
  days: Array,
})
</script>

<template>
  <main>
    <ScheduleHeader :days="days" />
  </main>
</template>

<style scoped>
main {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
