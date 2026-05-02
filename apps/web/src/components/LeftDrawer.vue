<template>
  <div class="p-4 h-full flex flex-col justify-between">
    <div class="max-w-full">
      <div>
        <div class="absolute right-2 top-2" v-if="$q.screen.lt.sm">
          <q-btn flat round icon="close" @click="closeDrawer" />
        </div>
        <div class="text-xl">
          <b>{{ t('app.platformName') }}</b>
        </div>
        <div>{{ t('app.learningPlatform') }}</div>
      </div>
      <BTG_select
        ref="globalFilterRef"
        use-input
        v-model="globalFilter"
        class="mt-6"
        :label="t('app.leftDrawer.GlobalSearch')"
        labelBackground="var(--q-dark)"
      >
        <template v-slot:append>
          <div class="shortcut-indicator" v-if="$q.platform.is.desktop" aria-hidden="true">
            <kbd>{{ isMac ? '⌘' : 'Ctrl' }}</kbd>
            <kbd>K</kbd>
          </div>
        </template>
      </BTG_select>
      <q-expansion-item
        icon="sym_o_school"
        :label="t('app.leftDrawer.MyLearning')"
        group="leftDrawerNavigation"
        :header-class="{ 'left-drawer-parent-active': isMyLearningActive }"
      >
        <q-list class="ml-4">
          <q-item to="/" active-class="text-primary">
            <q-item-section avatar>
              <q-icon name="sym_o_space_dashboard" />
            </q-item-section>
            <q-item-section>{{ t('app.leftDrawer.Dashboard') }}</q-item-section>
          </q-item>
          <q-item to="/my-learning/courses" active-class="text-primary">
            <q-item-section avatar>
              <q-icon name="sym_o_menu_book" />
            </q-item-section>
            <q-item-section>{{ t('app.leftDrawer.Courses') }}</q-item-section>
          </q-item>
          <q-item to="/my-learning/assignments" active-class="text-primary">
            <q-item-section avatar>
              <q-icon name="sym_o_assignment" />
            </q-item-section>
            <q-item-section>{{ t('app.leftDrawer.Assignments') }}</q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item
        icon="sym_o_explore"
        :label="t('app.leftDrawer.Discovery')"
        group="leftDrawerNavigation"
        :header-class="{ 'left-drawer-parent-active': isDiscoveryActive }"
      >
        <q-list class="ml-4">
          <q-item to="/discovery/learning-paths" active-class="text-primary">
            <q-item-section avatar>
              <q-icon name="sym_o_route" />
            </q-item-section>
            <q-item-section>{{ t('app.leftDrawer.LearningPaths') }}</q-item-section>
          </q-item>
          <q-item to="/discovery/events" active-class="text-primary">
            <q-item-section avatar>
              <q-icon name="sym_o_event" />
            </q-item-section>
            <q-item-section>{{ t('app.leftDrawer.Events') }}</q-item-section>
          </q-item>
          <q-item to="/discovery/community" active-class="text-primary">
            <q-item-section avatar>
              <q-icon name="sym_o_forum" />
            </q-item-section>
            <q-item-section>{{ t('app.leftDrawer.Community') }}</q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item
        icon="mdi-human-male-board"
        :label="t('app.leftDrawer.MyCourses')"
        group="leftDrawerNavigation"
        :header-class="{ 'left-drawer-parent-active': isMyCoursesActive }"
      >
        <q-list class="ml-4">
          <q-item to="/my-courses/courses-list" active-class="text-primary">
            <q-item-section avatar>
              <q-icon name="mdi-bulletin-board" />
            </q-item-section>
            <q-item-section>{{ t('app.leftDrawer.CoursesList') }}</q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item
        icon="sym_o_account_circle"
        :label="t('app.leftDrawer.Me')"
        group="leftDrawerNavigation"
        :header-class="{ 'left-drawer-parent-active': isMeActive }"
      >
        <q-list class="ml-4">
          <q-item to="/me/profile" active-class="text-primary">
            <q-item-section avatar>
              <q-icon name="sym_o_person" />
            </q-item-section>
            <q-item-section>{{ t('app.leftDrawer.Profile') }}</q-item-section>
          </q-item>
          <q-item to="/me/certificates" active-class="text-primary">
            <q-item-section avatar>
              <q-icon name="sym_o_workspace_premium" />
            </q-item-section>
            <q-item-section>{{ t('app.leftDrawer.Certificates') }}</q-item-section>
          </q-item>
          <q-item to="/me/settings" active-class="text-primary">
            <q-item-section avatar>
              <q-icon name="sym_o_settings" />
            </q-item-section>
            <q-item-section>{{ t('app.leftDrawer.Settings') }}</q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
    </div>
    <q-list>
      <q-expansion-item
        v-if="userStore.globalRole === 'admin'"
        icon="sym_o_admin_panel_settings"
        :label="t('app.leftDrawer.Admin')"
        group="leftDrawerNavigation"
        :header-class="{ 'left-drawer-parent-active': isMeActive }"
      >
        <q-list class="ml-4">
          <q-item to="/admin/userManagement" active-class="text-primary">
            <q-item-section avatar>
              <q-icon name="sym_o_manage_accounts" />
            </q-item-section>
            <q-item-section>{{ t('app.leftDrawer.AdminUserManagement') }}</q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-item to="/logout">
        <q-item-section avatar>
          <q-icon name="sym_o_logout" />
        </q-item-section>
        <q-item-section>{{ t('app.leftDrawer.Logout') }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, useTemplateRef, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BTG_select from './BTG_elements/BTG_select.vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user';

const $q = useQuasar();
const route = useRoute();

const userStore = useUserStore();

const emit = defineEmits(['closeDrawer']);

const globalFilter = ref('');
const globalFilterRef = useTemplateRef('globalFilterRef');
const isMac = ref(false);

const isMyLearningActive = computed(
  () => route.path === '/' || route.path.startsWith('/my-learning'),
);
const isDiscoveryActive = computed(() => route.path.startsWith('/discovery'));
const isMeActive = computed(() => route.path.startsWith('/me'));
const isMyCoursesActive = computed(() => route.path.startsWith('/my-courses'));

const { t } = useI18n();

const handleGlobalSearchShortcut = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();

    if (globalFilterRef.value) {
      globalFilterRef.value.focus();
    }
  }
};

const closeDrawer = () => {
  console.log('closeDrawer');
  emit('closeDrawer');
};

onMounted(() => {
  isMac.value = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
  window.addEventListener('keydown', handleGlobalSearchShortcut);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalSearchShortcut);
});
</script>

<style>
.left-drawer-parent-active {
  color: var(--q-primary);
}
.left-drawer-parent-active .q-expansion-item__icon {
  color: white !important;
}
</style>
