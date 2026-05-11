<template>
  <div class="w-full">
    <newCourseDialog v-model:opened="dialogOpen" />
    <div class="flex justify-end mb-6">
      <BTG_btn
        icon="sym_o_add"
        :label="t('app.myCourses.createNewCourse')"
        @click="dialogOpen = true"
      ></BTG_btn>
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
        v-for="course in courses"
        :key="course._id"
        :title="course.title"
        :status="course.status"
        :learners="111"
        :assignments="32"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BTG_btn from 'src/components/BTG_elements/BTG_btn.vue';
import BTG_select from 'src/components/BTG_elements/BTG_select.vue';
import BTG_CourseCard from 'src/components/BTG_elements/BTG_CourseCard.vue';
import { useI18n } from 'vue-i18n';
import { computed, onMounted, type Ref, ref } from 'vue';
import { type Course, CourseStatus } from '@btg/shared-types';
import newCourseDialog from 'src/components/myCoursesList/newCourseDialog.vue';
import { api } from 'src/boot/axios';

const { t } = useI18n();

interface Filter {
  value: string;
  label: string;
}

const filterOptions: Filter[] = [
  { value: CourseStatus.PUBLISHED, label: t('app.myCourses.status.published') },
  { value: CourseStatus.DRAFT, label: t('app.myCourses.status.draft') },
  { value: CourseStatus.UNDER_REVIEW, label: t('app.myCourses.status.underReview') },
  { value: CourseStatus.RETIRED, label: t('app.myCourses.status.retired') },
];

const filterModel = ref(
  filterOptions.filter((el: Filter) => {
    return el.value !== (CourseStatus.RETIRED as string);
  }),
);

const dialogOpen = ref(false);

const courses: Ref<Array<Course>> = ref([]);

/**
 * Computes a display label for the selected course status filters.
 *
 * @returns {string} The localized display string. Returns the "all" translation if all
 * options are selected; otherwise, returns selected labels separated by a pipe (" | ").
 *
 * Edge cases:
 * - Returns the "all" label when the selection count equals the total options count.
 * - Returns an empty string if no filters are selected (filterModel is empty).
 */
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

onMounted(async () => {
  try {
    const response = await api.get(`/course`);
    courses.value = response.data;
  } catch (error) {
    console.error(error);
  }

  const addCourseDetails = await api.post(`/course-details`, {
    course_id: '6a0030a7087f26b59c584c5c',
    version_number: 1,
    thumbnail_url: 'test',
    estimated_duration_minutes: 120,
    syllabus: [],
  });

  console.log(addCourseDetails);
});
</script>
