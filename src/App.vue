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
    time: '19:30',
    endTime: '20:30',
    direction: 'Lady Style (соло)',
    level: 'Продолжающие',
    teachers: [{ name: 'Татьяна', photo: 'tatyana.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 2,
    day: 'Понедельник',
    time: '20:30',
    endTime: '21:30',
    direction: 'Бачата в паре',
    level: 'Начинающие',
    teachers: [{ name: 'Кеулемжай и Татьяна', photo: 'keulemzhai-tatyana2.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 3,
    day: 'Вторник',
    time: '19:30',
    endTime: '20:30',
    direction: 'Общее хорео (соло)',
    level: 'Для всех',
    teachers: [{ name: 'Кеулемжай', photo: 'keulemzhai.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 4,
    day: 'Вторник',
    time: '20:30',
    endTime: '21:30',
    direction: 'Бачата в паре',
    level: 'Продолжающие',
    teachers: [{ name: 'Кеулемжай и Татьяна', photo: 'keulemzhai-tatyana2.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 5,
    day: 'Среда',
    time: '19:30',
    endTime: '20:30',
    direction: 'Lady Style (соло)',
    level: 'Продолжающие',
    teachers: [{ name: 'Татьяна', photo: 'tatyana.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 6,
    day: 'Среда',
    time: '20:30',
    endTime: '21:30',
    direction: 'Бачата в паре',
    level: 'Начинающие',
    teachers: [{ name: 'Кеулемжай и Татьяна', photo: 'keulemzhai-tatyana2.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 7,
    day: 'Четверг',
    time: '19:30',
    endTime: '20:30',
    direction: 'Общее хорео (соло)',
    level: 'Для всех',
    teachers: [{ name: 'Кеулемжай', photo: 'keulemzhai.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 8,
    day: 'Четверг',
    time: '20:30',
    endTime: '21:30',
    direction: 'Бачата в паре',
    level: 'Продолжающие',
    teachers: [{ name: 'Кеулемжай и Татьяна', photo: 'keulemzhai-tatyana2.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 9,
    day: 'Пятница',
    time: '19:30',
    endTime: '20:30',
    direction: 'Lady Style (соло)',
    level: 'Начинающие',
    teachers: [{ name: 'Татьяна', photo: 'tatyana.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 10,
    day: 'Пятница',
    time: '20:30',
    endTime: '22:30',
    direction: 'Бачата интенсив "Украшения в паре"',
    level: 'Для всех',
    teachers: [{ name: 'Кеулемжай и Татьяна', photo: 'keulemzhai-tatyana2.jpg' }],
    type: 'lesson',
    poster: null,
  },
  {
    id: 19,
    day: 'Суббота',
    time: '20:00',
    endTime: '23:00',
    direction: 'Вечеринка',
    level: 'Для всех',
    type: 'party',
    poster: 'party-bachatamania.jpg',
  },
  {
    id: 20,
    day: 'Воскресенье',
    time: '13:00',
    endTime: '14:00',
    direction: 'Lady Style (соло)',
    level: 'Начинающие',
    teachers: [{ name: 'Татьяна', photo: 'tatyana.jpg' }],
    type: 'lesson',
    poster: null,
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
