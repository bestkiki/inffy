import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { User, Language, CollaborationRequest, CollaborationRequestStatus } from '../types';
import { translations } from '../translations';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { TrashIcon } from './icons/TrashIcon';

interface MyRequestsPageProps {
  user: User;
  language: Language;
}

const MyRequestsPage: React.FC<MyRequestsPageProps> = ({ user, language }) => {
  const t = translations[language];
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = db.collection('collaborationRequests')
      .where('influencerId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const requestData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CollaborationRequest[];
        setRequests(requestData);
        setIsLoading(false);
      }, error => {
        console.error("Error fetching sent requests:", error);
        setIsLoading(false);
      });

    return () => unsubscribe();
  }, [user.uid]);

  const handleToggleArchive = async (request: CollaborationRequest, archive: boolean) => {
    const successMessage = archive ? t.requestArchivedSuccess : t.requestRestoredSuccess;
    const errorMessage = archive ? t.requestArchiveError : t.requestRestoreError;
    try {
      await db.collection('collaborationRequests').doc(request.id).update({ hiddenForInfluencer: archive });
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
         return (
            <div className="text-xs font-medium text-green-800 bg-green-100 py-2 px-3 rounded-lg inline-block">
                {t.requestAcceptedInfo}
            </div>
        );
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

  const displayedRequests = requests.filter(r => showArchived ? r.hiddenForInfluencer : !r.hiddenForInfluencer);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">{t.sentRequestsTitle}</h2>
         <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 py-2 px-4 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
        >
            {showArchived ? (
                <>
                    <PaperAirplaneIcon className="w-5 h-5"/>
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
          <PaperAirplaneIcon className="w-16 h-16 mx-auto text-slate-300" />
          <h3 className="mt-4 text-2xl font-bold text-slate-800">{showArchived ? t.noArchivedSentRequests : t.noSentRequests}</h3>
          <p className="mt-2 text-slate-500">{showArchived ? t.noArchivedSentRequestsDesc : t.noSentRequestsDesc}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
          <table className="w-full min-w-max text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.product}</th>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.brand}</th>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.statusLabel}</th>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider text-center">{t.actionsLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRequests.map(req => (
                <tr key={req.id}>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <img src={req.productImageUrl} alt={req.productName} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                      <div>
                        <p className="font-medium text-slate-800">{req.productName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-600">{req.brandName}</td>
                  <td className="p-4">
                    {getStatusChip(req.status)}
                  </td>
                   <td className="p-4 text-center">
                    {showArchived ? (
                         <button
                            onClick={() => handleToggleArchive(req, false)}
                            className="flex items-center justify-center gap-1 mx-auto px-3 py-1.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            title={t.restoreRequest}
                        >
                            <ArrowUturnLeftIcon className="w-4 h-4"/>
                        </button>
                    ) : (
                        req.status !== CollaborationRequestStatus.PENDING && (
                            <button
                                onClick={() => handleToggleArchive(req, true)}
                                className="p-2 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                                title={t.archiveRequest}
                            >
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyRequestsPage;