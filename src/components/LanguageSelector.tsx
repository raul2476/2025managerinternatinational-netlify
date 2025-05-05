import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
      className="px-2 py-1 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
};

export default LanguageSelector;