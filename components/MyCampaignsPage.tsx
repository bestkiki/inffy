import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { User, Language, Proposal, ProposalStatus, ProposalPayoutType } from '../types';
import { translations } from '../translations';
import { CollectionIcon } from './icons/CollectionIcon';
import { MailIcon } from './icons/MailIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';


interface MyCampaignsPageProps {
  user: User;
  language: Language;
}

const MyCampaignsPage: React.FC<MyCampaignsPageProps> = ({ user, language }) => {
  const t = translations[language];
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showArchived, setShowArchived] = useState(false);


  useEffect(() => {
    setIsLoading(true);
    setNotification(null);
    const unsubscribe = db.collection('proposals')
      .where('brandId', '==', user.uid)
      .onSnapshot(snapshot => {
        const proposalsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Proposal[];
        
        proposalsData.sort((a, b) => {
            const dateA = a.createdAt as firebase.firestore.Timestamp;
            const dateB = b.createdAt as firebase.firestore.Timestamp;
            if (dateA?.toMillis && dateB?.toMillis) {
                return dateB.toMillis() - dateA.toMillis();
            }
            return 0;
        });

        setProposals(proposalsData);
        setIsLoading(false);
      }, error => {
        console.error("Error fetching sent proposals: ", error);
        setIsLoading(false);
      });

    return () => unsubscribe();
  }, [user.uid]);

  const handleHideProposal = async (proposalId: string) => {
    try {
        await db.collection('proposals').doc(proposalId).update({ hiddenForBrand: true });
        setNotification({ type: 'success', message: t.proposalHiddenSuccess });
    } catch (error) {
        console.error("Error hiding proposal:", error);
        setNotification({ type: 'error', message: t.proposalHiddenError });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRestoreProposal = async (proposalId: string) => {
    try {
        await db.collection('proposals').doc(proposalId).update({ hiddenForBrand: false });
        setNotification({ type: 'success', message: t.proposalRestoredSuccess });
    } catch (error) {
        console.error("Error restoring proposal:", error);
        setNotification({ type: 'error', message: t.proposalRestoredError });
    }
    setTimeout(() => setNotification(null), 4000);
  };
  
  const getStatusChip = (status: ProposalStatus) => {
    const statusText = t[`status_${status}`] || status;
    switch (status) {
      case ProposalStatus.PENDING:
        return <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">{statusText}</span>;
      case ProposalStatus.ACCEPTED:
        return <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">{statusText}</span>;
      case ProposalStatus.REJECTED:
        return <span className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">{statusText}</span>;
      case ProposalStatus.COMPLETED:
        return <span className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">{statusText}</span>;
      default:
        return <span className="px-3 py-1 text-xs font-medium text-slate-800 bg-slate-100 rounded-full">{statusText}</span>;
    }
  };

  const formatPayout = (proposal: Proposal) => {
    const value = proposal.payoutValue.toLocaleString();
    if (proposal.payoutType === ProposalPayoutType.FIXED) {
        return t.payoutFixed.replace('{value}', value);
    }
    return t.payoutCommission.replace('{value}', value);
  };
  
  const renderContactInfo = (proposal: Proposal) => {
    if (proposal.status !== ProposalStatus.ACCEPTED || !proposal.influencerContact) {
      return <span className="text-sm text-slate-500 italic">{t.contactInfoNotAvailable}</span>;
    }
    
    const { email, phone, kakaoId } = proposal.influencerContact;

    return (
        <div className="space-y-1 text-left">
            {email && <div className="flex items-center text-sm text-slate-700"><MailIcon className="w-4 h-4 mr-2 text-slate-400 shrink-0" /><span>{email}</span></div>}
            {phone && <div className="flex items-center text-sm text-slate-700"><PhoneIcon className="w-4 h-4 mr-2 text-slate-400 shrink-0" /><span>{phone}</span></div>}
            {kakaoId && <div className="flex items-center text-sm text-slate-700"><UserCircleIcon className="w-4 h-4 mr-2 text-slate-400 shrink-0" /><span>{kakaoId}</span></div>}
        </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  const displayedProposals = proposals.filter(p => showArchived ? p.hiddenForBrand : !p.hiddenForBrand);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">{t.myCampaignsTitle}</h2>
         <button
                onClick={() => setShowArchived(!showArchived)}
                className="flex items-center gap-2 py-2 px-4 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
            >
                {showArchived ? (
                    <>
                        <CollectionIcon className="w-5 h-5"/>
                        <span>{t.showActiveProposals}</span>
                    </>
                ) : (
                    <>
                        <ArchiveBoxIcon className="w-5 h-5"/>
                        <span>{t.showArchivedProposals}</span>
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

      {displayedProposals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <CollectionIcon className="w-16 h-16 mx-auto text-slate-300" />
            <h3 className="mt-4 text-2xl font-bold text-slate-800">{showArchived ? t.noArchivedProposals : t.noCampaigns}</h3>
            <p className="mt-2 text-slate-500">{showArchived ? t.noArchivedProposalsDesc : t.noCampaignsDesc}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
          <table className="w-full min-w-max text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.influencerNameTableLabel}</th>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.productNameLabel}</th>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.payoutLabel}</th>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider text-center">{t.statusLabel}</th>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.contactInfoLabel}</th>
                <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider text-center">{t.actionsLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedProposals.map(proposal => (
                <tr key={proposal.id}>
                  <td className="p-4 font-medium text-slate-800 whitespace-nowrap">{proposal.influencerName}</td>
                  <td className="p-4 font-medium text-slate-800 whitespace-nowrap">{proposal.productName}</td>
                  <td className="p-4 text-slate-600 whitespace-nowrap">{formatPayout(proposal)}</td>
                  <td className="p-4 text-center">{getStatusChip(proposal.status)}</td>
                  <td className="p-4">{renderContactInfo(proposal)}</td>
                  <td className="p-4 text-center">
                    {showArchived ? (
                         <button
                            onClick={() => handleRestoreProposal(proposal.id)}
                            className="flex items-center justify-center gap-1 mx-auto px-3 py-1.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            aria-label={`Restore proposal for ${proposal.productName}`}
                        >
                            <ArrowUturnLeftIcon className="w-4 h-4"/>
                        </button>
                    ) : (
                        (proposal.status === ProposalStatus.REJECTED || proposal.status === ProposalStatus.COMPLETED) && (
                            <button
                                onClick={() => handleHideProposal(proposal.id)}
                                className="p-2 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                                aria-label={t.deleteButton}
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

export default MyCampaignsPage;