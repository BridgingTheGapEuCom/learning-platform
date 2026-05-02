<template>
  <div class="w-full h-full flex">
    <h1>{{ $t('admin.userManagement.title') }}</h1>
    <q-table flat :rows="rows" :columns="columns" row-key="Email"></q-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { type User } from '@btg/shared-types';
import { api } from 'src/boot/axios';

const rows = ref([]);
const columns = ref([
  {
    name: 'UserName',
    label: 'Name',
    field: (row: User) => `${row.firstName} ${row.lastName}`,
    align: 'left',
  },
  {
    name: 'Email',
    label: 'Email',
    field: (row: User) => row.email,
    align: 'left',
  },
  {
    name: 'Role',
    label: 'Role',
    field: (row: User) => row.globalRole,
    align: 'left',
  },
  {
    name: 'Status',
    label: 'Status',
    field: (row: User) => row.status,
    align: 'left',
  },
]);

onMounted(async () => {
  try {
    const userResponse = await api.get(`/users`);
    if (userResponse.status === 200) {
      rows.value = userResponse.data;
    }
  } catch (e) {
    console.error(e);
  }
});
</script>
