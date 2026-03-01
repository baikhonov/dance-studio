<script setup>
defineProps({
  days: Array,
})
</script>
<template>
  <div class="schedule">
    <h1>Расписание занятий</h1>
    <div class="schedule__header">
      <div v-for="day in days" :key="day" class="schedule__day">
        {{ day }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.schedule {
  &__header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    background: #f0f0f0;
    padding: 10px;
  }

  &__day {
    text-align: center;
    font-weight: bold;
    padding: 10px;
    background: white;
  }
}
</style>
