import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { Language, User, PublicProfile, Proposal, ProposalPayoutType, ProposalStatus, NotificationType } from '../types';
import { translations } from '../translations';
import { XIcon } from './icons/XIcon';
import { createNotification } from '../lib/notifications';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  brand: User;
  influencer: PublicProfile;
  onSuccess: () => void;
  onUserUpdate: (updatedData: Partial<User>) => void;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ isOpen, onClose, language, brand, influencer, onSuccess, onUserUpdate }) => {
  const t = translations[language];

  const [productName, setProductName] = useState('');
  const [productLink, setProductLink] = useState('');
  const [productPrice, setProductPrice] = useState<number | ''>('');
  const [groupBuyPrice, setGroupBuyPrice] = useState<number | ''>('');
  const [payoutType, setPayoutType] = useState<ProposalPayoutType>(ProposalPayoutType.FIXED);
  const [payoutValue, setPayoutValue] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!productName || !productLink || productPrice === '' || payoutValue === '') {
        setError("모든 필수 필드를 입력해주세요.");
        setIsLoading(false);
        return;
    }

    const proposalData: Omit<Proposal, 'id'> = {
        brandId: brand.uid,
        brandName: brand.companyName || brand.name,
        influencerId: influencer.uid,
        influencerName: influencer.influencerName || 'N/A',
        productName: productName,
        productLink: productLink,
        productPrice: Number(productPrice),
        ...(groupBuyPrice !== '' && { groupBuyPrice: Number(groupBuyPrice) }),
        payoutType: payoutType,
        payoutValue: Number(payoutValue),
        status: ProposalStatus.PENDING,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
        const newProposalRef = await db.collection('proposals').add(proposalData);
        await createNotification(
            influencer.uid,
            NotificationType.PROPOSAL_RECEIVED,
            brand.companyName || brand.name,
            brand.avatarUrl,
            'proposals',
            newProposalRef.id
        );
        
        // Increment proposal count for free users
        if (brand.plan === 'free') {
            const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const usageDocRef = db.collection('users').doc(brand.uid).collection('usage').doc(yearMonth);

            await db.runTransaction(async (transaction) => {
                const usageDoc = await transaction.get(usageDocRef);
                const currentCount = usageDoc.exists ? usageDoc.data()?.proposalCount || 0 : 0;
                transaction.set(usageDocRef, { proposalCount: currentCount + 1 }, { merge: true });
            });
            
            // Update local state
            onUserUpdate({
                monthlyProposalsSent: (brand.monthlyProposalsSent ?? 0) + 1
            });
        }
        
        alert(t.proposalSuccess);
        onSuccess();
    } catch (err) {
        console.error("Error creating proposal:", err);
        setError(t.proposalError);
    } finally {
        setIsLoading(false);
    }

  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800">{t.proposeCampaignModalTitle(influencer.influencerName || 'Influencer')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">{error}</p>}
          
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-slate-700 mb-1">{t.productNameLabel}</label>
            <input id="productName" type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={t.productNamePlaceholder} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>

          <div>
            <label htmlFor="productLink" className="block text-sm font-medium text-slate-700 mb-1">{t.productLinkLabel}</label>
            <input id="productLink" type="url" value={productLink} onChange={(e) => setProductLink(e.target.value)} placeholder={t.productLinkPlaceholder} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>
          
          <div>
            <label htmlFor="productPrice" className="block text-sm font-medium text-slate-700 mb-1">{t.productPriceLabel}</label>
            <input id="productPrice" type="number" value={productPrice} onChange={(e) => setProductPrice(Number(e.target.value))} placeholder={t.productPricePlaceholder} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>
          
          <div>
            <label htmlFor="groupBuyPrice" className="block text-sm font-medium text-slate-700 mb-1">{t.groupBuyPriceLabel}</label>
            <input id="groupBuyPrice" type="number" value={groupBuyPrice} onChange={(e) => setGroupBuyPrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder={t.groupBuyPricePlaceholder} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t.payoutTypeLabel}</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setPayoutType(ProposalPayoutType.FIXED)} className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${payoutType === ProposalPayoutType.FIXED ? 'border-brand-primary bg-brand-light text-brand-dark font-bold' : 'border-slate-300 bg-white hover:border-brand-secondary'}`}>
                {t.payoutTypeFixed}
              </button>
              <button type="button" onClick={() => setPayoutType(ProposalPayoutType.COMMISSION)} className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${payoutType === ProposalPayoutType.COMMISSION ? 'border-brand-primary bg-brand-light text-brand-dark font-bold' : 'border-slate-300 bg-white hover:border-brand-secondary'}`}>
                {t.payoutTypeCommission}
              </button>
            </div>
          </div>
          
          {payoutType === ProposalPayoutType.FIXED && (
             <div className="animate-fade-in">
                <label htmlFor="fixedPrice" className="block text-sm font-medium text-slate-700 mb-1">{t.fixedPriceLabel}</label>
                <input id="fixedPrice" type="number" value={payoutValue} onChange={(e) => setPayoutValue(Number(e.target.value))} placeholder={t.fixedPricePlaceholder} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary" />
             </div>
          )}

          {payoutType === ProposalPayoutType.COMMISSION && (
             <div className="animate-fade-in">
                <label htmlFor="commissionRate" className="block text-sm font-medium text-slate-700 mb-1">{t.commissionRateLabel}</label>
                <input id="commissionRate" type="number" value={payoutValue} onChange={(e) => setPayoutValue(Number(e.target.value))} placeholder={t.commissionRatePlaceholder} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary" />
             </div>
          )}
        </form>

        <div className="p-6 border-t bg-slate-50 rounded-b-2xl">
            <button type="submit" onClick={handleSubmit} disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-white font-bold bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300">
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t.sendProposalButton}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;