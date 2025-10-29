import React from 'react';
import { Helmet } from 'react-helmet-async';
import templateData from '@/data/template.json';
import { useLanguage } from '@/contexts/LanguageContext';

const Head: React.FC = () => {
  const { language } = useLanguage();

  const siteTitle = templateData.site.title[language];
  const siteSubtitle = templateData.site.subtitle[language];
  const siteDescription = templateData.site.description[language];

  return (
    <Helmet>
      <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} />
      <title>{`${siteTitle} - ${siteSubtitle}`}</title>
      <meta name="description" content={siteDescription} />
      <meta property="og:title" content={`${siteTitle} - ${siteSubtitle}`} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:type" content="website" />
      {/* Add other meta tags as needed, e.g., og:image, twitter:card, etc. */}
    </Helmet>
  );
};

export default Head;