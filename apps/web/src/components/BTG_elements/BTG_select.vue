<template>
  <q-select
    ref="selectRef"
    class="BTG_select"
    v-bind="{ ...(props as any), ...$attrs }"
    v-model="innerValue"
    popup-content-class="BTG_select__menu"
    @validation-error="hasErrorState = true"
    @validation-success="hasErrorState = false"
    @clear="hasErrorState = false"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </q-select>
</template>

<script setup lang="ts">
import type { QSelect, QSelectProps } from 'quasar';
import { useUserStore } from 'src/stores/user';
import { computed, ref, watch } from 'vue';

/**
 * Interface defining the component props.
 * Extends Quasar's QSelectProps while allowing custom modelValue types and high contrast settings.
 */
interface Props extends Omit<QSelectProps, 'modelValue' | 'onUpdate:modelValue'> {
  /** The value of the select element, supporting strings, numbers, or null/undefined. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelValue?: any;
  /** The color used for borders when the user has high contrast mode enabled. */
  highContrastBorderColor?: string;
  labelBackground?: 'var(--q-dark-page)';
}
/**
 * Component props with default values.
 * @type {Props}
 */
const props = withDefaults(defineProps<Props>(), {
  borderless: true,
  dark: true,
  color: 'primary',
  highContrastBorderColor: 'primary',
  labelBackground: 'var(--q-dark-page)',
});

/**
 * Component event emitters.
 * @fires update:modelValue - Emitted when the select's value changes.
 */
const emit = defineEmits(['update:modelValue']);

/**
 * Computed property to facilitate two-way binding for the select value.
 * Maps local changes back to the parent component via emits.
 */
const innerValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

/** Template reference to the underlying Quasar QSelect component instance. */
const selectRef = ref<QSelect | null>(null);
/** Reactive state tracking whether the component is currently displaying an error. */
const hasErrorState = ref(false);
/** Access to the user store for global settings such as high contrast mode. */
const userStore = useUserStore();

/**
 * Watches the external 'error' prop to keep the internal error state in sync.
 * @param {boolean | undefined} val - The new value of the error prop.
 */
watch(
  () => props.error,
  (val) => {
    if (val !== undefined) {
      hasErrorState.value = val ? val : false;
    }
  },
);

/**
 * Methods and properties exposed to parent components via template refs.
 */
defineExpose({
  /**
   * Triggers the validation logic on the underlying QSelect.
   * @returns {boolean | Promise<boolean> | undefined} The result of the validation.
   */
  validate: (): boolean | Promise<boolean> | undefined => selectRef.value?.validate(),
  /**
   * Resets the validation state and clears the local error flag.
   * @returns {void | undefined}
   */
  resetValidation: (): void | undefined => {
    hasErrorState.value = false;
    return selectRef.value?.resetValidation();
  },
  /** Sets focus on the select element. */
  focus: () => selectRef.value?.focus(),
  /** Removes focus from the select element. */
  blur: () => selectRef.value?.blur(),
  /** Computed status indicating if the component is in an error state. */
  hasError: computed(() => hasErrorState.value),
});

/**
 * Determines the CSS border color based on the current theme and user settings.
 *
 * @returns {string} A CSS 'var()' function string referencing the appropriate color variable.
 * @edgeCase If userStore.settings.highContrast is true, it prioritizes the highContrastBorderColor prop.
 * @edgeCase If the color string starts with '--', it is treated as a raw CSS variable name.
 * @edgeCase If the color string does not start with '--', it is prefixed with '--q-' to target Quasar theme colors.
 */
const borderColor = computed(() => {
  if (userStore.settings.highContrast) {
    if (props.highContrastBorderColor.startsWith('--')) {
      return `var(${props.highContrastBorderColor})`;
    } else {
      return `var(--q-${props.highContrastBorderColor})`;
    }
  }
  if (props.color.startsWith('--')) {
    return `var(${props.color})`;
  }
  return `var(--q-${props.color})`;
});

/** Configures component options, specifically disabling automatic attribute inheritance. */
defineOptions({ inheritAttrs: false });
</script>

<style lang="scss">
.BTG_select {
  cursor: pointer;

  & .q-field__label {
    transform: translateY(-130%) scale(1) !important;
    font-size: 1.1rem;
    background: v-bind(labelBackground);
    margin: 0 0.75rem;
    padding: 0 0.5rem;
    max-width: 133%;
    pointer-events: none;
    z-index: 10;
  }

  & .q-field__control-container {
    padding-top: 0.5rem !important;
  }

  & .q-field__label {
    transition: color 0.3s ease-in-out;
  }

  &:not(.q-field--error) .q-field__control:hover {
    & .q-field__label {
      color: v-bind(borderColor);
    }
  }

  & .q-field__native {
    padding-inline: 1rem;
  }

  & .q-field__native:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px var(--q-dark-page) inset !important;
    box-shadow: 0 0 0 1000px var(--q-dark-page) inset !important;
    -webkit-text-fill-color: var(--text-color) !important;
    caret-color: var(--text-color);
  }

  & .q-field__control:before {
    border-style: solid;
    border-color: var(--border-color);
    border-width: 2px;
    border-radius: 8px;
    transition: border-color 0.3s ease-in-out;
    z-index: 5;
  }

  &:not(.q-field--error) .q-field__control:focus-within:before {
    border: 2px solid v-bind(borderColor);
  }

  &:not(.q-field--error) .q-field__control:hover:before {
    border-color: var(--q-primary);
    border-width: 2px;
  }

  & .q-field__append .q-icon {
    transition: color 0.3s ease-in-out;
    color: var(--border-color);
  }

  &:hover .q-field__append .q-icon {
    color: v-bind(borderColor);
  }

  &.q-field--focused .q-field__append .q-icon {
    color: v-bind(borderColor);
  }

  &.q-field--error {
    & .q-field__control:before,
    & .q-field__control:hover:before,
    & .q-field__control:focus-within:before {
      border-color: var(--q-negative);
      border-width: 2px;
    }

    & .q-field__append .q-icon {
      color: var(--q-negative) !important;
    }

    & .q-field__messages div {
      font-weight: 600;
      font-size: 1rem;
    }

    & .q-field__bottom {
      padding: 4px 12px 0;
    }
  }
}

.BTG_select__menu {
  background: var(--q-dark) !important;

  & .q-virtual-scroll__content {
    background: var(--q-dark) !important;
  }

  & .q-item {
    color: var(--text-color) !important;
  }

  & .q-item--active {
    background: rgba(255, 255, 255, 0.1) !important;
  }
}
</style>
