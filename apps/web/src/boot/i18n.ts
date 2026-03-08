import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';
import * as locales from 'src/i18n';

export default boot(({ app }) => {
  const i18n = createI18n({
    fallbackLocale: 'en',
    messages: locales.default,
    legacy: false, // Use Composition API mode
    globalInjection: true, // Make $t and $i18n available globally
  });

  // Tell app to use the I18n instance
  app.use(i18n);

  // Expose the i18n instance globally for use in script setup
  // This isn't strictly necessary if using `useI18n()` inside components,
  // but can be useful for global access outside of components.
  // Quasar.$i18n = i18n; // Not standard, better to use provide/inject or useI18n()
});
