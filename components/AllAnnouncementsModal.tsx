
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { Announcement, Language, UserType } from '../types';
import { translations } from '../translations';
import { XIcon } from './icons/XIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';

interface AllAnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  userType: UserType;
}

const AllAnnouncementsModal: React.FC<AllAnnouncementsModalProps> = ({ isOpen, onClose, language, userType }) => {
  const t = translations[language];
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const fetchAnnouncements = async () => {
        try {
          const querySnapshot = await db.collection('announcements')
            .where('targetUserType', '==', userType)
            .orderBy('createdAt', 'desc')
            .get();
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
          setAnnouncements(data);
        } catch (error) {
          console.error("Error fetching all announcements:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAnnouncements();
    }
  }, [isOpen, userType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <header className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800">{t.allAnnouncementsTitle}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 space-y-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-10">
              <MegaphoneIcon className="w-12 h-12 mx-auto text-slate-300" />
              <p className="mt-4 text-slate-500">{t.noNotifications}</p>
            </div>
          ) : (
            announcements.map(ann => (
              <div key={ann.id} className="bg-slate-50 p-5 rounded-xl border">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-800">{ann.title}</h3>
                    <p className="text-xs text-slate-400 shrink-0 ml-4">{ann.createdAt?.toDate().toLocaleDateString()}</p>
                </div>
                <p className="mt-2 text-slate-600 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
              </div>
            ))
          )}
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

export default AllAnnouncementsModal;
