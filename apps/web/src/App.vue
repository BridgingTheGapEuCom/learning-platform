<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useUserStore } from 'stores/user';
import { onBeforeMount, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const userStore = useUserStore();
const languageModules = import.meta.glob('../node_modules/quasar/lang/*.js');
const $q = useQuasar();
const { locale } = useI18n();

onBeforeMount(async () => {
  const userSettings = localStorage.getItem('user-settings');
  if (userSettings) {
    const parsedSettings = JSON.parse(userSettings);
    userStore.settings.highContrast = parsedSettings.highContrast
      ? parsedSettings.highContrast
      : false;
    userStore.settings.language = parsedSettings.language ? parsedSettings.language : 'en-US';
  }

  try {
    if (userStore.settings.language) {
      let langModule =
        languageModules[`../node_modules/quasar/lang/${userStore.settings.language}.js`];

      if (langModule) {
        const newLanguage = (await langModule()) as { default: typeof $q.lang };
        $q.lang.set(newLanguage.default);
      } else {
        langModule = languageModules[`../../node_modules/quasar/lang/en-US.js`];
        if (langModule) {
          const newLanguage = (await langModule()) as { default: typeof $q.lang };
          $q.lang.set(newLanguage.default);
        }

        userStore.settings.language = 'en-US';
      }
    }
  } catch (error) {
    console.error('Error setting language:', error);
  }
});

userStore.$subscribe((_mutation, state) => {
  if (state.settings.highContrast) {
    document.body.classList.add('highContrastMode');
  } else {
    document.body.classList.remove('highContrastMode');
  }

  localStorage.setItem('user-settings', JSON.stringify(state.settings));
});

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
