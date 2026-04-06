"use client";

import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useLocaleStore } from '@/stores/locale-store';
import enMessages from '@/locales/en/common.json';
import frMessages from '@/locales/fr/common.json';
import jaMessages from '@/locales/ja/common.json';
import koMessages from '@/locales/ko/common.json';
import esMessages from '@/locales/es/common.json';
import itMessages from '@/locales/it/common.json';
import deMessages from '@/locales/de/common.json';
import nlMessages from '@/locales/nl/common.json';
import plMessages from '@/locales/pl/common.json';
import ptMessages from '@/locales/pt/common.json';
import ruMessages from '@/locales/ru/common.json';
import zhMessages from '@/locales/zh/common.json';

// Pre-loaded translations (loaded at build time, not runtime)
const ALL_MESSAGES = {
  en: enMessages,
  fr: frMessages,
  ja: jaMessages,
  ko: koMessages,
  es: esMessages,
  it: itMessages,
  de: deMessages,
  nl: nlMessages,
  pl: plMessages,
  pt: ptMessages,
  ru: ruMessages,
  zh: zhMessages,
};

type SupportedLocale = keyof typeof ALL_MESSAGES;

const AUTO_SWITCH_LOCALE_ON_FIRST_VISIT =
  process.env.NEXT_PUBLIC_AUTO_SWITCH_LOCALE_ON_FIRST_VISIT === 'true';

function normalizeLocale(locale: string | undefined | null): SupportedLocale | null {
  if (!locale) return null;

  const normalized = locale.trim().toLowerCase().replace(/_/g, '-');
  if (normalized in ALL_MESSAGES) {
    return normalized as SupportedLocale;
  }

  const primary = normalized.split('-')[0];
  if (primary in ALL_MESSAGES) {
    return primary as SupportedLocale;
  }

  return null;
}

function detectBrowserLocale(): SupportedLocale {
  if (typeof navigator === 'undefined') return 'en';

  const preferred = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean);

  for (const locale of preferred) {
    const match = normalizeLocale(locale);
    if (match) return match;
  }

  return 'en';
}

interface IntlProviderProps {
  locale: string;
  messages: Record<string, unknown>;
  children: React.ReactNode;
}

export function IntlProvider({ locale: initialLocale, children }: IntlProviderProps) {
  const currentLocale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const [activeLocale, setActiveLocale] = useState(currentLocale || initialLocale);
  const [timeZone, setTimeZone] = useState<string>('UTC');

  // Detect user's timezone on mount
  useEffect(() => {
    try {
      const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimeZone(detectedTimeZone);
    } catch (error) {
      // Fallback to UTC if detection fails
      console.warn('Failed to detect timezone, using UTC:', error);
      setTimeZone('UTC');
    }
  }, []);

  // Sync initial locale with store on first mount only
  useEffect(() => {
    try {
      const persisted = localStorage.getItem('locale-storage');

      if (!persisted && AUTO_SWITCH_LOCALE_ON_FIRST_VISIT) {
        const detected = detectBrowserLocale();
        setLocale(detected);
        setActiveLocale(detected);
        return;
      }
    } catch {
      // Ignore storage errors and fall back to server locale
    }

    if (!currentLocale) {
      const fallback = normalizeLocale(initialLocale) ?? 'en';
      setLocale(fallback);
      setActiveLocale(fallback);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch locale immediately when store changes
  useEffect(() => {
    if (currentLocale) {
      setActiveLocale(currentLocale);
    }
  }, [currentLocale]);

  return (
    <NextIntlClientProvider
      locale={activeLocale}
      messages={ALL_MESSAGES[activeLocale as keyof typeof ALL_MESSAGES]}
      timeZone={timeZone}
    >
      {children}
    </NextIntlClientProvider>
  );
}