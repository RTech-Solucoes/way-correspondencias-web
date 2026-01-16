// Storage customizado para cookies (compatível com zustand persist)
import { getCookie, setCookie, removeCookie } from './cookies';

export const cookieStorage = {
  getItem: (name: string): string | null => {
    return getCookie(name);
  },
  setItem: (name: string, value: string): void => {
    setCookie(name, value);
  },
  removeItem: (name: string): void => {
    removeCookie(name);
  },
};
