

import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { User, Language, UserType } from '../types';
import { translations } from '../translations';
import { XIcon } from './icons/XIcon';
import { MailIcon } from './icons/MailIcon';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number | string[] }> = ({ label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  
  let displayValue: React.ReactNode = value;
  if (Array.isArray(value)) {
    displayValue = value.join(', ');
  } else if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('www'))) {
    displayValue = <a href={value} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline break-all">{value}</a>;
  }

  return (
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <div className="mt-1 text-slate-800">{displayValue}</div>
    </div>
  );
};

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, language, user, onUserUpdate }) => {
  const t = translations[language];
  const isInfluencer = user.type === UserType.INFLUENCER;

  const [plan, setPlan] = useState(user.plan || 'free');
  const [followerSearchLimit, setFollowerSearchLimit] = useState(user.followerSearchLimit ?? 10000);
  const [expiryDate, setExpiryDate] = useState('');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  useEffect(() => {
    if (user.planExpiryDate) {
        const date = user.planExpiryDate.toDate();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        setExpiryDate(`${yyyy}-${mm}-${dd}`);
    } else {
        setExpiryDate('');
    }
  }, [user.planExpiryDate]);
  
  useEffect(() => {
    if (isOpen) {
        setPlan(user.plan || 'free');
        if(user.type === UserType.COMPANY) {
          setFollowerSearchLimit(user.followerSearchLimit ?? 10000);
        }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSavePlan = async () => {
    setIsSavingPlan(true);
    try {
        const updateData: { [key: string]: any } = { plan };
        
        if (!isInfluencer) {
            updateData.followerSearchLimit = followerSearchLimit;
        }

        if (expiryDate) {
            const date = new Date(expiryDate);
            date.setUTCHours(23, 59, 59, 999);
            updateData.planExpiryDate = firebase.firestore.Timestamp.fromDate(date);
        } else {
            updateData.planExpiryDate = firebase.firestore.FieldValue.delete();
        }

        await db.collection('users').doc(user.uid).update(updateData);
        onUserUpdate({ ...user, ...updateData, planExpiryDate: updateData.planExpiryDate });
    } catch (e) {
        console.error("Error updating plan:", e);
        alert(t.planUpdateError);
    } finally {
        setIsSavingPlan(false);
    }
  };

  const displayName = user.influencerName || user.companyName || user.name;

  const followerLimitOptions = [
      { label: t.limit_10k, value: 10000 },
      { label: t.limit_50k, value: 50000 },
      { label: t.limit_100k, value: 100000 },
      { label: t.limit_unlimited, value: -1 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800">{t.userDetailsTitle}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center gap-4">
            <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=c4b5fd&color=4c1d95`} alt={displayName} className="w-20 h-20 rounded-full object-cover bg-slate-100" />
            <div>
              <h3 className="text-xl font-bold text-slate-800">{displayName}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <MailIcon className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <DetailItem label={t.nameLabel} value={user.name} />
            <DetailItem label={t.userType} value={user.type === UserType.INFLUENCER ? t.forInfluencers : t.forBrandsShort} />
            <DetailItem label={t.phoneLabel} value={user.phone} />
            <DetailItem label={t.kakaoIdLabel} value={user.kakaoId} />
            
            {isInfluencer ? (
              <>
                <DetailItem label={t.instagramUrlLabel} value={user.instagramUrl} />
                <DetailItem label={t.youtubeUrlLabel} value={user.youtubeUrl} />
                <DetailItem label={t.tiktokUrlLabel} value={user.tiktokUrl} />
                <DetailItem label={t.followerCountLabel} value={user.followerCount?.toLocaleString()} />
                <div className="md:col-span-2"><DetailItem label={t.influencerCategoriesLabel} value={user.categories} /></div>
                <div className="md:col-span-2"><DetailItem label={t.bioLabel} value={user.bio} /></div>
              </>
            ) : (
              <>
                <DetailItem label={t.websiteUrlLabel} value={user.websiteUrl} />
                <DetailItem label={t.businessNumberLabel} value={user.businessRegistrationNumber} />
                <div className="md:col-span-2"><DetailItem label={t.companyDescriptionLabel} value={user.companyDescription} /></div>
              </>
            )}
          </div>
          
          <div className="pt-4 border-t">
              <h4 className="text-lg font-semibold text-slate-700 mb-2">{t.planManagementTitle}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div>
                    <label htmlFor="plan" className="block text-sm font-medium text-slate-700 mb-1">{t.planLabel}</label>
                    <select id="plan" value={plan} onChange={(e) => setPlan(e.target.value as 'free' | 'pro' | 'enterprise')} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
                      <option value="free">{t.plan_free}</option>
                      <option value="pro">{t.plan_pro}</option>
                      <option value="enterprise">{t.plan_enterprise}</option>
                    </select>
                  </div>
                  {!isInfluencer && (
                    <div>
                      <label htmlFor="followerSearchLimit" className="block text-sm font-medium text-slate-700 mb-1">{t.followerSearchLimitLabel}</label>
                      <select id="followerSearchLimit" value={followerSearchLimit} onChange={(e) => setFollowerSearchLimit(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
                        {followerLimitOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                   <div>
                    <label htmlFor="planExpiryDate" className="block text-sm font-medium text-slate-700 mb-1">{t.planExpiryDateLabel}</label>
                    <input id="planExpiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                  </div>
                  <button onClick={handleSavePlan} disabled={isSavingPlan} className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white font-bold bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:bg-slate-400 ${isInfluencer ? 'md:col-start-3 lg:col-start-4' : ''}`}>
                     {isSavingPlan ? (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>) : t.savePlan}
                  </button>
              </div>
            </div>
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

export default UserDetailsModal;