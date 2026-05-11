<template>
  <q-card class="bg-dark rounded group border" flat>
    <q-card-section horizontal class="q-pa-md flex items-center">
      <div class="w-38 h-38">
        <q-img
          :src="thumbnail ? thumbnail : `/invalidImage`"
          class="rounded-borders"
          :ratio="1"
          :alt="`Thumbnail for ${title}`"
        >
          <template v-slot:error>
            <div class="absolute-full flex items-center justify-center">
              <q-icon class="rounded-borders text-dark" name="sym_o_broken_image" size="6rem" />
              <div class="absolute text-bold text-2xl text-white">No Image</div>
            </div>
          </template>
        </q-img>
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
            <div>
              <b>{{ new Intl.NumberFormat(undefined, { style: 'decimal' }).format(learners) }}</b>
              Active Learners
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card-section>

    <q-card-actions class="q-px-md q-pt-none q-pb-md row items-center no-wrap">
      <!-- <q-btn outline color="cyan" label="Edit Course" class="rounded-md" /> -->
      <BTG_btn label="Edit Course" icon="sym_o_edit" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BTG_btn from 'src/components/BTG_elements/BTG_btn.vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  learners: {
    type: Number,
    required: true,
  },
  assignments: {
    type: Number,
    required: true,
  },
  thumbnail: {
    type: String,
    required: false,
  },
});

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
