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
    day: 'Понедельник',
    time: '13:00',
    endTime: '14:00',
    direction: 'Lady Style | Сеньориты',
    level: 'Начинающий',
    teachers: [{ name: 'Анна', photo: 'anna.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 2,
    day: 'Понедельник',
    time: '19:00',
    endTime: '20:00',
    direction: 'Bachata в паре',
    level: 'Средний',
    teachers: [
      { name: 'Игорь', photo: 'igor.jpg' },
      { name: 'Аделина', photo: 'adelina.jpg' },
    ],
    type: 'lesson',
    poster: null,
  },
  {
    id: 3,
    day: 'Понедельник',
    time: '20:00',
    endTime: '21:00',
    direction: 'Lady Style',
    level: 'Pro',
    teachers: [{ name: 'Аделина', photo: 'adelina.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 4,
    day: 'Вторник',
    time: '13:00',
    endTime: '14:00',
    direction: 'Lady Style | Дневная группа',
    level: 'Средний',
    teachers: [{ name: 'Аделина', photo: 'adelina.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 5,
    day: 'Вторник',
    time: '19:00',
    endTime: '20:00',
    direction: 'Lady Style',
    level: 'Средний',
    teachers: [{ name: 'Аделина', photo: 'adelina.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 6,
    day: 'Вторник',
    time: '20:00',
    endTime: '22:00',
    direction: 'Bachata в паре',
    level: 'Pro',
    teachers: [{ name: 'Аделина', photo: 'adelina.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 7,
    day: 'Среда',
    time: '13:00',
    endTime: '14:00',
    direction: 'Lady Style | Сеньориты',
    level: 'Начинающий',
    teachers: [{ name: 'Анна', photo: 'anna.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 8,
    day: 'Среда',
    time: '19:00',
    endTime: '20:00',
    direction: 'Bachata в паре',
    level: 'Средний',
    teachers: [
      { name: 'Игорь', photo: 'igor.jpg' },
      { name: 'Аделина', photo: 'adelina.jpg' },
    ],
    type: 'lesson',
    poster: null,
  },
  {
    id: 9,
    day: 'Среда',
    time: '20:00',
    endTime: '21:00',
    direction: 'Bachata в паре',
    level: 'Начинающий',
    teachers: [
      { name: 'Игорь', photo: 'igor.jpg' },
      { name: 'Анжелика', photo: 'anzhelika.jpg' },
    ],
    type: 'lesson',
    poster: null,
  },
  {
    id: 10,
    day: 'Среда',
    time: '21:00',
    endTime: '22:00',
    direction: 'Lady Style',
    level: 'Начинающий',
    teachers: [{ name: 'Анна', photo: 'anna.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 11,
    day: 'Четверг',
    time: '13:00',
    endTime: '14:00',
    direction: 'Lady Style | Дневная группа',
    level: 'Средний',
    teachers: [{ name: 'Аделина', photo: 'adelina.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 12,
    day: 'Четверг',
    time: '19:00',
    endTime: '20:00',
    direction: 'Lady Style',
    level: 'Средний',
    teachers: [{ name: 'Аделина', photo: 'adelina.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 13,
    day: 'Четверг',
    time: '20:00',
    endTime: '21:00',
    direction: 'Lady Style',
    level: 'Начинающий',
    teachers: [{ name: 'Анна', photo: 'anna.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 14,
    day: 'Пятница',
    time: '19:00',
    endTime: '20:00',
    direction: 'Lady Style',
    level: 'Начинающий',
    teachers: [{ name: 'Анна', photo: 'anna.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 15,
    day: 'Пятница',
    time: '20:00',
    endTime: '21:00',
    direction: 'Bachata в паре',
    level: 'Начинающий',
    teachers: [
      { name: 'Игорь', photo: 'igor.jpg' },
      { name: 'Анжелика', photo: 'anzhelika.jpg' },
    ],
    type: 'lesson',
    poster: null,
  },
  {
    id: 16,
    day: 'Пятница',
    time: '21:00',
    endTime: '22:00',
    direction: 'Man Style',
    level: '',
    teachers: [{ name: 'Игорь', photo: 'igor.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 17,
    day: 'Суббота',
    time: '10:00',
    endTime: '11:00',
    direction: 'Lady Style',
    level: 'Начинающий',
    teachers: [{ name: 'Анна', photo: 'anna.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 18,
    day: 'Суббота',
    time: '15:00',
    endTime: '16:00',
    direction: 'Функциональная растяжка',
    level: '',
    teachers: [{ name: 'Марина', photo: 'marina.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 19,
    day: 'Суббота',
    time: '20:00',
    endTime: '23:00',
    direction: 'AG PARTY',
    level: 'Для всех',
    type: 'party',
    poster: 'party-ag.jpg',
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
