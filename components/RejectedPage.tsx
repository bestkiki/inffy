import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { XCircleIcon } from './icons/XCircleIcon';

interface RejectedPageProps {
  language: Language;
  onLogout: () => void;
}

const RejectedPage: React.FC<RejectedPageProps> = ({ language, onLogout }) => {
  const t = translations[language];
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4 text-center">
      <XCircleIcon className="w-16 h-16 text-red-500 mb-6" />
      <h1 className="text-3xl font-bold text-red-600 mb-4">{t.rejectedTitle}</h1>
      <p className="text-slate-700 mb-8 max-w-lg">{t.rejectedMessage}</p>
      <button onClick={onLogout} className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-6 rounded-lg transition-colors">
        {t.logout}
      </button>
    </div>
  );
};

export default RejectedPage;
