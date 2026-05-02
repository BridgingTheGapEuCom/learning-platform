<template>
  <q-page class="h-full flex flex-col mx-3 items-center">
    <BTG_select
      v-model="settings.language"
      :options="langOptions"
      class="self-end min-w-40 absolute top-4 right-4"
      :label="t('app.login.language_label')"
      name="language"
      map-options
      emit-value
      @update:model-value="onLanguageChange"
    >
    </BTG_select>
    <div class="flex flex-col flex-grow">
      <div class="flex flex-col gap-4 flex-grow justify-center">
        <q-slide-transition>
          <div v-if="invalidCredentials">
            <div
              ref="invalid-credentials"
              tabindex="0"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              class="border p-3 rounded-md bg-negative text-black text-lg font-semibold border-red-700"
            >
              {{ t('app.login.invalid_credentials') }}
            </div>
          </div>
        </q-slide-transition>
        <h1>{{ t('app.login.welcome_title') }}</h1>
        <q-form
          ref="loginForm"
          class="flex flex-col gap-8"
          autofocus
          no-reset-focus
          greedy
          @submit.prevent="login"
        >
          <BTG_input
            v-model="email"
            borderless
            autocomplete="email"
            stack-label
            :label="t('app.login.email_label')"
            no-error-icon
            name="email"
            type="email"
            :rules="[
              (val, rules) =>
                (val && val.length > 0 && rules.email(val)) || t('app.validation.email_invalid'),
            ]"
          >
          </BTG_input>
          <BTG_input
            v-model="password"
            borderless
            stack-label
            no-error-icon
            bottom-slots
            autocomplete="current-password"
            :label="t('app.login.password_label')"
            :type="isPwd ? 'password' : 'text'"
            :rules="[(val) => (val && val.length > 0) || t('app.validation.password_required')]"
            ><template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer focus:outline-2 focusOutlineColor outline-offset-2 rounded-sm mr-4"
                tabindex="0"
                role="button"
                aria-hidden="false"
                :aria-label="t('app.login.toggle_password_visibility')"
                @keyup.space="isPwd = !isPwd"
                @keyup.enter="isPwd = !isPwd"
                @click="isPwd = !isPwd"
              ></q-icon>
            </template>
          </BTG_input>

          <BTG_btn
            :label="t('app.login.login_button')"
            high-contrast-color="--color-stone-950"
            :class="{ 'BTG_btn--loading': loading }"
            class="q-mt-md"
            type="submit"
            :disable="loading"
            :loading="loading"
          >
            <template v-slot:loading>
              <q-spinner class="on-left text-neutral-400"></q-spinner>
              <div class="capitalize text-neutral-400">{{ t('app.login.verifying') }}</div>
            </template>
          </BTG_btn>
        </q-form>

        <q-separator class="q-my-md" />

        <BTG_btn
          icon="fa-brands fa-google"
          border-color="--color-rose-300"
          high-contrast-border-color="--color-red-800"
          :disable="loading"
          :label="t('app.login.login_with_google')"
          :loading="loading"
          :href="loading ? undefined : 'http://localhost:3000/auth/google'"
        >
          <template v-slot:loading>
            <q-spinner class="on-left text-neutral-400"></q-spinner>
            <div class="capitalize text-neutral-400">{{ t('app.login.verifying') }}</div>
          </template>
        </BTG_btn>
      </div>

      <q-toggle
        class="self-center"
        size="lg"
        v-model="settings.highContrast"
        color="primary"
        keep-color
        :label="t('app.login.high_contrast_mode')"
      ></q-toggle>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { type User } from '@btg/shared-types';
import { storeToRefs } from 'pinia';
import { QForm } from 'quasar';
import languages from 'quasar/lang/index.json';
import { api } from 'src/boot/axios';
import BTG_btn from 'src/components/BTG_elements/BTG_btn.vue';
import BTG_input from 'src/components/BTG_elements/BTG_input.vue';
import BTG_select from 'src/components/BTG_elements/BTG_select.vue';
import * as locales from 'src/i18n';
import { useUserStore } from 'src/stores/user';
import { nextTick, type Ref, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const router = useRouter();

const invalidCredentials = ref(false);

const userStore = useUserStore();
const { settings } = storeToRefs(userStore);

const allLanguages = Object.keys(locales.default);

const email: Ref<string | null> = ref(null);
const password: Ref<string | null> = ref(null);
const isPwd: Ref<boolean> = ref(true);

const loading = ref(false);

const loginForm: Ref<QForm | null> = useTemplateRef('loginForm');
const invalidCredentialsRef = useTemplateRef('invalid-credentials');

const { locale, t } = useI18n();

const appLanguages = languages.filter((lang) => allLanguages.includes(lang.isoName));
const langOptions = appLanguages.map((lang) => ({
  label: lang.nativeName,
  value: lang.isoName,
}));

/**
 * Handles language change events.
 *
 * @param {string | number | null | undefined} value - The new language value to set.
 *   This can be a string representing the language code, a number (though not typically used),
 *   or null/undefined if no language is selected.
 *
 * @returns {void} This function doesn't return anything.
 *
 * @description
 * When a language is selected, this function:
 * 1. Sets the application's locale to the selected value (if provided)
 * 2. Resets the validation state of the login form
 *
 * @edge-cases
 * - If the value is null or undefined, the function does nothing
 * - The function assumes the value is a string when setting the locale
 * - The loginForm ref must be properly initialized before calling this function
 */
const onLanguageChange = (value: string | number | null | undefined) => {
  if (value) {
    locale.value = value as string;
    loginForm.value!.resetValidation();
  }
};

/**
 * Handles the user login process.
 *
 * @returns {Promise<void>} A promise that resolves once the login logic and navigation or error handling are finished.
 *
 * @description
 * This function validates the login form, then:
 * 1. Sends credentials to the server via a POST request.
 * 2. If authentication is successful (status 200), it updates the user store with the user's data and token, and redirects to the 'Home' page.
 * 3. If authentication fails or an error occurs, it sets an error flag and focuses the error alert element.
 *
 * @edge-cases
 * - If the form validation fails, the API call is skipped.
 * - If the server returns a non-200 status, the login is treated as unsuccessful.
 * - If the API call throws an error (e.g., network failure), it is caught, logged, and the user is notified.
 */
const login = async (): Promise<void> => {
  if (await loginForm.value!.validate()) {
    loading.value = true;
    try {
      const loginResponse = await api.post('/auth/login', {
        email: email.value!,
        password: password.value!,
      });
      if (loginResponse.status === 200) {
        const user: User = loginResponse.data.user;

        userStore.setAuth(loginResponse.data.access_token, user);

        await router.push({ name: 'Home' });
      } else {
        invalidCredentials.value = true;
        await nextTick(() => {
          invalidCredentialsRef.value!.focus();
        });
        console.error('Login failed:', loginResponse.data);
      }
    } catch (error) {
      invalidCredentials.value = true;
      await nextTick(() => {
        invalidCredentialsRef.value!.focus();
      });
      console.error('Login failed:', error);
    }

    loading.value = false;
  }
};
</script>

<style lang="scss"></style>
