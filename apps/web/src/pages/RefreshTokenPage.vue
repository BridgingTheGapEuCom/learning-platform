<template>
  <div></div>
</template>

<script lang="ts" setup>
import { api } from 'src/boot/axios';
import { useUserStore } from 'src/stores/user';
import { onBeforeMount } from 'vue';
import * as jose from 'jose';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

onBeforeMount(async () => {
  try {
    const axios = await api.post('/auth/refresh');

    userStore.token = axios.data.access_token;

    const data = jose.decodeJwt(axios.data.access_token);

    userStore.firstName = data.firstName as string;
    userStore.lastName = data.lastName as string;
    userStore.email = data.email as string;
    userStore.globalRole = data.globalRole as string;
    userStore.isLoggedIn = true;

    await router.push({ name: 'Home' });
  } catch (error) {
    console.error(error);

    userStore.firstName = '';
    userStore.lastName = '';
    userStore.email = '';
    userStore.globalRole = '';
    userStore.isLoggedIn = false;

    await router.push({ name: 'Login' });
  }
});
</script>
