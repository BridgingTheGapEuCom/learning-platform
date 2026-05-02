<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useUserStore } from 'stores/user';
import { onBeforeMount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCssVar } from '@vueuse/core';

const userStore = useUserStore();
const languageModules = import.meta.glob('../node_modules/quasar/lang/*.js');
const $q = useQuasar();
const { locale } = useI18n();

onBeforeMount(async () => {
  const userSettings = localStorage.getItem('user-settings');
  if (userSettings) {
    const parsedSettings = JSON.parse(userSettings);
    userStore.settings.language = parsedSettings.language ? parsedSettings.language : 'en-US';
  }

  try {
    if (userStore.settings.language) {
      let langToLoad = userStore.settings.language;
      let langModule = languageModules[`../node_modules/quasar/lang/${langToLoad}.js`];

      if (!langModule && langToLoad.includes('-')) {
        langToLoad = langToLoad.split('-')[0];
        langModule = languageModules[`../node_modules/quasar/lang/${langToLoad}.js`];
      }

      if (langModule) {
        const newLanguage = (await langModule()) as { default: typeof $q.lang };
        $q.lang.set(newLanguage.default);
        locale.value = newLanguage.default.isoName;
        userStore.settings.language = newLanguage.default.isoName;
      } else {
        langModule = languageModules[`../node_modules/quasar/lang/en-US.js`];
        if (langModule) {
          const newLanguage = (await langModule()) as { default: typeof $q.lang };
          $q.lang.set(newLanguage.default);
          locale.value = newLanguage.default.isoName;
        }

        userStore.settings.language = 'en-US';
      }
    }
  } catch (error) {
    console.error('Error setting language:', error);
  }
});

watch(
  () => userStore.settings.highContrast,
  (current) => {
    if (current) {
      document.body.classList.add('highContrastMode');
    } else {
      document.body.classList.remove('highContrastMode');
    }
  },
  { immediate: true },
);

watch(
  () => userStore.settings.reducedMotion,
  (val) => {
    if (val === 'reduce') {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  },
  { immediate: true },
);

watch(
  () => userStore.settings.fontSize,
  (val) => {
    if (val) {
      const fontSizeVariable = useCssVar('--default-font-size');
      fontSizeVariable.value = val;
    }
  },
  { immediate: true },
);

watch(locale, async (newLocale) => {
  if (newLocale !== $q.lang.isoName) {
    const langModule = languageModules[`../node_modules/quasar/lang/${newLocale}.js`];
    if (langModule) {
      const newLanguage = (await langModule()) as { default: typeof $q.lang };
      $q.lang.set(newLanguage.default);
    }
  }
});

watch(
  () => $q.lang.isoName,
  (newQuasarLang) => {
    if (newQuasarLang !== locale.value) {
      locale.value = newQuasarLang;
    }
  },
);
</script>

<style lang="scss">
@import 'tailwindcss';
</style>
