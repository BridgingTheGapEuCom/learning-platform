import { defineStore } from 'pinia';

export interface UserSettings {
  highContrast: boolean;
  language: string;
}

export interface UserState {
  globalRole?: string;
  firstName: string;
  lastName: string;
  email: string;
  settings: UserSettings;
  token: string | null;
  isLoggedIn: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    settings: {
      highContrast: false,
      language: window.navigator.language,
    },
    token: null,
    isLoggedIn: false,
  }),
});
