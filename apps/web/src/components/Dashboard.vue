<template>
  <div class="h-full w-full flex flex-grow flex-col">
    <div class="flex justify-between items-center mb-4">
      <b class="text-2xl">Dashboard</b>
      <div class="flex gap-2">
        <BTG_btn
          v-if="editable"
          icon="sym_o_cancel"
          borderColor="--q-negative"
          label="Cancel"
          @click="cancelEditing"
        ></BTG_btn>
        <BTG_btn
          :icon="editable ? 'sym_o_save' : 'sym_o_dashboard_customize'"
          :label="editable ? 'Save Dashboard' : 'Edit Dashboard'"
          @click="startEditing"
        ></BTG_btn>
      </div>
    </div>
    <div class="h-full flex-grow" :class="{ 'visual-edit-grid': editable }">
      <GridLayout
        ref="gridLayoutRef"
        class="min-h-full"
        v-model:layout="layout"
        :row-height="80"
        :vertical-compact="false"
        use-css-transforms
        :is-resizable="editable"
        :is-draggable="editable"
        prevent-collision
      >
        <JumpBack
          v-for="item of layout"
          :key="item.i"
          :grid-i="item.i"
          v-model:grid-x="item.x"
          v-model:grid-y="item.y"
          v-model:grid-width="item.w"
          v-model:grid-height="item.h"
          :editable="editable"
          @deleteCard="deleteCard"
        />
      </GridLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import BTG_btn from './BTG_elements/BTG_btn.vue';
import JumpBack from './dashboard/JumpBack.vue';
import { GridLayout } from 'grid-layout-plus';

const editable = ref(false);

const layout = ref([
  { x: 0, y: 0, w: 6, h: 3, i: 0 },
  { x: 6, y: 0, w: 6, h: 3, i: 1 },
]);

const tempLayout = ref([]);
const gridLayoutRef = ref();

const triggerLayoutUpdate = () => {
  if (gridLayoutRef.value) {
    layout.value = [...layout.value];
  }
};

const deleteCard = (gridI: number) => {
  layout.value = layout.value.filter((item) => item.i !== gridI);
  triggerLayoutUpdate();
};

const startEditing = () => {
  if (editable.value) {
    editable.value = false;
    return;
  }

  tempLayout.value = JSON.parse(JSON.stringify(layout.value));
  editable.value = true;
};

const cancelEditing = () => {
  layout.value = JSON.parse(JSON.stringify(tempLayout.value));
  tempLayout.value = [];
  editable.value = false;
};

provide('triggerLayoutUpdate', triggerLayoutUpdate);
</script>

<style scoped>
.vgl-layout {
  --vgl-placeholder-bg: var(--q-secondary);

  --vgl-resizer-size: 20px;
  --vgl-resizer-border-color: var(--q-primary);
  --vgl-resizer-border-width: 4px;
}

:deep(.vgl-item__resizer) {
  z-index: 50;
  right: 0.5rem;
  bottom: 0.5rem;
}

.visual-edit-grid {
  width: calc(100% - 5px);
  height: calc(100% - 5px);
  margin: 5px;
  background-image:
    linear-gradient(to right, rgba(0, 229, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 229, 255, 0.1) 1px, transparent 1px);
  background-repeat: repeat;
  background-size: calc(calc(100% - 5px) / 12) 90px;
}
</style>
