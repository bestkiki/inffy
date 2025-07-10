import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { User, Language, CollaborationRequest, CollaborationRequestStatus, NotificationType } from '../types';
import { translations } from '../translations';
import { InboxArrowDownIcon } from './icons/InboxArrowDownIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { MailIcon } from './icons/MailIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { createNotification } from '../lib/notifications';

interface ReceivedRequestsPageProps {
  user: User;
  language: Language;
  onViewProfile: (profileId: string) => void;
}

const ReceivedRequestsPage: React.FC<ReceivedRequestsPageProps> = ({ user, language, onViewProfile }) => {
  const t = translations[language];
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = db.collection('collaborationRequests')
      .where('brandId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const requestData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CollaborationRequest[];
        setRequests(requestData);
        setIsLoading(false);
      }, error => {
        console.error("Error fetching collaboration requests:", error);
        setIsLoading(false);
      });

    return () => unsubscribe();
  }, [user.uid]);

  const handleUpdateStatus = async (request: CollaborationRequest, status: CollaborationRequestStatus) => {
    const successMessage = status === CollaborationRequestStatus.ACCEPTED ? t.requestAcceptedSuccess : t.requestRejectedSuccess;
    let updateData: Partial<CollaborationRequest> = { status };

    if (status === CollaborationRequestStatus.ACCEPTED) {
        try {
            const influencerDoc = await db.collection('users').doc(request.influencerId).get();
            if (influencerDoc.exists) {
                const influencerData = influencerDoc.data() as User;
                updateData.influencerContact = {
                    email: influencerData.email,
                    phone: influencerData.phone || '',
                    kakaoId: influencerData.kakaoId || '',
                };
            }
        } catch (error) {
            console.error("Failed to fetch influencer contact info:", error);
            setNotification({ type: 'error', message: 'Failed to fetch influencer contact info.' });
            setTimeout(() => setNotification(null), 4000);
            return;
        }
    }

    try {
      await db.collection('collaborationRequests').doc(request.id).update(updateData);
      await createNotification(
          request.influencerId,
          status === CollaborationRequestStatus.ACCEPTED ? NotificationType.REQUEST_ACCEPTED : NotificationType.REQUEST_REJECTED,
          user.companyName || user.name,
          user.avatarUrl,
          'sent-requests',
          request.id
      );
      setNotification({ type: 'success', message: successMessage });
    } catch (error) {
      console.error("Error updating request status:", error);
      setNotification({ type: 'error', message: t.requestUpdateError });
    }
    setTimeout(() => setNotification(null), 4000);
  };
  
  const handleToggleArchive = async (request: CollaborationRequest, archive: boolean) => {
    const successMessage = archive ? t.requestArchivedSuccess : t.requestRestoredSuccess;
    const errorMessage = archive ? t.requestArchiveError : t.requestRestoreError;
    try {
      await db.collection('collaborationRequests').doc(request.id).update({ hiddenForBrand: archive });
      setNotification({ type: 'success', message: successMessage });
    } catch (error) {
      console.error("Error updating request archive status:", error);
      setNotification({ type: 'error', message: errorMessage });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const getStatusChip = (status: CollaborationRequestStatus) => {
    const statusText = t[`status_${status}`] || status;
    switch (status) {
      case CollaborationRequestStatus.PENDING:
        return <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">{statusText}</span>;
      case CollaborationRequestStatus.ACCEPTED:
        return <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">{statusText}</span>;
      case CollaborationRequestStatus.REJECTED:
        return <span className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">{statusText}</span>;
      default:
        return <span className="px-3 py-1 text-xs font-medium text-slate-800 bg-slate-100 rounded-full">{statusText}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  const displayedRequests = requests.filter(r => showArchived ? r.hiddenForBrand : !r.hiddenForBrand);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-slate-800">{t.receivedRequestsTitle}</h2>
            <button
                onClick={() => setShowArchived(!showArchived)}
                className="flex items-center gap-2 py-2 px-4 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
            >
                {showArchived ? (
                    <>
                        <InboxArrowDownIcon className="w-5 h-5"/>
                        <span>{t.showActiveRequests}</span>
                    </>
                ) : (
                    <>
                        <ArchiveBoxIcon className="w-5 h-5"/>
                        <span>{t.showArchivedRequests}</span>
                    </>
                )}
            </button>
        </div>

      {notification && (
        <div className={`p-4 rounded-lg flex items-center ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.type === 'success' ? <CheckIcon className="w-6 h-6 mr-3"/> : <XCircleIcon className="w-6 h-6 mr-3"/>}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {displayedRequests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-md">
          <InboxArrowDownIcon className="w-16 h-16 mx-auto text-slate-300" />
          <h3 className="mt-4 text-2xl font-bold text-slate-800">{showArchived ? t.noArchivedRequests : t.noReceivedRequests}</h3>
          <p className="mt-2 text-slate-500">{showArchived ? t.noArchivedRequestsDesc : t.noReceivedRequestsDesc}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedRequests.map(req => (
            <div key={req.id} className="bg-white p-5 rounded-xl shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Product Info & Influencer */}
                <div className="md:col-span-4 flex items-center gap-4">
                  <img src={req.productImageUrl} alt={req.productName} className="w-20 h-20 rounded-lg object-cover bg-slate-100" />
                  <div>
                    <p className="font-bold text-slate-800">{req.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <img src={req.influencerAvatarUrl} alt={req.influencerName} className="w-6 h-6 rounded-full"/>
                        <button onClick={() => onViewProfile(req.influencerId)} className="text-sm font-semibold text-brand-primary hover:underline">{req.influencerName}</button>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="md:col-span-5">
                  <p className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg">"{req.message}"</p>
                </div>

                {/* Status & Actions/Contact */}
                <div className="md:col-span-3 flex flex-col md:items-end justify-start h-full">
                   <div className="self-stretch text-right mb-2">
                        {getStatusChip(req.status)}
                   </div>
                   {showArchived ? (
                      <div className="flex items-center space-x-2 mt-auto">
                        <button
                          onClick={() => handleToggleArchive(req, false)}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          title={t.restoreRequest}
                        >
                          <ArrowUturnLeftIcon className="w-4 h-4" />
                          <span>{t.restoreRequest}</span>
                        </button>
                      </div>
                   ) : (
                     <>
                      {req.status === CollaborationRequestStatus.PENDING && (
                        <div className="flex items-center space-x-2 mt-auto">
                            <button
                                onClick={() => handleUpdateStatus(req, CollaborationRequestStatus.ACCEPTED)}
                                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-sm"
                            >
                                <CheckIcon className="w-4 h-4" />
                                <span>{t.acceptButton}</span>
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(req, CollaborationRequestStatus.REJECTED)}
                                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                                <XCircleIcon className="w-4 h-4" />
                                <span>{t.rejectButton}</span>
                            </button>
                        </div>
                      )}
                      {req.status === CollaborationRequestStatus.ACCEPTED && (
                        <div className="mt-auto w-full">
                            {req.influencerContact && (
                                <div className="bg-green-50 p-3 rounded-lg text-left">
                                    <h4 className="text-sm font-bold text-green-800 mb-2">{t.influencerContactInfo}</h4>
                                    <div className="space-y-1">
                                        <div className="flex items-center text-xs text-slate-700"><MailIcon className="w-4 h-4 mr-2 text-slate-400 shrink-0" /><span>{req.influencerContact.email}</span></div>
                                        {req.influencerContact.phone && <div className="flex items-center text-xs text-slate-700"><PhoneIcon className="w-4 h-4 mr-2 text-slate-400 shrink-0" /><span>{req.influencerContact.phone}</span></div>}
                                        {req.influencerContact.kakaoId && <div className="flex items-center text-xs text-slate-700"><UserCircleIcon className="w-4 h-4 mr-2 text-slate-400 shrink-0" /><span>{req.influencerContact.kakaoId}</span></div>}
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end pt-1">
                                <button
                                    onClick={() => handleToggleArchive(req, true)}
                                    className="p-2 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                                    title={t.archiveRequest}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                      )}
                      {req.status === CollaborationRequestStatus.REJECTED && (
                        <div className="flex items-center space-x-2 mt-auto">
                          <button
                            onClick={() => handleToggleArchive(req, true)}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                            title={t.archiveRequest}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                     </>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceivedRequestsPage;