<template>
  <q-card class="bg-dark rounded" flat bordered>
    <q-card-section horizontal class="q-pa-md flex items-center">
      <div class="w-38 h-38">
        <q-img
          :src="course.thumbnail"
          class="rounded-borders"
          :ratio="1"
          :alt="`Thumbnail for ${title}`"
        />
      </div>

      <q-card-section class="h-38 q-pl-md q-pa-none flex-1 flex flex-col">
        <div class="flex-1 flex flex-col items-stretch justify-between">
          <div class="flex justify-start items-center">
            <div
              :class="`${statusTheme.textColor} bg-positive px-2 rounded flex items-center text-lg`"
            >
              <q-icon :name="statusTheme.icon" class="my-1 mr-1" aria-hidden="true" />
              <div>{{ status }}</div>
            </div>
          </div>

          <div class="grid">
            <div class="text-2xl text-bold line-clamp-2 min-w-0">
              {{ title }}
            </div>
          </div>

          <div class="text-sm text-gray-300">
            <div>{{ course.learners }} Active Learners</div>

            <q-badge
              v-if="course.assignments > 0 && status === 'Published'"
              color="cyan"
              text-color="dark"
              class="mt-1 px-2 py-0.5 font-bold"
            >
              {{ course.assignments }} Assignments to Review
            </q-badge>
            <div v-else class="mt-1">{{ course.assignments }} Assignments</div>
          </div>
        </div>
      </q-card-section>
    </q-card-section>

    <q-card-actions class="q-pa-md q-pt-none row items-center no-wrap">
      <q-btn outline color="cyan" label="Edit Course" class="rounded-md" />
      <q-btn
        v-if="status === 'Published'"
        outline
        color="grey-5"
        label="Manage Learners"
        class="rounded-md q-ml-sm"
      />

      <q-space />

      <q-btn
        flat
        round
        dense
        color="grey-5"
        icon="sym_o_more_horiz"
        aria-label="More course actions"
      >
        <q-menu class="bg-[#1e1e2e] text-white border border-[#00e5ff]/20">
          <q-list style="min-width: 150px">
            <q-item clickable v-close-popup>
              <q-item-section>Duplicate Course</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section class="text-red-400">Archive Course</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  course: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

// Still using Quasar's internal color system ('positive', 'warning')
// for the q-badge components, which keeps the logic very clean.
const statusTheme = computed(() => {
  switch (props.status) {
    case 'Published':
      return { color: 'positive', textColor: 'text-dark', icon: 'sym_o_check_circle' };
    case 'Under Review':
      return { color: 'warning', textColor: 'text-dark', icon: 'sym_o_hourglass_empty' };
    case 'Draft':
    default:
      return { color: 'grey-8', textColor: 'text-white', icon: 'sym_o_edit' };
  }
});
</script>
