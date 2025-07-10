import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { XIcon } from './icons/XIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  language: Language;
  isLoading: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onConfirm, language, isLoading }) => {
  const t = translations[language];
  const [confirmationText, setConfirmationText] = useState('');

  if (!isOpen) return null;
  
  const confirmPhrase = language === 'ko' ? t.deleteAccountConfirmText_ko : t.deleteAccountConfirmText_en;
  const isConfirmed = confirmationText === confirmPhrase;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-red-200 bg-red-50 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-red-800 flex items-center gap-3">
            <ExclamationTriangleIcon className="w-7 h-7 text-red-600"/>
            {t.deleteAccountModalTitle}
          </h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-600">{t.deleteAccountModalWarning}</p>
          <p className="font-medium text-slate-700">
            {language === 'ko' ? t.deleteAccountConfirmPrompt_ko : t.deleteAccountConfirmPrompt_en}
          </p>
          <div>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={confirmPhrase}
            />
          </div>
        </div>

        <div className="p-6 border-t bg-slate-50 rounded-b-2xl mt-auto">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-6 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!isConfirmed || isLoading}
              className="w-40 flex justify-center py-2 px-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                t.confirmDeletionButton
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
