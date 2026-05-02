import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import locales from 'src/i18n';
import { Cookies } from 'quasar';
import { decodeJwt } from 'jose';

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
  reducedMotion?: string;
  dyslexiaFriendlyStyle?: boolean;
  focusMode?: boolean;
  hideTimers?: boolean;
  fontSize?: string;
}

export interface UserState {
  globalRole?: string;
  firstName: string;
  lastName: string;
  displayName?: string | undefined;
  email: string;
  settings: UserSettings;
  token: string | null;
  isLoggedIn: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    firstName: '',
    lastName: '',
    globalRole: '',
    email: '',
    displayName: '',
    settings: {
      highContrast: false,
      language: getDefaultLanguage(),
      reducedMotion: 'no-preference',
      dyslexiaFriendlyStyle: false,
      focusMode: false,
      hideTimers: false,
      fontSize: '15px',
    },
    token: null,
    isLoggedIn: false,
  }),
  persist: {
    debug: true,
    key: 'userStore',
    omit: ['token'],
    deep: true,
    storage: {
      getItem: (key: string) => {
        return JSON.stringify(Cookies.get(key)) || null;
      },
      setItem: (key: string, value: string) =>
        Cookies.set(key, value, { expires: 365, path: '/', secure: true, sameSite: 'Strict' }),
      removeItem: (key: string) => Cookies.remove(key, { path: '/' }),
    },
  },
  actions: {
    setAuth(token: string, user?: Partial<UserState>) {
      this.token = token;
      this.isLoggedIn = true;

      let userData = user;
      if (!userData) {
        try {
          userData = decodeJwt(token) as Partial<UserState>;
        } catch (error) {
          console.error('Error decoding JWT token:', error);
        }
      }

      if (userData) {
        if (userData.firstName) this.firstName = userData.firstName;
        if (userData.lastName) this.lastName = userData.lastName;
        if (userData.email) this.email = userData.email;
        if (userData.displayName) this.displayName = userData.displayName;
        if (userData.globalRole !== undefined) this.globalRole = userData.globalRole;
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
      this.globalRole = '';

      // Remove header on logout
      delete api.defaults.headers.common['Authorization'];
    },
  },
});
