<template>
  <div class="h-full w-full flex flex-grow flex-col">
    <div class="flex justify-between items-center mb-4">
      <b class="text-2xl">{{ t('dashboard.title') }}</b>
      <div class="flex gap-2">
        <BTG_btn
          v-if="editable"
          icon="sym_o_cancel"
          borderColor="--q-negative"
          :label="t('dashboard.cancel')"
          @click="cancelEditing"
        ></BTG_btn>
        <BTG_btn
          :icon="editable ? 'sym_o_save' : 'sym_o_dashboard_customize'"
          :label="editable ? t('dashboard.save') : t('dashboard.edit')"
          @click="startEditing"
        ></BTG_btn>
      </div>
    </div>
    <div class="h-full flex-grow relative" :class="{ 'visual-edit-grid': editable }">
      <GridLayout
        ref="gridLayoutRef"
        class="min-h-full"
        v-model:layout="layout"
        :col-num="12"
        :row-height="80"
        :vertical-compact="false"
        use-css-transforms
        :is-resizable="editable"
        :is-draggable="editable"
        prevent-collision
      >
        <template v-for="(item, i) of allLayouts" :key="item.i">
          <AddCard
            v-if="item.cardType === 'AddCard'"
            :grid-i="i + 100"
            v-model:grid-x="item.x"
            v-model:grid-y="item.y"
            v-model:grid-width="item.w"
            v-model:grid-height="item.h"
            @triggerLayoutUpdate="triggerLayoutUpdate"
            @resizingOrMoving="resizingOrMoving"
          />
          <JumpBack
            v-if="item.cardType === 'JumpBack'"
            :grid-i="item.i"
            v-model:grid-x="item.x"
            v-model:grid-y="item.y"
            v-model:grid-width="item.w"
            v-model:grid-height="item.h"
            :editable="editable"
            @deleteCard="deleteCard"
            @triggerLayoutUpdate="triggerLayoutUpdate"
            @resizingOrMoving="resizingOrMoving"
          />
        </template>
      </GridLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import BTG_btn from './BTG_elements/BTG_btn.vue';
import JumpBack from './dashboard/JumpBack.vue';
import AddCard from './dashboard/AddCard.vue';
import { GridLayout } from 'grid-layout-plus';

const { t } = useI18n();

interface GridItemInterface {
  x: number;
  y: number;
  w: number;
  h: number;
  i: number;
  cardType: 'JumpBack' | 'AddCard';
}

const editable = ref(false);
const resizingOrMovingCard = ref(false);
const isMac = ref(false);

const layout = ref([
  { x: 0, y: 0, w: 6, h: 3, i: 0, cardType: 'JumpBack' },
  { x: 6, y: 0, w: 6, h: 3, i: 1, cardType: 'JumpBack' },
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
  if (!editable.value) return;

  layout.value = JSON.parse(JSON.stringify(tempLayout.value));
  tempLayout.value = [];
  editable.value = false;
};

const isOccupied = (x: number, y: number) => {
  return layout.value.some(
    (item) => x >= item.x && x < item.x + item.w && y >= item.y && y < item.y + item.h,
  );
};

const editingLayout = computed(() => {
  if (!editable.value) return [];
  let maxHeight = 0;
  layout.value.forEach((item) => {
    maxHeight = Math.max(maxHeight, item.y + item.h);
  });

  const freeCells: [number, number][] = [];
  for (let j = 0; j < maxHeight; j++) {
    for (let i = 0; i < 12; i++) {
      if (!isOccupied(i, j)) {
        freeCells.push([i, j]);
      }
    }
  }

  const boxes: GridItemInterface[] = [];
  let i = 1000;
  const used = new Set<string>();

  freeCells.forEach(([x, y]) => {
    i++;
    if (used.has(`${x},${y}`)) return;

    let w = 0;
    while (x + w < 12 && !isOccupied(x + w, y) && !used.has(`${x + w},${y}`)) {
      w++;
    }

    let h = 0;
    let canExpandH = true;
    while (y + h < maxHeight && canExpandH) {
      for (let dx = 0; dx < w; dx++) {
        if (isOccupied(x + dx, y + h) || used.has(`${x + dx},${y + h}`)) {
          canExpandH = false;
          break;
        }
      }
      if (canExpandH) h++;
    }

    if (w >= 3 && h >= 3) {
      boxes.push({ x, y, w, h, i, cardType: 'AddCard' });
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          used.add(`${x + dx},${y + dy}`);
        }
      }
    }
  });

  boxes.push({ x: 0, y: maxHeight, w: 12, h: 3, i, cardType: 'AddCard' });
  return boxes;
});

// const addCard = (box: any) => {
//   const newId = layout.value.length > 0 ? Math.max(...layout.value.map((i) => i.i)) + 1 : 0;
//   layout.value.push({ x: box.x, y: box.y, w: box.w, h: box.h, i: newId, cardType: 'AddCard' });
//   triggerLayoutUpdate();
// };

const resizingOrMoving = (resizingOrMoving: boolean) => {
  resizingOrMovingCard.value = resizingOrMoving;
};

const allLayouts = computed(() => {
  const tempArray = [...layout.value, ...editingLayout.value];

  if (resizingOrMovingCard.value) {
    return tempArray;
  }

  return tempArray.sort((a, b) => {
    if (a.y > b.y) {
      return 1;
    } else if (a.y < b.y) {
      return -1;
    } else if (a.y === b.y) {
      if (a.x > b.x) {
        return 1;
      } else if (a.x < b.x) {
        return -1;
      }
    }
    return 0;
  });
});

const handleGlobalSearchShortcut = (event: KeyboardEvent) => {
  if (event.key.toLowerCase() === 'escape') {
    event.preventDefault();
    cancelEditing();
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    startEditing();
  }
};

onMounted(() => {
  isMac.value = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
  window.addEventListener('keydown', handleGlobalSearchShortcut);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalSearchShortcut);
});
</script>

<style scoped>
.vgl-layout {
  --vgl-placeholder-bg: var(--q-secondary);

  --vgl-resizer-size: 1.5rem;
  --vgl-resizer-border-color: var(--q-primary);
  --vgl-resizer-border-width: 0.3rem;
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
