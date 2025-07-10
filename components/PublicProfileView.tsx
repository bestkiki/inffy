import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { PublicProfile, Language, User, UserType } from '../types';
import { translations } from '../translations';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { UsersIcon } from './icons/UsersIcon';
import { LinkIcon } from './icons/LinkIcon';
import ProposalModal from './ProposalModal';

interface PublicProfileViewProps {
  userId: string;
  language: Language;
  onBack: () => void;
  currentUser: User;
  onUserUpdate: (updatedData: Partial<User>) => void;
}

const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
};

const PublicProfileView: React.FC<PublicProfileViewProps> = ({ userId, language, onBack, currentUser, onUserUpdate }) => {
  const t = translations[language];
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const userDocRef = db.collection('users').doc(userId);
        const docSnap = await userDocRef.get();
        if (docSnap.exists) {
          // The document data itself doesn't contain the ID, so we add it manually from the userId prop.
          setProfile({ uid: userId, ...docSnap.data() } as PublicProfile);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [userId]);
  
  const handleProposalSuccess = () => {
    setIsProposalModalOpen(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return <div>Profile not found.</div>;
  }
  
  const isLimitReached = 
    currentUser.type === UserType.COMPANY &&
    currentUser.plan === 'free' &&
    currentUser.proposalLimit !== -1 &&
    (currentUser.monthlyProposalsSent ?? 0) >= currentUser.proposalLimit;

  const displayName = profile.influencerName || 'Influencer';
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=c4b5fd&color=4c1d95&bold=true`;

  return (
    <>
      <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
          <div className="flex justify-between items-start mb-8">
              <button onClick={onBack} className="flex items-center text-slate-600 hover:text-brand-primary font-semibold transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  {t.backToList}
              </button>
              {currentUser.type === UserType.COMPANY && (
                <div className="text-right">
                    <button 
                      onClick={() => setIsProposalModalOpen(true)}
                      disabled={isLimitReached}
                      className="bg-brand-primary text-white font-bold py-2 px-6 rounded-full hover:bg-brand-dark transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                      title={isLimitReached ? t.proposalLimitReached : ""}
                    >
                        {t.proposeCampaign}
                    </button>
                    {isLimitReached && <p className="text-red-500 text-xs mt-1">{t.proposalLimitReached}</p>}
                </div>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 flex flex-col items-center text-center">
                   <img 
                      src={profile.avatarUrl || defaultAvatar}
                      alt={displayName} 
                      className="w-32 h-32 rounded-full shadow-lg object-cover border-4 border-white" 
                      onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                  />
                  <h2 className="mt-4 text-3xl font-bold text-slate-800">{displayName}</h2>
                  <div className="mt-2 flex items-center text-slate-500">
                      <UsersIcon className="w-5 h-5 mr-1" />
                      <span className="font-semibold">{formatFollowers(profile.followerCount || 0)}</span>
                      <span className="ml-1">{t.followers}</span>
                  </div>
              </div>

               <div className="md:col-span-2 space-y-6">
                  <div>
                      <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-2">{t.bioLabel}</h3>
                      <p className="text-slate-600 whitespace-pre-wrap">{profile.bio || t.noBioAvailable}</p>
                  </div>
                   <div>
                      <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-2">{t.influencerCategoriesLabel}</h3>
                      <div className="flex flex-wrap gap-2">
                      {profile.categories && profile.categories.length > 0 ? (
                          profile.categories.map((category) => (
                          <span key={category} className="px-3 py-1 bg-brand-light text-brand-dark text-sm font-semibold rounded-full">
                              {category}
                          </span>
                          ))
                      ) : (
                          <p className="text-slate-500">{t.noCategories}</p>
                      )}
                      </div>
                  </div>
                  <div>
                      <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-2">{t.socialLinksLabel}</h3>
                      <div className="space-y-2">
                          {profile.instagramUrl && <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-slate-600 hover:text-brand-primary"><LinkIcon className="w-5 h-5 mr-2"/>Instagram</a>}
                          {profile.youtubeUrl && <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-slate-600 hover:text-brand-primary"><LinkIcon className="w-5 h-5 mr-2"/>YouTube</a>}
                          {profile.tiktokUrl && <a href={profile.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-slate-600 hover:text-brand-primary"><LinkIcon className="w-5 h-5 mr-2"/>TikTok</a>}
                      </div>
                  </div>
               </div>
          </div>
      </div>
      
      {isProposalModalOpen && profile && (
        <ProposalModal
            isOpen={isProposalModalOpen}
            onClose={() => setIsProposalModalOpen(false)}
            language={language}
            brand={currentUser}
            influencer={profile}
            onSuccess={handleProposalSuccess}
            onUserUpdate={onUserUpdate}
        />
      )}
    </>
  );
};

export default PublicProfileView;