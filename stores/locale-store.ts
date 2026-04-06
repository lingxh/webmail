import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocaleStore {
  locale: string;
  setLocale: (locale: string) => void;
}

function normalizeLocale(locale: string): string {
  const normalized = locale.toLowerCase().replace('_', '-');
  const primary = normalized.split('-')[0];
  const supported = ['en', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'nl', 'pt', 'ru', 'zh'];

  if (supported.includes(normalized)) return normalized;
  if (supported.includes(primary)) return primary;

  return 'en';
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale: normalizeLocale(locale) }),
    }),
    {
      name: 'locale-storage',
    }
  )
);
