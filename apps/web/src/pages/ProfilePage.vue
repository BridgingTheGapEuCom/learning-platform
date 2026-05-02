<template>
  <div class="w-full h-full flex">
    <h1>{{ $t('profile.myProfile') }}</h1>
    <div class="w-full rounded-md bg-dark p-4">
      <div class="text-xl text-primary mb-4 uppercase">
        {{ $t('profile.identityAndPublicProfile') }}
      </div>
      <div class="flex items-center">
        <q-avatar
          size="6rem"
          class="border-secondary"
          :class="{ border: !imageUrl }"
          rounded
          text-color="secondary"
          :icon="imageUrl ? undefined : 'person'"
        >
          <img v-if="imageUrl" :src="imageUrl" :alt="$t('profile.profilePictureAlt')" />
        </q-avatar>
        <div class="flex flex-col justify-center">
          <div class="text-2xl font-bold pl-4">
            {{ userStore.firstName }} {{ userStore.lastName }}
          </div>
          <div class="pl-4 opacity-60">{{ userStore.email }}</div>
        </div>
      </div>
      <div class="mt-8">
        <BTG_input
          v-model="userStore.displayName"
          labelBackground="var(--q-dark)"
          :label="$t('profile.displayName')"
          type="text"
        />
      </div>
    </div>
    <div class="w-full rounded-md bg-dark p-4 my-4">
      <div class="text-xl text-primary mb-4 uppercase">
        {{ $t('profile.sensoryAndAccessiblePreferences') }}
      </div>
      <div>
        <q-item tag="label" class="rounded-md" tabindex="-1">
          <q-item-section>
            <q-item-label id="reduced-motion-label">
              {{ $t('profile.reducedMotion') }}
              <q-icon name="fa-solid fa-circle-info" size="sm"
                ><q-tooltip class="text-body2">
                  {{ $t('profile.reducedMotionTooltip') }}
                </q-tooltip>
              </q-icon>
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-toggle
              v-model="reducedMotion"
              aria-labelledby="reduced-motion-label"
              color="primary"
              true-value="reduce"
              false-value="no-preference"
            />
          </q-item-section>
        </q-item>
        <q-item tag="label" class="rounded-md" tabindex="-1">
          <q-item-section>
            <q-item-label id="dyslexia-friendly-style">
              {{ $t('profile.dyslexiaFriendlyStyle') }}
              <q-icon name="fa-solid fa-circle-info" size="sm"
                ><q-tooltip class="text-body2">
                  {{ $t('profile.dyslexiaFriendlyStyleTooltip') }}
                </q-tooltip>
              </q-icon>
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-toggle
              v-model="userStore.settings.dyslexiaFriendlyStyle"
              aria-labelledby="dyslexia-friendly-style"
              color="primary"
            />
          </q-item-section>
        </q-item>
        <q-item tag="label" class="rounded-md" tabindex="-1">
          <q-item-section>
            <q-item-label id="focus-mode">
              {{ $t('profile.focusMode') }}
              <q-icon name="fa-solid fa-circle-info" size="sm"
                ><q-tooltip class="text-body2">
                  {{ $t('profile.focusModeTooltip') }}
                </q-tooltip>
              </q-icon>
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-toggle
              v-model="userStore.settings.focusMode"
              aria-labelledby="focus-mode"
              color="primary"
            />
          </q-item-section>
        </q-item>
        <q-item tag="label" class="rounded-md" tabindex="-1">
          <q-item-section>
            <q-item-label id="hide-timers">
              {{ $t('profile.hideTimers') }}
              <q-icon name="fa-solid fa-circle-info" size="sm"
                ><q-tooltip class="text-body2">
                  {{ $t('profile.hideTimersTooltip') }}
                </q-tooltip>
              </q-icon>
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-toggle
              v-model="userStore.settings.hideTimers"
              aria-labelledby="hide-timers"
              color="primary"
            />
          </q-item-section>
        </q-item>
        <q-item tag="label" class="rounded-md" tabindex="-1">
          <q-item-section>
            <q-item-label id="highContrastMode">
              {{ $t('profile.highContrastMode') }}
              <q-icon name="fa-solid fa-circle-info" size="sm"
                ><q-tooltip class="text-body2">
                  {{ $t('profile.highContrastModeTooltip') }}
                </q-tooltip>
              </q-icon>
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-toggle
              v-model="userStore.settings.highContrast"
              aria-labelledby="highContrastMode"
              color="primary"
            />
          </q-item-section>
        </q-item>
        <BTG_input
          v-model="fontSize"
          class="mt-4"
          :label="$t('profile.fontSize')"
          :min="minFontSize"
          :max="maxFontSize"
          labelBackground="var(--q-dark)"
          type="number"
        >
          <template v-slot:after>
            <q-btn
              v-if="fontSize !== defaultFontSize"
              icon="fa-solid fa-rotate-left"
              flat
              @click="fontSize = defaultFontSize"
              ><q-tooltip class="text-body2">
                {{ $t('profile.revertToDefault') }}
              </q-tooltip>
            </q-btn>
          </template>
        </BTG_input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from 'src/stores/user';
import { computed, ref, type Ref, watch } from 'vue';
import BTG_input from 'src/components/BTG_elements/BTG_input.vue';
import { usePreferredReducedMotion } from '@vueuse/core';
import { useCssVar } from '@vueuse/core';

const imageUrl: Ref<string> = ref('');

const minFontSize = 12;
const maxFontSize = 25;
const defaultFontSize = 15;

const userStore = useUserStore();

const reducedMotion = ref(
  userStore.settings.reducedMotion
    ? userStore.settings.reducedMotion
    : usePreferredReducedMotion().value,
);

const fontSizeVariable = useCssVar('--default-font-size');

const fontSize = computed({
  get() {
    if (!fontSizeVariable.value) return defaultFontSize;
    return Number(fontSizeVariable.value.replace('px', ''));
  },
  set(newValue: string) {
    if (Number(newValue) < minFontSize || Number(newValue) > maxFontSize) {
      return;
    }
    fontSizeVariable.value = `${newValue}px`;
  },
});

watch(fontSizeVariable, (current, previous) => {
  if (previous !== current) {
    userStore.settings.fontSize = current ? current : '15px';
  }
});

watch(reducedMotion, (current) => {
  userStore.settings.reducedMotion = current;
});
</script>
