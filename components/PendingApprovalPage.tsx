import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { ClockIcon } from './icons/ClockIcon';

interface PendingApprovalPageProps {
  language: Language;
  onLogout: () => void;
}

const PendingApprovalPage: React.FC<PendingApprovalPageProps> = ({ language, onLogout }) => {
  const t = translations[language];
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
      <ClockIcon className="w-16 h-16 text-brand-primary mb-6" />
      <h1 className="text-3xl font-bold text-slate-800 mb-4">{t.pendingApprovalTitle}</h1>
      <p className="text-slate-700 mb-8 max-w-lg">{t.pendingApprovalMessage}</p>
      <button onClick={onLogout} className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-6 rounded-lg transition-colors">
        {t.logout}
      </button>
    </div>
  );
};
  
export default PendingApprovalPage;