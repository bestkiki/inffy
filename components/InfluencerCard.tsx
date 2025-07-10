import React from 'react';
import { User, Language } from '../types';
import { translations } from '../translations';
import { UsersIcon } from './icons/UsersIcon';

interface InfluencerCardProps {
  influencer: User;
  language: Language;
  onViewProfile: () => void;
}

const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
};

const InfluencerCard: React.FC<InfluencerCardProps> = ({ influencer, language, onViewProfile }) => {
  const t = translations[language];
  const displayName = influencer.influencerName || influencer.name;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex items-center mb-4">
          <img className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-brand-accent" src={influencer.avatarUrl} alt={displayName} />
          <div>
            <h3 className="text-xl font-bold text-slate-800 leading-tight">{displayName}</h3>
            <div className="flex items-center text-sm text-slate-500 mt-1">
                <UsersIcon className="w-4 h-4 mr-1"/>
                <span>{formatFollowers(influencer.followerCount || 0)} {t.followers}</span>
            </div>
          </div>
        </div>
        
        <p className="text-slate-600 text-sm mb-4 h-10 overflow-hidden">
          {influencer.bio || t.noBioAvailable}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {influencer.categories && influencer.categories.length > 0 ? (
            influencer.categories.slice(0, 3).map((category, index) => (
              <span key={index} className="px-2 py-1 bg-brand-light text-brand-dark text-xs font-semibold rounded-full">
                {category}
              </span>
            ))
          ) : (
            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full">
              {t.noCategories}
            </span>
          )}
        </div>
      </div>
      <div className="p-4 bg-slate-50 border-t">
        <button onClick={onViewProfile} className="w-full bg-brand-primary text-white font-semibold py-2 rounded-lg hover:bg-brand-dark transition-colors">
            {t.viewProfile}
        </button>
      </div>
    </div>
  );
};

export default InfluencerCard;