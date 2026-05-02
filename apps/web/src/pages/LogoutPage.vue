<template></template>

<script setup lang="ts">
import { api } from 'src/boot/axios';
import { useUserStore } from 'src/stores/user';

const userStore = useUserStore();

userStore.clearAuth();

api.post('/auth/logout').then(() => {
  window.location.href = '/login';
});
</script>
