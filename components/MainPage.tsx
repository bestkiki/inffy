
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserType, Language, MainContent } from '../types';
import { translations } from '../translations';
import { HomeIcon } from './icons/HomeIcon';
import { CollectionIcon } from './icons/CollectionIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { SearchIcon } from './icons/SearchIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { BellIcon } from './icons/BellIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { CubeIcon } from './icons/CubeIcon';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon';
import ProfilePage from './ProfilePage';
import FindInfluencersPage from './FindInfluencersPage';
import PublicProfileView from './PublicProfileView';
import ReceivedProposalsPage from './ReceivedProposalsPage';
import MyCampaignsPage from './MyCampaignsPage';
import MyProductsPage from './MyProductsPage';
import ProductMarketplacePage from './ProductMarketplacePage';
import ProductDetailView from './ProductDetailView';
import { InboxArrowDownIcon } from './icons/InboxArrowDownIcon';
import ReceivedRequestsPage from './ReceivedRequestsPage';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import MyRequestsPage from './MyRequestsPage';
import Dashboard from './Dashboard';
import { db } from '../firebase';
import NotificationPanel from './NotificationPanel';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import AdminPage from './AdminPage';
import UpgradeModal from './UpgradeModal';
import { CalendarIcon } from './icons/CalendarIcon';
import SchedulePage from './SchedulePage';
import ErrorBoundary from './ErrorBoundary';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';


