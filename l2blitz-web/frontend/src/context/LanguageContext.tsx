import React, { createContext, useContext, useState, useEffect } from 'react';

export type Locale = 'th' | 'en';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (th: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem('l2blitz_locale');
      return saved === 'en' ? 'en' : 'th';
    } catch {
      return 'th';
    }
  });

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    try {
      localStorage.setItem('l2blitz_locale', loc);
      document.documentElement.lang = loc;
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (th: string, en: string) => (locale === 'th' ? th : en);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
