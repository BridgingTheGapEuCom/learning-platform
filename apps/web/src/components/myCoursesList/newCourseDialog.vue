<template>
  <q-dialog v-model="dialogOpen" persistent backdropFilter="brightness(60%) grayscale(100%)">
    <div class="min-w-1/2 min-h-1/2 bg-dark border border-[var(--q-neutral)]">
      <q-card>
        <q-card-section class="text-2xl">Create New Course</q-card-section>
        <q-separator />
        <q-card-section class="q-pb-none">
          <q-form>
            <BTG_input labelBackground="var(--q-dark)" v-model="title" label="Course Title" />
            <BTG_input
              labelBackground="var(--q-dark)"
              v-model="description"
              type="textarea"
              label="Description"
            />
            <BTG_select
              labelBackground="var(--q-dark)"
              v-model="difficulty_level"
              label="Difficulty Level"
              :options="difficultyLevels"
            />
            <BTG_select
              labelBackground="var(--q-dark)"
              multiple
              use-input
              use-chips
              new-value-mode="add-unique"
              v-model="tags"
              label="Tags (optional)"
            />
            <BTG_select
              multiple
              use-input
              use-chips
              new-value-mode="add-unique"
              labelBackground="var(--q-dark)"
              v-model="accessibility_features"
              label="Accessibility Features (optional)"
            /> </q-form
        ></q-card-section>
        <q-separator />
        <q-card-actions class="flex justify-between q-pa-md">
          <BTG_btn
            label="Cancel"
            icon="sym_o_cancel"
            borderColor="--q-negative"
            @click="dialogOpen = false"
          />
          <BTG_btn label="Create Course" icon="sym_o_check" @click="createCourse" />
        </q-card-actions>
      </q-card>
    </div>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import BTG_btn from '../BTG_elements/BTG_btn.vue';
import BTG_input from '../BTG_elements/BTG_input.vue';
import BTG_select from '../BTG_elements/BTG_select.vue';
import { DifficultyLevel } from '@btg/shared-types';

const dialogOpen = defineModel<boolean>('opened', { default: false });
const title = ref('');
const description = ref('');
const difficulty_level = ref(DifficultyLevel.BEGINNER);
const difficultyLevels: Array<string> = [
  DifficultyLevel.BEGINNER,
  DifficultyLevel.INTERMEDIATE,
  DifficultyLevel.ADVANCED,
];
const tags = ref([]);
const accessibility_features = ref([]);

const createCourse = () => {};
</script>
