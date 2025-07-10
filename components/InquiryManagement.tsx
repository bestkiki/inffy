import React, { useState, useEffect, useMemo } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { Inquiry, InquiryStatus, Language } from '../types';
import { translations } from '../translations';
import InquiryDetailsModal from './InquiryDetailsModal';
import { ChatBubbleLeftEllipsisIcon } from './icons/ChatBubbleLeftEllipsisIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { TrashIcon } from './icons/TrashIcon';

interface InquiryManagementProps {
  language: Language;
  t: any;
  setNotification: (notif: { type: 'success' | 'error'; message: string } | null) => void;
}

type InquiryFilter = 'new' | 'in_progress' | 'resolved';

const InquiryManagement: React.FC<InquiryManagementProps> = ({ language, t, setNotification }) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<InquiryFilter>('new');
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = db.collection('inquiries')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Inquiry[];
        setInquiries(data);
        setIsLoading(false);
      }, err => {
        console.error("Error fetching inquiries:", err);
        setNotification({ type: 'error', message: "Failed to load inquiries." });
        setIsLoading(false);
      });

    return () => unsubscribe();
  }, [setNotification]);
  
  const filteredInquiries = useMemo(() => {
      return inquiries.filter(inq => inq.status === filter);
  }, [inquiries, filter]);

  const handleUpdateStatus = async (inquiryId: string, newStatus: InquiryStatus) => {
    try {
        await db.collection('inquiries').doc(inquiryId).update({ status: newStatus });
        setNotification({ type: 'success', message: t.inquiryStatusUpdatedSuccess });
    } catch(err) {
        console.error("Error updating inquiry status:", err);
        setNotification({ type: 'error', message: t.inquiryStatusUpdateError });
    }
     setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (window.confirm(t.confirmDeleteInquiry)) {
      try {
        await db.collection('inquiries').doc(inquiryId).delete();
        setNotification({ type: 'success', message: t.inquiryDeletedSuccess });
      } catch (err) {
        console.error("Error deleting inquiry:", err);
        setNotification({ type: 'error', message: t.inquiryDeleteError });
      }
      setTimeout(() => setNotification(null), 4000);
    }
  };
  
  const getStatusChip = (status: InquiryStatus) => {
    const statusText = t[`status_${status}`] || status;
    let colorClasses = 'text-slate-800 bg-slate-100';
    if (status === InquiryStatus.NEW) colorClasses = 'text-blue-800 bg-blue-100';
    if (status === InquiryStatus.IN_PROGRESS) colorClasses = 'text-yellow-800 bg-yellow-100';
    if (status === InquiryStatus.RESOLVED) colorClasses = 'text-green-800 bg-green-100';
    return <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${colorClasses}`}>{statusText}</span>;
  };

  const formatDate = (timestamp: firebase.firestore.Timestamp) => {
      if (!timestamp?.toDate) return 'N/A';
      return timestamp.toDate().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US');
  };

  return (
    <>
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-bold text-slate-800">{t.inquiryManagementTitle}</h3>
        <div className="flex border-b border-slate-200 md:border-none w-full md:w-auto overflow-x-auto">
          {(['new', 'in_progress', 'resolved'] as InquiryFilter[]).map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-3 font-semibold text-sm transition-colors whitespace-nowrap ${filter === tab ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'}`}>
              {t[`filter_inquiry_${tab}`]}
            </button>
          ))}
        </div>
      </div>
       <div className="overflow-x-auto">
         {isLoading ? (
             <div className="p-8 text-center">Loading...</div>
         ) : filteredInquiries.length === 0 ? (
          <div className="text-center py-20">
              <ChatBubbleLeftEllipsisIcon className="w-16 h-16 mx-auto text-slate-300" />
              <h3 className="mt-4 text-2xl font-bold text-slate-800">{t.noInquiries}</h3>
          </div>
        ) : (
        <table className="w-full min-w-max text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.from}</th>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.subject}</th>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.inquiryDate}</th>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.status}</th>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider text-center">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInquiries.map(inquiry => (
              <tr key={inquiry.id}>
                  <td className="p-4">
                      <p className="font-medium text-slate-800">{inquiry.name}</p>
                      <p className="text-xs text-slate-500">{inquiry.email}</p>
                  </td>
                  <td className="p-4 text-slate-600">{t.contactUsSubjects[inquiry.subject] || inquiry.subject}</td>
                  <td className="p-4 text-slate-600">{formatDate(inquiry.createdAt)}</td>
                  <td className="p-4">{getStatusChip(inquiry.status)}</td>
                  <td className="p-4">
                      <div className="flex justify-center items-center space-x-2">
                        <button onClick={() => setViewingInquiry(inquiry)} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">{t.viewMessage}</button>
                        {inquiry.status === InquiryStatus.NEW && (
                            <button onClick={() => handleUpdateStatus(inquiry.id, InquiryStatus.IN_PROGRESS)} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200">{t.status_in_progress}</button>
                        )}
                        {inquiry.status === InquiryStatus.IN_PROGRESS && (
                            <button onClick={() => handleUpdateStatus(inquiry.id, InquiryStatus.RESOLVED)} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200">{t.status_resolved}</button>
                        )}
                        {inquiry.status === InquiryStatus.RESOLVED && (
                           <button onClick={() => handleDeleteInquiry(inquiry.id)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                              <TrashIcon className="w-4 h-4" />
                              <span>{t.deleteButton}</span>
                           </button>
                        )}
                      </div>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {viewingInquiry && (
        <InquiryDetailsModal
            isOpen={!!viewingInquiry}
            onClose={() => setViewingInquiry(null)}
            language={language}
            inquiry={viewingInquiry}
        />
      )}
    </>
  );
}

export default InquiryManagement;
