<template>
  <q-layout view="lHr lpr lFr">
    <q-header class="bg-dark text-white" height-hint="98" v-if="!$q.screen.gt.md">
      <q-toolbar class="flex">
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <div class="text-sm text-center grow-1">
          <div>
            <b>{{ t('app.brand') }}</b>
          </div>
          {{ t('app.learningPlatform') }}
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :breakpoint="$q.screen.sizes.md"
      :width="$q.screen.lt.sm ? $q.screen.width : 300"
      persistent
    >
      <BTG_btn
        :label="t('app.skipToMainContent')"
        href="#main-content"
        class="absolute top-[-100vh] left-[-100vw] z-10 focus:top-6 focus:left-4"
        @click="skipToContent"
      ></BTG_btn>
      <LeftDrawer @closeDrawer="leftDrawerOpen = false" />
    </q-drawer>

    <q-page-container
      id="main-content"
      tabindex="-1"
      class="flex justify-center items-center outline-none"
    >
      <router-view class="max-w-[80rem] p-6 flex flex-col" />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import LeftDrawer from '../components/LeftDrawer.vue';
import BTG_btn from '../components/BTG_elements/BTG_btn.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const skipToContent = (e?: Event) => {
  e?.preventDefault();
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.focus();
    mainContent.scrollIntoView();
  }
};
</script>
