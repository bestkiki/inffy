

import React, { useState, useEffect, useMemo } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { User, UserType, Language } from '../types';
import { translations } from '../translations';
import { CATEGORIES, FOLLOWER_RANGES } from './constants';
import InfluencerCard from './InfluencerCard';
import { SearchIcon } from './icons/SearchIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface FindInfluencersPageProps {
  language: Language;
  onViewProfile: (profileId: string) => void;
  currentUser: User;
}

const FindInfluencersPage = ({ language, onViewProfile, currentUser }: FindInfluencersPageProps): React.ReactElement => {
  const t = translations[language];
  const [influencers, setInfluencers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFollowerRange, setSelectedFollowerRange] = useState('all');

  const followerSearchLimit = currentUser.followerSearchLimit ?? 10000;
  const isFreePlan = currentUser.plan === 'free';

  useEffect(() => {
    const fetchInfluencers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let query: firebase.firestore.Query = db.collection('users').where('type', '==', UserType.INFLUENCER);

        if (followerSearchLimit !== -1) {
            query = query.where('followerCount', '<=', followerSearchLimit);
        }

        const snapshot = await query.get();
        const influencerData = snapshot.docs
            .map(doc => ({ ...doc.data(), uid: doc.id } as User))
            .filter(u => u.status === 'active');
        
        setInfluencers(influencerData);
      } catch (err) {
        console.error("Error fetching influencers:", err);
        setError(t.findInfluencersPermissionError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfluencers();
  }, [t.findInfluencersPermissionError, followerSearchLimit]);

  const filteredInfluencers = useMemo(() => {
    if (error) return [];
    return influencers.filter(influencer => {
      // Search term filter
      const nameMatch = influencer.influencerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        influencer.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const categoryMatch = selectedCategory === 'all' || influencer.categories?.includes(selectedCategory);

      // Follower range filter
      const followerMatch = selectedFollowerRange === 'all' || (() => {
          const followerCount = influencer.followerCount || 0;
          const [minStr, maxStr] = selectedFollowerRange.split('-');
          const min = Number(minStr);
          const max = maxStr === 'Infinity' ? Infinity : Number(maxStr);
          return followerCount >= min && (max === Infinity ? true : followerCount < max);
      })();

      return nameMatch && categoryMatch && followerMatch;
    });
  }, [influencers, searchTerm, selectedCategory, selectedFollowerRange, error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-3xl font-bold text-slate-800">{t.findInfluencersTitle}</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchByInfluencerName}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              disabled={!!error}
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-100 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary border-transparent"
              aria-label={t.filterByCategory}
              disabled={!!error}
            >
              <option value="all">{t.allCategories}</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedFollowerRange}
              onChange={e => setSelectedFollowerRange(e.target.value)}
              className="w-full bg-slate-100 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary border-transparent"
              aria-label={t.filterByFollowers}
              disabled={!!error}
            >
              <option value="all">{t.allFollowers}</option>
              {FOLLOWER_RANGES.map(range => {
                const [minStr] = range.value.split('-');
                const min = Number(minStr);
                const isDisabled = followerSearchLimit !== -1 && min >= followerSearchLimit;
                return (
                    <option 
                        key={range.value} 
                        value={range.value} 
                        disabled={isDisabled}
                        className={isDisabled ? 'text-slate-400' : ''}
                    >
                        {t.followerRanges[range.labelKey]} {isDisabled ? '🔒' : ''}
                    </option>
                );
              })}
            </select>
          </div>
        </div>
        {isFreePlan && (
            <div className="mt-4 p-3 rounded-lg bg-brand-light border border-brand-accent text-center">
                <p className="text-sm text-brand-dark flex items-center justify-center gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    <span>{t.upgradeToProTooltip}</span>
                </p>
            </div>
        )}
      </header>
      
      {error ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-400" />
            <h3 className="mt-4 text-2xl font-bold text-slate-800">{t.noResultsFound}</h3>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto">{error}</p>
        </div>
      ) : filteredInfluencers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInfluencers.map(influencer => (
            <InfluencerCard 
              key={influencer.uid} 
              influencer={influencer} 
              language={language}
              onViewProfile={() => onViewProfile(influencer.uid)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <UserGroupIcon className="w-16 h-16 mx-auto text-slate-300" />
            <h3 className="mt-4 text-2xl font-bold text-slate-800">{t.noResultsFound}</h3>
            <p className="mt-2 text-slate-500">{t.noResultsFoundDesc}</p>
        </div>
      )}
    </div>
  );
};

export default FindInfluencersPage;