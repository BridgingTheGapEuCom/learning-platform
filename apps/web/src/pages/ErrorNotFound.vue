<template>
  <div class="fullscreen bg-dark-page text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity: 0.4">{{ t('app.errorNotFound.nothingHere') }}</div>

      <BTG_btn
        class="q-mt-xl"
        text-color="primary"
        unelevated
        to="/"
        :label="t('app.errorNotFound.goHome')"
        no-caps
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BTG_btn from '../components/BTG_elements/BTG_btn.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
