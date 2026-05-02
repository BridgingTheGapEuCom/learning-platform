<template>
  <q-page class="full-width">
    <Dashboard />
  </q-page>
</template>

<script setup lang="ts">
import Dashboard from '../components/DashboardElement.vue';
</script>

<style scoped>
.use-max-available-width {
  width: min(80rem, 100%);
}
</style>
