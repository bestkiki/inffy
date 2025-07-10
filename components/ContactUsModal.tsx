
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { Language, User, InquiryStatus } from '../types';
import { translations } from '../translations';
import { XIcon } from './icons/XIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser: User | null;
}

const ContactUsModal: React.FC<ContactUsModalProps> = ({ isOpen, onClose, language, currentUser }) => {
  const t = translations[language];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        subject: '',
        message: ''
      });
    }
  }, [isOpen, currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError("모든 필드를 입력해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      await db.collection('inquiries').add({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: InquiryStatus.NEW,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...(currentUser && { userId: currentUser.uid }),
      });
      setSuccess(true);
    } catch (err) {
      console.error("Error submitting inquiry:", err);
      setError(t.contactUsErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <QuestionMarkCircleIcon className="w-7 h-7 text-brand-primary" />
            {t.contactUsModalTitle}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        {success ? (
          <div className="flex flex-col items-center justify-center p-10 text-center flex-grow">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">{t.contactUsSuccessMessage}</h3>
             <button
              onClick={onClose}
              className="mt-6 py-2 px-8 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors"
            >
              {t.closeButton}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <div className="p-6 space-y-4 overflow-y-auto">
              {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">{error}</p>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">{t.nameLabel}</label>
                  <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">{t.emailLabel}</label>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg" />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">{t.contactUsSubjectLabel}</label>
                <select id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg">
                  <option value="" disabled>{t.contactUsSubjectPlaceholder}</option>
                  <option value="general">{t.contactUsSubjects.general}</option>
                  <option value="technical">{t.contactUsSubjects.technical}</option>
                  <option value="partnership">{t.contactUsSubjects.partnership}</option>
                  <option value="feedback">{t.contactUsSubjects.feedback}</option>
                  <option value="other">{t.contactUsSubjects.other}</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">{t.contactUsMessageLabel}</label>
                <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleInputChange} required placeholder={t.contactUsMessagePlaceholder} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg"></textarea>
              </div>
            </div>

            <footer className="p-4 border-t bg-slate-50 rounded-b-2xl mt-auto flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-6 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
              >
                {t.cancel}
              </button>
              <button type="submit" disabled={isLoading} className="w-40 flex justify-center py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:bg-slate-400">
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t.contactUsSubmitButton}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactUsModal;
