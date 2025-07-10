

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { User, Language, UserType, Announcement } from '../types';
import { translations } from '../translations';
import { BellIcon } from './icons/BellIcon';
import { InboxArrowDownIcon } from './icons/InboxArrowDownIcon';
import { CubeIcon } from './icons/CubeIcon';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import AllAnnouncementsModal from './AllAnnouncementsModal';

interface DashboardProps {
    user: User;
    language: Language;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  isLoading: boolean;
}

const StatCardSkeleton: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between animate-pulse">
        <div>
            <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-slate-300 rounded w-16"></div>
        </div>
        <div className="p-3 bg-slate-200 rounded-full h-12 w-12"></div>
    </div>
);

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, iconBg, isLoading }) => {
    if (isLoading) {
        return <StatCardSkeleton />;
    }
    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
            <div className={`p-3 ${iconBg} rounded-full`}>
                {icon}
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ user, language }) => {
    const t = translations[language];
    const isInfluencer = user.type === UserType.INFLUENCER;
    const displayName = isInfluencer ? user.influencerName || user.name : user.companyName || user.name;

    const [stats, setStats] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [statsError, setStatsError] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [totalAnnouncements, setTotalAnnouncements] = useState(0);
    const [isAllAnnouncementsModalOpen, setIsAllAnnouncementsModalOpen] = useState(false);
    
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setStatsError(false);
            
            // Fetch stats
            try {
                if (isInfluencer) {
                    const productsQuery = db.collection('products').where('status', '==', 'active').get();
                    const proposalsQuery = db.collection('proposals').where('influencerId', '==', user.uid).get();

                    const [productsSnapshot, proposalsSnapshot] = await Promise.all([
                        productsQuery,
                        proposalsQuery
                    ]);

                    setStats({
                        productMarketCount: productsSnapshot.size,
                        receivedProposalsCount: proposalsSnapshot.size,
                    });

                } else { // Company
                    const usersQuery = db.collection('users').where('type', '==', UserType.INFLUENCER).get();
                    const productsQuery = db.collection('products').where('brandId', '==', user.uid).get();
                    const requestsQuery = db.collection('collaborationRequests').where('brandId', '==', user.uid).get();
                    
                    const [usersSnapshot, productsSnapshot, requestsSnapshot] = await Promise.all([
                        usersQuery,
                        productsQuery,
                        requestsQuery,
                    ]);

                    const activeInfluencers = usersSnapshot.docs
                        .map(doc => doc.data() as User)
                        .filter(u => u.status === 'active');

                    setStats({
                        influencerCount: activeInfluencers.length,
                        productCount: productsSnapshot.size,
                        receivedRequestsCount: requestsSnapshot.size,
                    });
                }
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
                setStatsError(true);
            }

            // Fetch announcements
            try {
                const announcementsQuery = db.collection('announcements')
                    .where('targetUserType', '==', user.type)
                    .orderBy('createdAt', 'desc');

                const limitedSnapshot = await announcementsQuery.limit(3).get();
                const limitedData = limitedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
                setAnnouncements(limitedData);

                const totalSnapshot = await announcementsQuery.get();
                setTotalAnnouncements(totalSnapshot.size);

            } catch (err) {
                console.warn("Could not fetch announcements", err);
            }
            
            setIsLoading(false);
        };

        fetchDashboardData();
    }, [user.uid, user.type, isInfluencer]);
    

    const influencerStats = [
        { label: t.productMarket, value: stats.productMarketCount, icon: <ShoppingBagIcon className="w-6 h-6 text-blue-500" />, iconBg: 'bg-blue-100' },
        { 
            label: t.requestsSentThisMonth,
            value: (user.plan === 'free' && user.requestLimit !== -1)
                ? `${user.monthlyRequestsSent ?? 0} / ${user.requestLimit}`
                : `${user.monthlyRequestsSent ?? 0} / ${t.unlimited}`,
            icon: <PaperAirplaneIcon className="w-6 h-6 text-green-500" />,
            iconBg: 'bg-green-100'
        },
        { label: t.proposals, value: stats.receivedProposalsCount, icon: <BellIcon className="w-6 h-6 text-purple-500" />, iconBg: 'bg-purple-100' },
    ];
    
    const companyStats = [
        { label: t.influencer, value: stats.influencerCount, icon: <UserGroupIcon className="w-6 h-6 text-green-500" />, iconBg: 'bg-green-100' },
        { label: t.myProducts, value: stats.productCount, icon: <CubeIcon className="w-6 h-6 text-blue-500" />, iconBg: 'bg-blue-100' },
        { label: t.receivedRequests, value: stats.receivedRequestsCount, icon: <InboxArrowDownIcon className="w-6 h-6 text-purple-500" />, iconBg: 'bg-purple-100' },
        { 
            label: t.proposalsSentThisMonth,
            value: (user.plan === 'free' && user.proposalLimit !== -1)
                ? `${user.monthlyProposalsSent ?? 0} / ${user.proposalLimit}`
                : `${user.monthlyProposalsSent ?? 0} / ${t.unlimited}`,
            icon: <PaperAirplaneIcon className="w-6 h-6 text-orange-500" />, 
            iconBg: 'bg-orange-100' 
        },
    ];
    
    const dashboardStats = isInfluencer ? influencerStats : companyStats;
    const gridColsClass = isInfluencer ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

    return (
        <>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{t.welcomeBack(displayName)}</h2>
            <p className="text-slate-500 mb-8">{t.activitySnapshot}</p>
            
            <div className={`grid grid-cols-1 md:grid-cols-2 ${gridColsClass} gap-6`}>
                {dashboardStats.map((stat, index) => (
                    <StatCard 
                        key={index} 
                        label={stat.label} 
                        value={statsError && ![t.proposalsSentThisMonth, t.requestsSentThisMonth].includes(stat.label) ? '--' : (stat.value ?? 0)} 
                        icon={stat.icon}
                        iconBg={stat.iconBg}
                        isLoading={isLoading && ![t.proposalsSentThisMonth, t.requestsSentThisMonth].includes(stat.label)}
                    />
                ))}
            </div>

            {announcements.length > 0 && (
                <div className="mt-8">
                     <h3 className="text-2xl font-bold text-slate-800 mb-4">{t.announcements}</h3>
                    <div className="space-y-4">
                        {announcements.map(ann => (
                            <div key={ann.id} className="bg-white p-6 rounded-xl shadow-md animate-fade-in">
                                <div className="flex items-center mb-3">
                                    <div className="p-2 bg-indigo-100 rounded-full mr-4">
                                        <MegaphoneIcon className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-800">{ann.title}</h4>
                                        <p className="text-xs text-slate-400">{ann.createdAt?.toDate().toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                            </div>
                        ))}
                    </div>
                    {totalAnnouncements > 3 && (
                        <div className="mt-6 text-center">
                            <button 
                                onClick={() => setIsAllAnnouncementsModalOpen(true)}
                                className="py-2 px-6 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                {t.seeMore}
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            <AllAnnouncementsModal
                isOpen={isAllAnnouncementsModalOpen}
                onClose={() => setIsAllAnnouncementsModalOpen(false)}
                language={language}
                userType={user.type}
            />
        </>
    );
};

export default Dashboard;
