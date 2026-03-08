import { ref, computed } from 'vue';

export const isReducedMotions = computed(() => {
  return ref(window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true);
});
