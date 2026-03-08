<template>
  <q-btn class="BTG_btn" v-bind="{ ...props, ...$attrs }">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </q-btn>
</template>

<script setup lang="ts">
import type { QBtnProps } from 'quasar';
import { useUserStore } from 'src/stores/user';
import { computed } from 'vue';
import { isReducedMotions } from '../helpers';

interface Props extends Omit<QBtnProps, 'onClick'> {
  borderColor?: string;
  highContrastBorderColor?: string;
  highContrastColor?: string;
}

const userStore = useUserStore();

const props = withDefaults(defineProps<Props>(), {
  color: 'dark',
  size: '1rem',
  unelevated: true,
  borderColor: 'primary',
  highContrastBorderColor: 'primary',
  ripple: isReducedMotions ? false : true,
  highContrastColor: '--text-color',
});

/**
 * Computes the border color for the button component.
 *
 * @returns {string} A CSS variable string (e.g., 'var(--q-primary)' or 'var(--my-custom-color)')
 *                   that represents the computed border color.
 *
 * @param {object} props - Implicitly uses `props.borderColor` and `props.highContrastBorderColor`.
 * @param {object} userStore.settings - Implicitly uses `userStore.settings.highContrast` to determine
 *                                      whether to apply high contrast styling.
 *
 * @remarks
 * This computed property dynamically determines the border color based on the `userStore`'s
 * high contrast setting and the component's `borderColor` or `highContrastBorderColor` props.
 *
 * @edgecases
 * - If `userStore.settings.highContrast` is `true`:
 *   - The value of `props.highContrastBorderColor` is used.
 *   - If `props.highContrastBorderColor` starts with `'--'`, it is treated as a direct CSS variable name
 *     (e.g., `highContrastBorderColor: '--my-color'` results in `var(--my-color)`).
 *   - Otherwise, it is prefixed with `'--q-'` to reference a Quasar color palette variable
 *     (e.g., `highContrastBorderColor: 'primary'` results in `var(--q-primary)`).
 * - If `userStore.settings.highContrast` is `false`:
 *   - The value of `props.borderColor` is used.
 *   - If `props.borderColor` starts with `'--'`, it is treated as a direct CSS variable name
 *     (e.g., `borderColor: '--custom-border'` results in `var(--custom-border)`).
 *   - Otherwise, it is prefixed with `'--q-'` to reference a Quasar color palette variable
 *     (e.g., `borderColor: 'accent'` results in `var(--q-accent)`).
 */
const borderColorComputed = computed(() => {
  if (userStore.settings.highContrast) {
    if (props.highContrastBorderColor.startsWith('--')) {
      return `var(${props.highContrastBorderColor})`;
    } else {
      return `var(--q-${props.highContrastBorderColor})`;
    }
  }
  if (props.borderColor.startsWith('--')) {
    return `var(${props.borderColor})`;
  }
  return `var(--q-${props.borderColor})`;
});

/**
 * Computes the text color for the button component.
 *
 * @returns {string} A CSS variable string (e.g., 'var(--q-dark-page)' or 'var(--my-custom-color)')
 *                   that represents the computed text color.
 *
 * @param {object} props - Implicitly uses `props.highContrastColor` to determine the text color
 *                         when high contrast is enabled.
 * @param {object} userStore.settings - Implicitly uses `userStore.settings.highContrast` to determine
 *                                      whether to apply high contrast styling.
 *
 * @remarks
 * This computed property dynamically determines the text color based on the `userStore`'s
 * high contrast setting and the component's `highContrastColor` prop.
 *
 * @edgecases
 * - If `userStore.settings.highContrast` is `true`:
 *   - The value of `props.highContrastColor` is used.
 *   - If `props.highContrastColor` starts with `'--'`, it is treated as a direct CSS variable name
 *     (e.g., `highContrastColor: '--my-color'` results in `var(--my-color)`).
 *   - Otherwise, it is prefixed with `'--q-'` to reference a Quasar color palette variable
 *     (e.g., `highContrastColor: 'primary'` results in `var(--q-primary)`).
 * - If `userStore.settings.highContrast` is `false`:
 *   - The text color is always set to `var(--q-dark-page)`.
 */
const textColor = computed(() => {
  if (userStore.settings.highContrast) {
    if (props.highContrastColor.startsWith('--')) {
      return `var(${props.highContrastColor})`;
    } else {
      return `var(--q-${props.highContrastColor})`;
    }
  }
  if (userStore.settings.highContrast) {
    return `white`;
  }
  return `var(--q-dark-page)`;
});

defineOptions({ inheritAttrs: false });
</script>

<style lang="scss">
.BTG_btn {
  /**
 * Styles for the Quasar button component to enforce a custom border and handle disabled states.
 *
 * @parameter v-bind(borderColorComputed) - The dynamic border color calculated based on user settings and props.
 *
 * @edgecase
 * - When the button has the `.disabled` class, the border color is overridden to a specific stone palette variable.
 */
  &.q-btn {
    border-width: 2px !important;
    border-color: v-bind(borderColorComputed);
    border-style: solid;

    &.disabled {
      border-color: var(--border-color);
    }

    &.BTG_btn--loading {
      border-width: 0 !important;
      background-color: var(--q-dark) !important;
    }
  }

  /**
 * Handles the text color transition during hover and focus states for active buttons.
 *
 * @parameter v-bind(textColor) - The dynamic text color determined by high-contrast settings.
 *
 * @edgecase
 * - These styles are explicitly disabled for buttons with the `.disabled` class.
 */
  &.q-btn:not(.disabled):not(.BTG_btn--loading):hover,
  &.q-btn:not(.disabled):not(.BTG_btn--loading):focus {
    color: v-bind(textColor) !important;
    transition: color 0.3s linear;
  }

  /**
 * Customizes the Quasar focus-helper element to create a solid background fill on interaction.
 *
 * @parameter v-bind(borderColorComputed) - The background color of the helper, matching the button's border.
 *
 * @remarks
 * - Resets the default Quasar border-radius.
 * - Disables default pseudo-elements (::after, ::before) to prevent overlapping effects.
 */
  & .q-focus-helper {
    background-color: v-bind(borderColorComputed) !important;
    border-radius: 0 !important;
    transition:
      background-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1),
      opacity 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  }

  /**
   * Suppresses default Quasar highlight overlays to prevent interference with custom interaction styles.
   *
   * @parameter opacity - Hardcoded to 0 via !important to override Quasar's internal pseudo-element styling.
   * @returns {void} - Ensures that the ::after and ::before pseudo-elements do not render visual changes.
   *
   * @edgecase
   * - By forcing opacity to 0, it ensures the button's interaction state is strictly controlled
   *   by the parent .q-focus-helper background-color, preventing unintended color blending.
   */
  & .q-focus-helper::after {
    opacity: 0 !important;
  }

  & .q-focus-helper::before {
    opacity: 0 !important;
  }

  /**
 * Controls the visibility of the custom focus-helper when the parent button is hovered or focused.
 */
  &.q-hoverable:hover > .q-focus-helper,
  &.q-focusable:focus > .q-focus-helper {
    opacity: 1 !important;
  }
}
</style>
