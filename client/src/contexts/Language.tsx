import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

import templateData from '@/data/template.json';

const translations: Record<string, Record<string, string>> = {};
const supportedLanguages = (templateData as any).site?.languages || ['en', 'ar'];

supportedLanguages.forEach((lang: string) => {
  translations[lang] = {};
});

if ((templateData as any).translations) {
  Object.entries((templateData as any).translations).forEach(([key, value]: [string, any]) => {
    supportedLanguages.forEach((lang: string) => {
      translations[lang][key] = value[lang] || value['en'] || key; // Fallback to EN or key
    });
  });
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language | null;
      if (saved && supportedLanguages.includes(saved)) return saved;
    }
    // Default fallback
    if (supportedLanguages.includes('ar')) return 'ar';
    return supportedLanguages[0] || 'en';
  });

  useEffect(() => {
    const html = document.documentElement;
    html.lang = language;
    const rtlLangs = ['ar', 'he', 'fa', 'ur'];
    html.dir = rtlLangs.includes(language) ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const langMap = translations[language] || translations['en'] || Object.values(translations)[0];
    return langMap?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
