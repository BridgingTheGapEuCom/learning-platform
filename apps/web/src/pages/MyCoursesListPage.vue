<template>
  <div class="w-full">
    <div class="flex items-center justify-between">
      <div class="h1">{{ $t('app.myCourses.myCreatedCourses') }}</div>
      <div>
        <BTG_btn :label="t('app.myCourses.createNewCourse')"></BTG_btn>
      </div>
    </div>
    <div>
      <BTG_select
        v-model="filterModel"
        multiple
        class="w-full"
        :options="filterOptions"
        :label="t('app.myCourses.status.label')"
      >
        <template v-slot:selected>
          Status:
          <template v-if="filterModel.length === filterOptions.length">{{
            t('app.myCourses.status.all')
          }}</template>
          <template v-else>
            {{ filteredModulesLabel }}
          </template>
        </template>
        <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
          <q-item v-bind="itemProps">
            <q-item-section side>
              <q-checkbox :model-value="selected" @update:model-value="toggleOption(opt)" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ opt.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </BTG_select>
    </div>
    <div class="grid grid-flow-row-dense grid-cols-2 gap-6">
      <BTG_CourseCard
        :course="{
          title: 'Python 101: A very long and boring title with a lot of text and staff',
          status: 'Published',
          learners: 110,
          assignments: 32,
          thumbnail: 'https://picsum.photos/800/800?t=1111',
        }"
        title="Python 101: A very long and boring title with a lot of text and staff. Too long to be seen on a small screen"
        status="Published"
      ></BTG_CourseCard>
      <BTG_CourseCard
        :course="{
          title: 'Python 101',
          status: 'Published',
          learners: 110,
          assignments: 32,
          thumbnail: 'https://picsum.photos/800/800?t=1111',
        }"
        title="Python 101"
        status="Published"
      ></BTG_CourseCard>
      <BTG_CourseCard
        :course="{
          title: 'Python 101',
          status: 'Published',
          learners: 110,
          assignments: 32,
          thumbnail: 'https://picsum.photos/800/800?t=1111',
        }"
        title="Python 101"
        status="Published"
      ></BTG_CourseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import BTG_btn from 'src/components/BTG_elements/BTG_btn.vue';
import BTG_select from 'src/components/BTG_elements/BTG_select.vue';
import BTG_CourseCard from 'src/components/BTG_elements/BTG_CourseCard.vue';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { CourseStatus } from '@btg/shared-types';

const { t } = useI18n();

interface Filter {
  value: string;
  label: string;
}

const filterOptions: Filter[] = [
  { value: CourseStatus.PUBLISHED, label: t('app.myCourses.status.published') },
  { value: CourseStatus.DRAFT, label: t('app.myCourses.status.draft') },
  { value: CourseStatus.UNDER_REVIEW, label: t('app.myCourses.status.underReview') },
];
const filterModel = ref([...filterOptions]);

const filteredModulesLabel = computed(() => {
  if (filterModel.value.length === filterOptions.length) {
    return t('app.myCourses.status.all');
  } else {
    const tempArray = [];
    for (const stat of filterModel.value) {
      tempArray.push(stat.label);
    }
    return tempArray.join(' | ');
  }
});
</script>
