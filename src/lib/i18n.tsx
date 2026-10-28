import React, { createContext, useContext, useState, useEffect } from 'react';

export type Locale = 'th' | 'en';

interface I18nContextValue {
  lang: Locale;
  setLang: (lang: Locale) => void;
  t: (th: string, en: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'th',
  setLang: () => {},
  t: (th) => th,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem('l2blitz_lang');
      return saved === 'en' ? 'en' : 'th';
    } catch {
      return 'th';
    }
  });

  const setLang = (next: Locale) => {
    setLangState(next);
    try {
      localStorage.setItem('l2blitz_lang', next);
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (th: string, en: string) => (lang === 'th' ? th : en);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  return useContext(I18nContext);
}
