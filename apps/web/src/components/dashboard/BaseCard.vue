<template>
  <GridItem
    class="rounded-md group"
    :i="props.gridI"
    v-model:x="gridX"
    v-model:y="gridY"
    v-model:w="gridWidth"
    v-model:h="gridHeight"
    :min-w="props.gridMinWidth"
    :min-h="props.gridMinHeight"
    :max-w="props.gridMaxWidth"
    :max-h="props.gridMaxHeight"
    @resize="resizing = true"
    @resized="resizing = false"
    @container-resized="resizing = false"
  >
    <q-dialog v-model="confirmDelete" backdrop-filter="blur(4px)">
      <q-card>
        <q-card-section class="min-w-120">
          <q-avatar icon="sym_o_delete" class="text-negative" />
          <span class="text-negative">Remove Dashboard Card?</span>
        </q-card-section>

        <q-separator />

        <q-card-section class="my-4 ml-4 text-xl">
          Are you sure you want to delete this card?
        </q-card-section>

        <q-separator />

        <q-card-actions class="flex justify-between">
          <BTG_btn label="Cancel" icon="sym_o_cancel" v-close-popup />
          <BTG_btn
            label="Delete"
            borderColor="--q-negative"
            icon="sym_o_delete"
            v-close-popup
            @click="deleteCard"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div
      v-if="editable"
      class="absolute z-10 rounded-md bg-dark top-0 left-0 w-full h-full pointer-events-none group-hover:opacity-95 group-focus-within:opacity-95"
      :class="{ 'opacity-95': resizing, 'opacity-50': !resizing }"
      @blur="resizing = false"
    ></div>
    <svg
      v-if="editable"
      class="absolute top-0 left-0 w-full h-full pointer-events-none z-20 rounded-md"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="calc(100% - 2px)"
        height="calc(100% - 2px)"
        fill="none"
        class="transition-colors duration-200"
        :class="
          widgetMoveMode || resizing
            ? 'stroke-[var(--q-primary)]'
            : 'stroke-neutral-600 group-hover:stroke-[var(--q-primary)] group-focus-within:stroke-[var(--q-primary)]'
        "
        rx="6"
        stroke-width="2"
        stroke-dasharray="10 6"
      />
    </svg>
    <div
      v-if="editable"
      class="w-full h-full flex absolute top-0 right-0 p-4 group-focus-within:z-20"
    >
      <div class="flex flex-col justify-between gap-2">
        <div class="z-[-1] flex flex-col justify-between gap-2 group-focus-within:z-20">
          <BTG_btn
            ref="moveWidgetBtn"
            icon="sym_o_open_with"
            label="Move Card"
            @click="onMoveWidgetClick"
            @blur="widgetMoveMode = false"
          ></BTG_btn>
          <BTG_btn
            ref="resizeWidgetBtn"
            icon="sym_o_open_in_full"
            label="Resize Card"
            @click="onResizeWidgetClick"
            @blur="widgetResizeMode = false"
          ></BTG_btn>
        </div>
        <BTG_btn
          class="group-focus-within:z-20 group-hover:z-20"
          :class="{ 'z-20': resizing, 'z-[-1]': !resizing }"
          borderColor="--q-negative"
          icon="sym_o_delete"
          label="Delete Card"
          @click="confirmDelete = true"
        ></BTG_btn>
      </div>

      <div class="flex flex-1 justify-center items-center px-4 text-center">
        <b v-if="widgetMoveMode" class="text-[clamp(3rem, 6vw, 5rem)]"
          >Use Arrow Keys to move the element</b
        >
        <b v-else-if="widgetResizeMode" class="text-[clamp(2rem, 6vw, 5rem)]"
          >Use Arrow Keys to adjust the element</b
        >
      </div>
    </div>
    <div
      class="rounded-md bg-dark p-4 w-full h-full"
      :class="{ 'select-none pointer-events-none': editable }"
      :inert="editable"
    >
      <slot></slot>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, watch, useTemplateRef, onMounted, onUnmounted, inject } from 'vue';
