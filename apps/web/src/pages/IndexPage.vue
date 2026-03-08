<template>
  <q-page class="row items-center justify-evenly">
    <div class="w-[80rem]">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
    <q-calendar v-model="selectedDate" view="week" :locale="locale" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { today, QCalendar } from '@quasar/quasar-ui-qcalendar';
import '@quasar/quasar-ui-qcalendar/index.css';

const locale = navigator.language;

const selectedDate = ref(today());
</script>