interface MainPageProps {
  user: User;
  onLogout: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  mainContent: MainContent;
  setMainContent: (content: MainContent) => void;
  onUserUpdate: (updatedData: Partial<User>) => void;
  onViewProfile: (profileId: string) => void;
  viewingProfileId: string | null;
  setViewingProfileId: (id: string | null) => void;
  onBackToList: () => void;
  viewingProductId: string | null;
  setViewingProductId: (id: string | null) => void;
  onViewProduct: (productId: string) => void;
  onBackToMarket: () => void;
  onNavigateToPrivacy: () => void;
  onNavigateToContact: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-4 py-3 text-lg rounded-lg transition-colors duration-200 text-left ${
      active
        ? 'bg-brand-primary text-white font-bold shadow-md'
        : 'text-slate-600 hover:bg-brand-light hover:text-brand-dark'
    }`}
  >
    {icon}
    <span className="ml-4">{label}</span>
  </button>
);

const UserProfileDropdown: React.FC<{ user: User; onLogout: () => void; t: any; onNavigate: (content: MainContent) => void; onNavigateToContact: () => void; }> = ({ user, onLogout, t, onNavigate, onNavigateToContact }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isInfluencer = user.type === UserType.INFLUENCER;
    const displayName = isInfluencer ? user.influencerName || user.name : user.companyName || user.name;

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
                <img src={user.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-brand-accent" />
                <span className="hidden md:inline text-slate-700 font-medium">{displayName}</span>
                <ChevronDownIcon className="w-5 h-5 text-slate-500" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 py-1" onMouseLeave={() => setIsOpen(false)}>
                    <button onClick={() => { onNavigate('profile'); setIsOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-brand-light">
                        <UserCircleIcon className="w-5 h-5 mr-3" />
                        {t.profile}
                    </button>
                     <button onClick={() => { onNavigateToContact(); setIsOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-brand-light">
                        <QuestionMarkCircleIcon className="w-5 h-5 mr-3" />
                        {t.footer_contact}
                    </button>
                    <button onClick={onLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-brand-light">
                         <LogoutIcon className="w-5 h-5 mr-3" />
                        {t.logout}
                    </button>
                </div>
            )}
        </div>
    );
};

const LanguageSwitcher: React.FC<{
    language: Language;
    onLanguageChange: (lang: Language) => void;
}> = ({ language, onLanguageChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectLanguage = (lang: Language) => {
        onLanguageChange(lang);
        setIsOpen(false);
    }

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative text-slate-500 hover:text-brand-primary">
                <GlobeIcon className="w-7 h-7" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-xl z-20 py-1" onMouseLeave={() => setIsOpen(false)}>
                    <button onClick={() => selectLanguage('ko')} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-brand-light">
                        한국어
                    </button>
                    <button onClick={() => selectLanguage('en')} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-brand-light">
                        English
                    </button>
                </div>
            )}
        </div>
    );
}

const MainPage: React.FC<MainPageProps> = ({ user, onLogout, language, onLanguageChange, mainContent, setMainContent, onUserUpdate, onViewProfile, viewingProfileId, setViewingProfileId, onBackToList, viewingProductId, setViewingProductId, onViewProduct, onBackToMarket, onNavigateToPrivacy, onNavigateToContact }) => {
  const isInfluencer = user.type === UserType.INFLUENCER;
  const isAdmin = user.role === 'admin';
  const t = translations[language];
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = db.collection('notifications')
      .where('userId', '==', user.uid)
      .where('isRead', '==', false)
      .onSnapshot(snapshot => {
        setUnreadCount(snapshot.size);
      });
    return () => unsubscribe();
  }, [user]);


  const influencerNav = [
    { icon: <HomeIcon className="w-6 h-6" />, label: t.dashboard, target: 'dashboard' },
    { icon: <ShoppingBagIcon className="w-6 h-6" />, label: t.productMarket, target: 'product-market' },
    { icon: <PaperAirplaneIcon className="w-6 h-6" />, label: t.sentRequests, target: 'sent-requests' },
    { icon: <CalendarIcon className="w-6 h-6" />, label: t.scheduleManagement, target: 'schedule' },
    { icon: <BellIcon className="w-6 h-6" />, label: t.proposals, target: 'proposals' },
    { icon: <UserCircleIcon className="w-6 h-6" />, label: t.myProfile, target: 'profile' },
  ];

  const companyNav = [
    { icon: <HomeIcon className="w-6 h-6" />, label: t.dashboard, target: 'dashboard' },
    { icon: <UserGroupIcon className="w-6 h-6" />, label: t.findInfluencers, target: 'find-influencers' },
    { icon: <CubeIcon className="w-6 h-6" />, label: t.myProducts, target: 'my-products' },
    { icon: <CalendarIcon className="w-6 h-6" />, label: t.scheduleManagement, target: 'schedule' },
    { icon: <InboxArrowDownIcon className="w-6 h-6" />, label: t.receivedRequests, target: 'collaboration-requests' },
    { icon: <CollectionIcon className="w-6 h-6" />, label: t.myCampaigns, target: 'campaigns' },
    { icon: <UserCircleIcon className="w-6 h-6" />, label: t.companyProfile, target: 'profile' },
  ];
  
  const adminNav = [
    { icon: <ShieldCheckIcon className="w-6 h-6" />, label: t.adminPage, target: 'admin' },
  ]

  const navigationItems = useMemo(() => {
    if (isAdmin) {
      return [...companyNav, ...adminNav];
    }
    return isInfluencer ? influencerNav : companyNav;
  }, [isAdmin, isInfluencer, t]);


  const handleNavClick = (target: MainContent) => {
    if (viewingProfileId) {
        setViewingProfileId(null);
    }
    if (viewingProductId) {
        setViewingProductId(null);
    }
    setMainContent(target);
  }
  
  const renderMainContent = () => {
    if (viewingProfileId) {
        return <PublicProfileView 
          userId={viewingProfileId} 
          language={language} 
          onBack={onBackToList} 
          currentUser={user}
          onUserUpdate={onUserUpdate}
        />;
    }
    if (viewingProductId) {
      return <ProductDetailView
        productId={viewingProductId}
        language={language}
        onBack={onBackToMarket}
        currentUser={user}
        onUserUpdate={onUserUpdate}
      />;
    }
    
    switch(mainContent) {
        case 'dashboard':
            return <Dashboard user={user} language={language} />;
        case 'profile':
            return <ProfilePage user={user} language={language} onUserUpdate={onUserUpdate} />;
        case 'find-influencers':
            return <FindInfluencersPage language={language} onViewProfile={onViewProfile} currentUser={user} />;
        case 'proposals':
            return <ReceivedProposalsPage user={user} language={language} />;
        case 'campaigns':
            return <MyCampaignsPage user={user} language={language} />;
        case 'my-products':
            return <MyProductsPage user={user} language={language} />;
        case 'product-market':
            return <ProductMarketplacePage language={language} onViewProduct={onViewProduct} />;
        case 'collaboration-requests':
             return <ReceivedRequestsPage user={user} language={language} onViewProfile={onViewProfile} />;
        case 'sent-requests':
            return <MyRequestsPage user={user} language={language} />;
        case 'schedule':
            return <SchedulePage user={user} language={language} />;
        case 'admin':
            return isAdmin ? <AdminPage user={user} language={language} onNavigateToPrivacy={onNavigateToPrivacy} /> : <Dashboard user={user} language={language} />;
        default:
            return <Dashboard user={user} language={language} />;
    }
  }

  return (
    <>
      <div className="flex h-screen bg-slate-100">
        <aside className="w-64 bg-white shadow-lg flex-shrink-0 flex flex-col">
          <div className="h-20 flex items-center justify-center border-b cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <h1 className="text-3xl font-extrabold text-brand-primary tracking-tighter">Inffy</h1>
          </div>
          <nav className="flex-grow p-4 space-y-2">
            {navigationItems.map(item => (
              <NavItem
                key={item.target}
                icon={item.icon}
                label={item.label}
                active={mainContent === item.target}
                onClick={() => handleNavClick(item.target as MainContent)}
              />
            ))}
          </nav>
          
          {!isAdmin && user.plan === 'free' && (
            <div className="border-t mt-auto p-4">
              <div className="bg-brand-light p-4 rounded-lg text-center">
                  <h4 className="font-bold text-brand-dark">{t.upgradeToPro}</h4>
                  <p className="text-sm text-slate-600 mt-1">
                      {isInfluencer ? t.influencerUpgradeDescription : t.upgradeDescription}
                  </p>
                  <button onClick={() => setIsUpgradeModalOpen(true)} className="mt-4 w-full bg-brand-primary text-white font-semibold py-2 rounded-lg hover:bg-brand-dark transition-colors">
                      {t.learnMore}
                  </button>
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
            <div className="relative w-full max-w-md">
              <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2" />
              <input type="text" placeholder={t.searchPlaceholder} className="w-full bg-slate-100 rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
            </div>
            <div className="relative flex items-center space-x-6">
                <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
                <div className="relative">
                    <button onClick={() => setIsNotificationPanelOpen(prev => !prev)} className="text-slate-500 hover:text-brand-primary">
                        <BellIcon className="w-7 h-7" />
                        {unreadCount > 0 && <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
                    </button>
                    {isNotificationPanelOpen && (
                        <NotificationPanel 
                            user={user} 
                            language={language} 
                            onClose={() => setIsNotificationPanelOpen(false)}
                            onNavigate={handleNavClick}
                        />
                    )}
                </div>
                <UserProfileDropdown user={user} onLogout={onLogout} t={t} onNavigate={setMainContent} onNavigateToContact={onNavigateToContact} />
            </div>
          </header>
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            <ErrorBoundary fallback={<div className="text-center"><ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-500" /><h2>Something went wrong.</h2></div>}>
              {renderMainContent()}
            </ErrorBoundary>
          </div>
        </main>
      </div>
      {isUpgradeModalOpen && (
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          language={language}
          currentUser={user}
        />
      )}
    </>
  );
};

export default MainPage;