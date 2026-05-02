<template>
  <Base-card
    class="h-full flex flex-col justify-between"
    :grid-i="props.gridI"
    v-model:grid-x="gridX"
    v-model:grid-y="gridY"
    v-model:grid-width="gridWidth"
    v-model:grid-height="gridHeight"
    :grid-min-width="4"
    :grid-min-height="3"
    :grid-max-width="12"
    :grid-max-height="1000"
  >
    <div class="h-full flex flex-col justify-between">
      <div class="text-bold mb-2 text-xl">Jump Back in</div>
      <div class="flex-grow flex flex-col justify-center">
        <div>Course: <b>Python 101</b></div>
        <q-linear-progress class="my-1" size="xl" rounded :value="progress" />
        <div class="text-right">{{ progress * 100 }}% complete</div>
      </div>
      <div class="w-full flex justify-center">
        <BTG_btn label="Resume" class="resume-button"></BTG_btn>
      </div>
    </div>
  </Base-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseCard from './BaseCard.vue';
import BTG_btn from '../BTG_elements/BTG_btn.vue';

const props = defineProps<{ gridI: number }>();

const gridX = defineModel<number>('gridX', { default: 0 });
const gridY = defineModel<number>('gridY', { default: 0 });
const gridWidth = defineModel<number>('gridWidth', { default: 3 });
const gridHeight = defineModel<number>('gridHeight', { default: 1 });

const progress = ref(0.3);
</script>

<style scoped>
.resume-button {
  min-width: min(100%, 24rem);
}
</style>
