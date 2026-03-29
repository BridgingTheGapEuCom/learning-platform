import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import locales from 'src/i18n';

const getDefaultLanguage = () => {
  const navLang = typeof window !== 'undefined' ? window.navigator.language : 'en-US';
  const availableLanguages = Object.keys(locales);

  if (availableLanguages.includes(navLang)) {
    return navLang;
  }

  const shortLang = navLang.split('-')[0];
  if (availableLanguages.includes(shortLang ? shortLang : 'en-US')) {
    return shortLang ? shortLang : 'en-US';
  }

  return 'en-US';
};

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
    firstName: '',
    lastName: '',
    email: '',
    settings: {
      highContrast: false,
      language: getDefaultLanguage(),
    },
    token: null,
    isLoggedIn: false,
  }),
  actions: {
    setAuth(token: string, user?: Partial<UserState>) {
      this.token = token;
      this.isLoggedIn = true;

      if (user) {
        if (user.firstName) this.firstName = user.firstName;
        if (user.lastName) this.lastName = user.lastName;
        if (user.email) this.email = user.email;
        if (user.globalRole) this.globalRole = user.globalRole;
      }

      // Set default header for all future authenticated requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },
    clearAuth() {
      this.token = null;
      this.isLoggedIn = false;
      this.firstName = '';
      this.lastName = '';
      this.email = '';
      delete this.globalRole;

      // Remove header on logout
      delete api.defaults.headers.common['Authorization'];
    },
  },
});
