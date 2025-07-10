

import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { Language, User, UpgradeRequestStatus, UserType } from '../types';
import { translations } from '../translations';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser: User;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, language, currentUser }) => {
  const t = translations[language];
  const [settings, setSettings] = useState<{ price: number | ''; accountInfo: string }>({ price: '', accountInfo: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'info' | 'form' | 'success'>('info');
  const [depositorName, setDepositorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setView('info');
      setDepositorName('');
      setError(null);
      setIsSubmitting(false);

      setIsLoading(true);
      const fetchSettings = async () => {
        try {
          const docId = currentUser.type === UserType.COMPANY ? 'companyPlan' : 'influencerPlan';
          const docRef = db.collection('settings').doc(docId);
          const doc = await docRef.get();
          if (doc.exists) {
            const data = doc.data();
            setSettings({
              price: data?.price ?? '',
              accountInfo: data?.accountInfo ?? ''
            });
          }
        } catch (error) {
          console.error("Error fetching plan settings:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSettings();
    }
  }, [isOpen, currentUser.type]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositorName.trim()) {
        setError(t.depositorNameRequired);
        return;
    }
    setError(null);
    setIsSubmitting(true);
    
    try {
        await db.collection('upgradeRequests').add({
            userId: currentUser.uid,
            companyName: currentUser.companyName || currentUser.name,
            depositorName: depositorName,
            status: UpgradeRequestStatus.PENDING,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        setView('success');
    } catch (err) {
        console.error("Error submitting upgrade request:", err);
        setError(t.upgradeRequestError);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;

  const isInfluencer = currentUser.type === UserType.INFLUENCER;
  const benefits = isInfluencer
    ? [t.proBenefit_influencer_1, t.proBenefit_influencer_2, t.proBenefit_influencer_3]
    : [t.proBenefit_1, t.proBenefit_2, t.proBenefit_3];
  
  const renderInfoView = () => (
    <>
      <div className="p-6 space-y-6 overflow-y-auto">
        {isLoading ? (
            <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        ) : (
            <>
            <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-3">{t.proPlanBenefitsTitle}</h3>
                <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-slate-600">{benefit}</span>
                    </li>
                ))}
                </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                    <label className="block text-sm font-medium text-slate-500">{t.proPlanPrice}</label>
                    <p className="text-2xl font-bold text-slate-800">{settings.price ? `₩${Number(settings.price).toLocaleString()}` : t.infoNotAvailable} / 월</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-500">{t.proPlanAccountInfo}</label>
                    <p className="text-slate-800 whitespace-pre-wrap">{settings.accountInfo || t.infoNotAvailable}</p>
                </div>
            </div>
            </>
        )}
      </div>
      <footer className="p-4 border-t bg-slate-50 flex justify-between items-center mt-auto">
        <button onClick={onClose} className="py-2 px-6 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
            {t.closeButton}
        </button>
        <button onClick={() => setView('form')} className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors">
            {t.requestUpgrade}
        </button>
      </footer>
    </>
  );

  const renderFormView = () => (
    <>
      <form onSubmit={handleSubmitRequest} className="p-6 space-y-4 overflow-y-auto">
        {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">{error}</p>}
        <div>
            <label htmlFor="depositorName" className="block text-sm font-medium text-slate-700 mb-1">{t.depositorNameLabel}</label>
            <input
                id="depositorName"
                type="text"
                value={depositorName}
                onChange={(e) => setDepositorName(e.target.value)}
                placeholder={t.depositorNamePlaceholder}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
        </div>
      </form>
      <footer className="p-4 border-t bg-slate-50 flex justify-between items-center mt-auto">
        <button type="button" onClick={() => setView('info')} className="flex items-center gap-2 py-2 px-6 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>{t.backButton}</span>
        </button>
        <button type="submit" onClick={handleSubmitRequest} disabled={isSubmitting} className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:bg-slate-400">
             {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t.submitRequest}
        </button>
      </footer>
    </>
  );

  const renderSuccessView = () => (
    <>
        <div className="p-10 flex flex-col items-center justify-center text-center flex-grow">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">{t.upgradeRequestSuccess}</h3>
        </div>
        <footer className="p-4 border-t bg-slate-50 text-right mt-auto">
            <button onClick={onClose} className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors">
                {t.closeButton}
            </button>
        </footer>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-6 border-b bg-brand-light">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-brand-primary" />
            <h2 className="text-2xl font-bold text-brand-dark">{t.upgradeModalTitle}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        {view === 'info' && renderInfoView()}
        {view === 'form' && renderFormView()}
        {view === 'success' && renderSuccessView()}
      </div>
    </div>
  );
};

export default UpgradeModal;