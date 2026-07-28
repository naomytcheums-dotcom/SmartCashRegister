import React, { createContext, useContext, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // English by default, as requested — French is secondary,
  // toggleable via the language button on the home screen.
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    const dict = translations[language] || translations.en;
    return dict[key] ?? translations.en[key] ?? key;
  };

  const toggleLanguage = () => setLanguage((prev) => (prev === 'en' ? 'fr' : 'en'));

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
