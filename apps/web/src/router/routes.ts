import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', name: 'Login', component: () => import('pages/LoginPage.vue') },
      {
        path: '/refreshToken',
        component: () => import('pages/RefreshTokenPage.vue'),
      },
      {
        path: '/changePassword',
        component: () => import('pages/ChangePasswordPage.vue'),
      },
    ],
    meta: { requiresAuth: false },
  },
  {
    path: '/logout',
    component: () => import('pages/LogoutPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'Home', component: () => import('pages/IndexPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/userManagement',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'User Management',
        component: () => import('pages/UserManagementPage.vue'),
      },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/me',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'profile', name: 'Profile', component: () => import('pages/ProfilePage.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/my-courses',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'courses-list',
        name: 'MyCoursesList',
        component: () => import('pages/MyCoursesListPage.vue'),
      },
    ],
    meta: { requiresAuth: true },
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
