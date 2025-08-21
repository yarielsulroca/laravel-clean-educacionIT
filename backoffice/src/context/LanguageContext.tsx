"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  // Función de traducción que busca en los archivos JSON
  const t = (key: string): string => {
    try {
      const keys = key.split('.');
      let translation: any = language === 'es' ? 
        require('../locales/es.json') : 
        require('../locales/en.json');
      
      for (const k of keys) {
        translation = translation[k];
        if (!translation) break;
      }
      
      return translation || key;
    } catch (error) {
      return key;
    }
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: handleSetLanguage, 
      t 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
