import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    // Site info
    siteTitle: 'مدونتي التقنية',
    siteSubtitle: 'أفكار حول البرمجة والتطوير',
    
    // Navigation
    home: 'الرئيسية',
    about: 'عني',
    archive: 'الأرشيف',
    
    // Blog
    readMore: 'اقرأ المزيد',
    newer: 'الأحدث',
    older: 'الأقدم',
    filterByTitle: 'التصفية حسب العنوان',
    sortByDate: 'الفرز حسب التاريخ',
    newestFirst: 'الأحدث أولاً',
    oldestFirst: 'الأقدم أولاً',
    
    // About
    aboutTitle: 'عني',
    aboutText: 'مطور ويب ومدون تقني. أكتب عن البرمجة، التطوير، وكل ما يتعلق بالتقنية.',
    
    // Footer
    builtWith: 'مبني باستخدام: ',
    builtBy: 'تم البناء بواسطة: ',
  },
  en: {
    // Site info
    siteTitle: 'My Dev Blog',
    siteSubtitle: 'Thoughts on programming and development',
    
    // Navigation
    home: 'Home',
    about: 'About',
    archive: 'Archive',
    
    // Blog
    readMore: 'Read more',
    newer: 'Newer',
    older: 'Older',
    filterByTitle: 'Filter by title',
    sortByDate: 'Sort by date',
    newestFirst: 'Newest first',
    oldestFirst: 'Oldest first',
    
    // About
    aboutTitle: 'About',
    aboutText: 'Web developer and tech blogger. I write about programming, development, and all things tech.',
    
    // Footer
    builtWith: 'Built with: ',
    builtBy: 'Built by: ',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language | null;
      if (saved) return saved;
    }
    return 'ar';
  });

  useEffect(() => {
    const html = document.documentElement;
    html.lang = language;
    html.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
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
