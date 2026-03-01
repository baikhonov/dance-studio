<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'

const daysOfWeek = ref(['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'])
</script>

<template>
  <header>
    <h1>Школа танцев</h1>
  </header>
  <RouterView :days="daysOfWeek" />
</template>

<style>
body {
  margin: 0;
  padding: 10px;
  font-family: Arial, sans-serif;
  background: #f5f5f5;
}
</style>
