import React from 'react';
import { Inquiry, Language } from '../types';
import { translations } from '../translations';
import { XIcon } from './icons/XIcon';

interface InquiryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  inquiry: Inquiry;
}

const DetailItem: React.FC<{ label: string; value: string | undefined; className?: string }> = ({ label, value, className = '' }) => (
  <div>
    <p className="text-sm text-slate-500 font-medium">{label}</p>
    <p className={`mt-1 text-slate-800 ${className}`}>{value || '-'}</p>
  </div>
);

const InquiryDetailsModal: React.FC<InquiryDetailsModalProps> = ({ isOpen, onClose, language, inquiry }) => {
  const t = translations[language];

  if (!isOpen) return null;

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return 'N/A';
    return timestamp.toDate().toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US');
  };

  const subjectText = t.contactUsSubjects[inquiry.subject] || inquiry.subject;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800">{t.inquiryDetails}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailItem label={t.from} value={inquiry.name} />
            <DetailItem label={t.emailLabel} value={inquiry.email} />
            <DetailItem label={t.inquiryDate} value={formatDate(inquiry.createdAt)} />
          </div>
          <DetailItem label={t.subject} value={subjectText} />
          <DetailItem label={t.contactUsMessageLabel} value={inquiry.message} className="whitespace-pre-wrap bg-slate-50 p-4 rounded-lg" />
        </div>

        <footer className="p-4 border-t bg-slate-50 text-right mt-auto">
          <button
            onClick={onClose}
            className="py-2 px-6 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
          >
            {t.closeButton}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default InquiryDetailsModal;