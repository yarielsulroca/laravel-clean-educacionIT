"use client";
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('es')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'es'
            ? 'bg-brand-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-brand-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSelector;
