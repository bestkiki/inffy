import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { User, Language } from '../types';
import { translations } from '../translations';
import { XIcon } from './icons/XIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { MailIcon } from './icons/MailIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { PhoneIcon } from './icons/PhoneIcon';

interface CompanyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  brandId: string;
}

const CompanyInfoModal: React.FC<CompanyInfoModalProps> = ({ isOpen, onClose, language, brandId }) => {
  const t = translations[language];
  const [brandInfo, setBrandInfo] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && brandId) {
      setIsLoading(true);
      const fetchBrandInfo = async () => {
        try {
          const doc = await db.collection('users').doc(brandId).get();
          if (doc.exists) {
            setBrandInfo(doc.data() as User);
          } else {
            console.error("Brand not found");
          }
        } catch (error) {
          console.error("Error fetching brand info: ", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchBrandInfo();
    }
  }, [isOpen, brandId]);

  if (!isOpen) return null;

  const displayName = brandInfo?.companyName || brandInfo?.name || t.infoNotAvailable;
  const contactName = brandInfo?.name || t.infoNotAvailable;
  const contactEmail = brandInfo?.email || t.infoNotAvailable;
  const contactPhone = brandInfo?.phone || t.infoNotAvailable;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800">{t.companyInfoModalTitle}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
          ) : brandInfo ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <BuildingIcon className="w-6 h-6 text-slate-500 mr-4" />
                <div>
                  <p className="text-sm text-slate-500">{t.companyNameLabel}</p>
                  <p className="font-semibold text-slate-800">{displayName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <UserCircleIcon className="w-6 h-6 text-slate-500 mr-4" />
                <div>
                  <p className="text-sm text-slate-500">{t.companyContactPerson}</p>
                  <p className="font-semibold text-slate-800">{contactName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MailIcon className="w-6 h-6 text-slate-500 mr-4" />
                <div>
                  <p className="text-sm text-slate-500">{t.companyContactEmail}</p>
                  <p className="font-semibold text-slate-800">{contactEmail}</p>
                </div>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="w-6 h-6 text-slate-500 mr-4" />
                <div>
                  <p className="text-sm text-slate-500">{t.companyContactPhone}</p>
                  <p className="font-semibold text-slate-800">{contactPhone}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-10">{t.infoNotAvailable}</p>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="py-2 px-6 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
          >
            {t.closeButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoModal;