<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'

const daysOfWeek = ref([
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
])
const timeSlots = ref([
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
])
const lessons = ref([
  {
    id: 1,
    time: '13:00',
    day: 'Понедельник',
    direction: 'Lady Style | Сеньориты',
    level: 'Начинающий',
    teachers: [{ name: 'Анна', photo: 'anna.jpg' }],
  },
  {
    id: 2,
    time: '19:00',
    day: 'Понедельник',
    direction: 'Bachata в паре',
    level: 'Средний',
    teachers: [{ name: 'Игорь и Аделина', photo: 'igor-adelina.jpg' }],
  },
  {
    id: 3,
    time: '20:00',
    day: 'Понедельник',
    direction: 'Lady Style',
    level: 'Pro',
    teachers: [{ name: 'Аделина', photo: 'adelina.jpg' }],
  },
  {
    id: 4,
    time: '13:00',
    day: 'Вторник',
    direction: 'Lady Style | Дневная группа',
    level: 'Средний',
    teachers: [{ name: 'Аделина', photo: 'adelina.jpg' }],
  },
  {
    id: 5,
    time: '19:00',
    day: 'Вторник',
    direction: 'Lady Style',
    level: 'Средний',
    teachers: [{ name: 'Аделина', photo: 'adelina.jpg' }],
  },
  {
    id: 6,
    time: '20:00',
    day: 'Вторник',
    direction: 'Bachata в паре',
    level: 'Pro',
    teachers: [{ name: 'Аделина', photo: 'adelina.jpg' }],
  },
  {
    id: 7,
    time: '13:00',
    day: 'Среда',
    direction: 'Lady Style | Сеньориты',
    level: 'Начинающий',
    teachers: [{ name: 'Анна', photo: 'anna.jpg' }],
  },
  {
    id: 8,
    time: '19:00',
    day: 'Среда',
    direction: 'Bachata в паре',
    level: 'Средний',
    teachers: [{ name: 'Игорь и Аделина', photo: 'igor-adelina.jpg' }],
  },
  {
    id: 9,
    time: '20:00',
    day: 'Среда',
    direction: 'Bachata в паре',
    level: 'Начинающий',
    teachers: [{ name: 'Игорь и Анжелика', photo: 'igor-anzhelika.jpg' }],
  },
  {
    id: 10,
    time: '21:00',
    day: 'Среда',
    direction: 'Lady Style',
    level: 'Начинающий',
    teachers: [{ name: 'Анна', photo: 'anna.jpg' }],
  },
  {
    id: 11,
    time: '13:00',
    day: 'Четверг',
    direction: 'Lady Style | Дневная группа',
    level: 'Средний',
    teachers: [{ name: 'Аделина', photo: 'adelina.jpg' }],
  },
  {
    id: 12,
    time: '19:00',
    day: 'Четверг',
    direction: 'Lady Style',
    level: 'Средний',
    teachers: [{ name: 'Аделина', photo: 'adelina.jpg' }],
  },
  {
    id: 13,
    time: '20:00',
    day: 'Четверг',
    direction: 'Lady Style',
    level: 'Начинающий',
    teachers: [{ name: 'Анна', photo: 'anna.jpg' }],
  },
  {
    id: 14,
    time: '19:00',
    day: 'Пятница',
    direction: 'Lady Style',
    level: 'Начинающий',
    teachers: [{ name: 'Анна', photo: 'anna.jpg' }],
  },
  {
    id: 15,
    time: '20:00',
    day: 'Пятница',
    direction: 'Bachata в паре',
    level: 'Начинающий',
    teachers: [{ name: 'Игорь и Анжелика', photo: 'igor-anzhelika.jpg' }],
  },
  {
    id: 16,
    time: '21:00',
    day: 'Пятница',
    direction: 'Man Style',
    level: '',
    teachers: [{ name: 'Игорь', photo: 'igor.jpg' }],
  },
  {
    id: 17,
    time: '10:00',
    day: 'Суббота',
    direction: 'Lady Style',
    level: 'Начинающий',
    teachers: [{ name: 'Анна', photo: 'anna.jpg' }],
  },
  {
    id: 18,
    time: '15:00',
    day: 'Суббота',
    direction: 'Функциональная растяжка',
    level: '',
    teachers: [{ name: 'Марина', photo: 'marina.jpg' }],
  },
  {
    id: 19,
    time: '20:00',
    day: 'Суббота',
    direction: 'AG PARTY',
    level: '',
    teachers: [{ name: 'Вечеринка', photo: 'party-ag.jpg' }],
  },
])
</script>

<template>
  <header class="mb-8 text-center">
    <h1 class="text-4xl font-light tracking-widest text-gray-800 uppercase mb-2">Школа танцев</h1>
  </header>
  <RouterView :days="daysOfWeek" :timeSlots="timeSlots" :lessons="lessons" />
</template>

<style>
body {
  margin: 0;
  padding: 10px;
  font-family: Arial, sans-serif;
  background: #f5f5f5;
}
main {
  max-width: 1800px;
  margin: 0 auto;
}
</style>
