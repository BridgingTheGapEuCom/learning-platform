import { defineBoot } from '#q-app/wrappers';
import axios, { AxiosResponse, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: 'http://localhost:3000', withCredentials: true });

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: Error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refresh_token');
    const accessToken = localStorage.getItem('access_token');

    // If the error is 401 and we haven't retried yet, attempt to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry && refreshToken && accessToken) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          'http://localhost:3000/auth/refresh',
          {},
          { withCredentials: true },
        );

        if (response.data?.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle accordingly
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError as Error);
      }
    }

    return Promise.reject(error as Error);
  },
);

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
