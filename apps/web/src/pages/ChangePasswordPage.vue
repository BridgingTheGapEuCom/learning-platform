<template>
  <q-page class="h-full flex flex-col items-center">
    <div class="flex flex-col flex-grow min-w-1/3">
      <div class="flex flex-col gap-4 flex-grow justify-center">
        <div
          ref="invalid-credentials"
          v-if="newPassword !== newPasswordRepeat && submitted"
          tabindex="0"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          class="border p-3 rounded-md bg-negative text-white text-lg font-semibold border-red-700"
          :class="{ 'text-black': !settings.highContrast }"
        >
          {{ t('app.changePassword.passwordsDoNotMatch') }}
        </div>
        <q-form
          class="flex flex-col gap-4"
          autofocus
          no-reset-focus
          greedy
          @submit.prevent="changePassword"
        >
          <BTG_input v-model="newPassword" :label="t('app.changePassword.newPassword')"></BTG_input>
          <BTG_input
            v-model="newPasswordRepeat"
            :label="t('app.changePassword.repeatNewPassword')"
          ></BTG_input>
          <q-separator class="q-my-md" />
          <BTG_btn type="submit" :label="t('app.changePassword.changePassword')"></BTG_btn>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import BTG_btn from 'src/components/BTG_elements/BTG_btn.vue';
import BTG_input from 'src/components/BTG_elements/BTG_input.vue';
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/axios';
import { useUserStore } from 'src/stores/user';
import { type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const newPassword: Ref<string> = ref('');
const newPasswordRepeat: Ref<string> = ref('');
const submitted: Ref<boolean> = ref(false);
const { t } = useI18n();
const userStore = useUserStore();
const { settings } = storeToRefs(userStore);

const changePassword = async () => {
  submitted.value = true;
  try {
    await api.post('/api/user/change-password', {
      newPassword: newPassword.value,
    });
  } catch (error) {
    console.error(error);
  }
};
</script>
