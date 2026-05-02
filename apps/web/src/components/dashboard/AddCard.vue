<template>
  <Base-card
    class="flex flex-col justify-between bg-primary opacity-60 cursor-pointer"
    :grid-i="props.gridI"
    v-model:grid-x="gridX"
    v-model:grid-y="gridY"
    v-model:grid-width="gridWidth"
    v-model:grid-height="gridHeight"
    :hoverable="true"
    :resizable="false"
    :draggable="false"
    :grid-min-width="3"
    :grid-min-height="3"
    :grid-max-width="12"
    :grid-max-height="1000"
    tabindex="0"
  >
    <div
      class="w-full h-full flex flex-col items-center justify-center select-none text-2xl text-primary"
    >
      <div class="text-6xl mb-2">+</div>
      <div>Add Card</div>
    </div>
  </Base-card>
</template>

<script setup lang="ts">
import BaseCard from './BaseCard.vue';

const props = defineProps<{ gridI: number }>();

const gridX = defineModel<number>('gridX', { default: 0 });
const gridY = defineModel<number>('gridY', { default: 0 });
const gridWidth = defineModel<number>('gridWidth', { default: 3 });
const gridHeight = defineModel<number>('gridHeight', { default: 1 });
</script>
