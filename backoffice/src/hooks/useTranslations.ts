import { useLanguage } from '@/context/LanguageContext';
import { useMemo } from 'react';

// Importar las traducciones directamente
import esTranslations from '@/locales/es.json';
import enTranslations from '@/locales/en.json';

export const useTranslations = () => {
  const { language } = useLanguage();
  
  const translations = useMemo(() => {
    return language === 'es' ? esTranslations : enTranslations;
  }, [language]);

  const t = (key: string): string => {
    try {
      const keys = key.split('.');
      let translation: any = translations;
      
      for (const k of keys) {
        translation = translation[k];
        if (!translation) break;
      }
      
      return translation || key;
    } catch (error) {
      return key;
    }
  };

  return { t, language };
};
