

import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { Language, User, Product, CollaborationRequestStatus, NotificationType } from '../types';
import { translations } from '../translations';
import { XIcon } from './icons/XIcon';
import { createNotification } from '../lib/notifications';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';


interface CollaborationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  influencer: User;
  product: Product;
  onSuccess: () => void;
  onUserUpdate: (updatedData: Partial<User>) => void;
}

const CollaborationRequestModal: React.FC<CollaborationRequestModalProps> = ({
  isOpen,
  onClose,
  language,
  influencer,
  product,
  onSuccess,
  onUserUpdate,
}) => {
  const t = translations[language];
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasContactInfo = !!(influencer.phone || influencer.kakaoId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!message.trim()) {
      setError("메시지를 입력해주세요.");
      setIsLoading(false);
      return;
    }

    const requestData = {
      influencerId: influencer.uid,
      influencerName: influencer.influencerName || influencer.name,
      influencerAvatarUrl: influencer.avatarUrl,
      brandId: product.brandId,
      brandName: product.brandName,
      productId: product.id,
      productName: product.productName,
      productImageUrl: product.productImageUrl,
      message,
      status: CollaborationRequestStatus.PENDING,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      const newRequestRef = await db.collection('collaborationRequests').add(requestData);
      await createNotification(
          product.brandId,
          NotificationType.COLLABORATION_REQUEST_RECEIVED,
          influencer.influencerName || influencer.name,
          influencer.avatarUrl,
          'collaboration-requests',
          newRequestRef.id
      );

      // Increment request count for free users
      if (influencer.plan === 'free') {
        const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const usageDocRef = db.collection('users').doc(influencer.uid).collection('usage').doc(yearMonth);

        await db.runTransaction(async (transaction) => {
            const usageDoc = await transaction.get(usageDocRef);
            const currentCount = usageDoc.exists ? usageDoc.data()?.requestCount || 0 : 0;
            transaction.set(usageDocRef, { requestCount: currentCount + 1 }, { merge: true });
        });
        
        // Update local state
        onUserUpdate({
            monthlyRequestsSent: (influencer.monthlyRequestsSent ?? 0) + 1
        });
      }

      onSuccess();
    } catch (err) {
      console.error("Error sending request:", err);
      setError(t.requestSentError);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800">{t.collaborationRequestModalTitle(product.productName)}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">{error}</p>}
          
          {!hasContactInfo && (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {t.contactInfoMissingNotice}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">{t.requestMessageLabel}</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.requestMessagePlaceholder}
              required
              rows={5}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </form>

        <div className="p-6 border-t bg-slate-50 rounded-b-2xl mt-auto">
          <button
            type="button" // to prevent submitting the form twice
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-white font-bold bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t.sendRequest}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaborationRequestModal;