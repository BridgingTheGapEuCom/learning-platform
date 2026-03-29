<template>
  <q-page class="full-width">
    <Dashboard />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dashboard from '../components/Dashboard.vue';
</script>

<style scoped>
.use-max-available-width {
  width: min(80rem, 100%);
}
</style>
