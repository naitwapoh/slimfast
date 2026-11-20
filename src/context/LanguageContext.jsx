import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Check stored preference or default to English
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('slimfast_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('slimfast_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  // Translation helper function
  const t = (path, params = {}) => {
    const keys = path.split('.');
    let current = translations[language] || translations['en'];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English if missing
        let fallback = translations['en'];
        for (const fKey of keys) {
          if (fallback && fallback[fKey] !== undefined) {
            fallback = fallback[fKey];
          } else {
            return path;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') {
      return current;
    }

    // Replace {placeholder} parameters
    let result = current;
    Object.keys(params).forEach(param => {
      result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
    });

    return result;
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'sw' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

