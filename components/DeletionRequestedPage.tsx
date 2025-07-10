import React from 'react';
import { User, Language } from '../types';
import { translations } from '../translations';
import { ArchiveBoxXMarkIcon } from './icons/ArchiveBoxXMarkIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';

interface DeletionRequestedPageProps {
  user: User;
  language: Language;
  onCancelDeletion: () => void;
  onLogout: () => void;
}

const DeletionRequestedPage: React.FC<DeletionRequestedPageProps> = ({ user, language, onCancelDeletion, onLogout }) => {
  const t = translations[language];

  let deletionDateStr = '...';
  if (user.deletionRequestDate?.toDate) {
    const deletionScheduledDate = new Date(user.deletionRequestDate.toDate());
    deletionScheduledDate.setDate(deletionScheduledDate.getDate() + 30);
    deletionDateStr = deletionScheduledDate.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4 text-center">
      <ArchiveBoxXMarkIcon className="w-16 h-16 text-red-500 mb-6" />
      <h1 className="text-3xl font-bold text-slate-800 mb-4">{t.deletionRequestedTitle}</h1>
      <p className="text-slate-700 mb-8 max-w-lg">
        {t.deletionRequestedMessage(deletionDateStr)}
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <button 
          onClick={onLogout} 
          className="flex items-center justify-center gap-2 bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          <LogoutIcon className="w-5 h-5"/>
          <span>{t.logout}</span>
        </button>
        <button 
          onClick={onCancelDeletion} 
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          <ArrowUturnLeftIcon className="w-5 h-5"/>
          <span>{t.cancelDeletionButton}</span>
        </button>
      </div>
    </div>
  );
};

export default DeletionRequestedPage;
