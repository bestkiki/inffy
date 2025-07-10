import React from 'react';
import { User, Language } from '../types';
import { translations } from '../translations';
import { PowerIcon } from './icons/PowerIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface DormantAccountPageProps {
  user: User;
  language: Language;
  onReactivate: () => void;
  onLogout: () => void;
}

const DormantAccountPage: React.FC<DormantAccountPageProps> = ({ user, language, onReactivate, onLogout }) => {
  const t = translations[language];
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
      <PowerIcon className="w-16 h-16 text-brand-primary mb-6" />
      <h1 className="text-3xl font-bold text-slate-800 mb-4">{t.dormantAccountTitle}</h1>
      <p className="text-slate-700 mb-8 max-w-lg">{t.dormantAccountMessage}</p>
      <div className="flex space-x-4">
        <button onClick={onLogout} className="flex items-center gap-2 bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            <LogoutIcon className="w-5 h-5"/>
            <span>{t.logout}</span>
        </button>
        <button onClick={onReactivate} className="flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-lg transition-colors">
            <PowerIcon className="w-5 h-5"/>
            <span>{t.reactivateAccountButton}</span>
        </button>
      </div>
    </div>
  );
};
  
export default DormantAccountPage;