import { GridItem } from 'grid-layout-plus';
import { useQuasar } from 'quasar';
import { computed } from 'vue';
import BTG_btn from '../BTG_elements/BTG_btn.vue';

const emit = defineEmits(['deleteCard']);

interface Props {
  gridI: number;
  gridMinWidth: number;
  gridMinHeight: number;
  gridMaxWidth: number;
  gridMaxHeight: number;
  editable?: boolean | undefined;
}

const props = defineProps<Props>();

const $q = useQuasar();

const gridXModel = defineModel<number>('gridX', { default: 0 });
const gridYModel = defineModel<number>('gridY', { default: 0 });
const gridWidthModel = defineModel<number>('gridWidth', { default: 4 });
const gridHeight = defineModel<number>('gridHeight', { default: 1 });

const gridWidth = computed({
  get: () => ($q.screen.lt.sm ? 12 : gridWidthModel.value),
  set: (val) => {
    gridWidthModel.value = val;
  },
});

const gridX = computed({
  get: () => ($q.screen.lt.sm ? 1 : gridXModel.value),
  set: (val) => {
    gridXModel.value = val;
  },
});

const gridY = computed({
  get: () => ($q.screen.lt.sm ? props.gridI : gridYModel.value),
  set: (val) => {
    gridYModel.value = val;
  },
});

const widgetMoveMode = ref(false);
const widgetResizeMode = ref(false);

const resizing = ref(false);

const moveWidgetBtn = useTemplateRef<typeof BTG_btn>('moveWidgetBtn');
const resizeWidgetBtn = useTemplateRef<typeof BTG_btn>('resizeWidgetBtn');

const confirmDelete = ref(false);

const triggerLayoutUpdate = inject<() => void>('triggerLayoutUpdate');

const handlePositionChange = () => {
  if (triggerLayoutUpdate) {
    triggerLayoutUpdate();
  }
};

const onMoveWidgetClick = () => {
  moveWidgetBtn.value?.focus();
  widgetMoveMode.value = !widgetMoveMode.value;
};

const onResizeWidgetClick = () => {
  resizeWidgetBtn.value?.focus();
  widgetResizeMode.value = !widgetResizeMode.value;
};

watch(
  () => props.editable,
  () => {
    widgetMoveMode.value = false;
  },
);

const handleArrowKeys = (event: KeyboardEvent) => {
  if (!widgetMoveMode.value && !widgetResizeMode.value) return;

  const step = 1;

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      if (widgetMoveMode.value) {
        gridYModel.value = Math.max(0, gridYModel.value - step);
      } else if (widgetResizeMode.value) {
        const minHeight = props.gridMinHeight || 1;
        if (gridHeight.value > minHeight) {
          gridHeight.value -= step;
        }
      }
      handlePositionChange();
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (widgetMoveMode.value) {
        gridYModel.value += step;
      } else if (widgetResizeMode.value) {
        gridHeight.value += step;
      }
      handlePositionChange();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      if (widgetMoveMode.value) {
        gridXModel.value = Math.max(0, gridXModel.value - step);
      } else if (widgetResizeMode.value) {
        const minWidth = props.gridMinWidth || 1;
        if (gridWidth.value > minWidth) {
          gridWidth.value -= step;
        }
      }
      handlePositionChange();
      break;
    case 'ArrowRight':
      event.preventDefault();
      if (widgetMoveMode.value) {
        if (gridXModel.value + gridWidth.value < 12) {
          gridXModel.value += step;
        }
      } else if (widgetResizeMode.value) {
        const maxWidth = props.gridMaxWidth || 12;
        const availableWidth = 12 - gridXModel.value;
        if (gridWidth.value < maxWidth && gridWidth.value < availableWidth) {
          gridWidth.value += step;
        }
      }
      handlePositionChange();
      break;
    case 'Escape':
      event.preventDefault();
      widgetMoveMode.value = false;
      widgetResizeMode.value = false;
      break;
  }
};

const deleteCard = () => {
  emit('deleteCard', props.gridI);
};

onMounted(() => {
  window.addEventListener('keydown', handleArrowKeys);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleArrowKeys);
});
</script>
