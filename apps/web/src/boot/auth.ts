// apps/web/src/boot/auth.ts
import { boot } from 'quasar/wrappers';
import { useUserStore } from 'src/stores/user';
import { api } from 'src/boot/axios';

export default boot(async ({ store }) => {
  const userStore = useUserStore(store);

  try {
    const refreshResponse = await api.post('/auth/refresh');
    const { access_token } = refreshResponse.data;

    userStore.setAuth(access_token /*, user */);
  } catch (error) {
    userStore.clearAuth();
  }
});
