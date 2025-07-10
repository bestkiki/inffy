
import React, { useState, useCallback, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth, db } from './firebase';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';
import { User, Language, MainContent, UserType } from './types';
import { translations } from './translations';
import PendingApprovalPage from './components/PendingApprovalPage';
import RejectedPage from './components/RejectedPage';
import CompleteProfilePage from './components/CompleteProfilePage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import DormantAccountPage from './components/DormantAccountPage';
import DeletionRequestedPage from './components/DeletionRequestedPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import AboutUsPage from './components/AboutUsPage';
import ContactUsModal from './components/ContactUsModal';

type Page = 'landing' | 'login' | 'dashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [mainContent, setMainContent] = useState<MainContent>('dashboard');
  const [language, setLanguage] = useState<Language>('ko');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [viewingProductId, setViewingProductId] = useState<string | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showAboutUsPage, setShowAboutUsPage] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: firebase.User | null) => {
      try {
        if (firebaseUser) {
          const userDocRef = db.collection('users').doc(firebaseUser.uid);
          const userDocSnap = await userDocRef.get();

          if (userDocSnap.exists) {
            const userData = userDocSnap.data() as User;

            if (userData.status !== 'dormant' && userData.status !== 'deletion_requested') {
                userDocRef.update({ lastLogin: firebase.firestore.FieldValue.serverTimestamp() }).catch(e => console.error("Failed to update last login", e));
            }
            
            // Check for plan expiration for all paying users
            if ((userData.plan === 'pro' || userData.plan === 'enterprise') && userData.planExpiryDate) {
              const now = firebase.firestore.Timestamp.now();
              if (userData.planExpiryDate < now) {
                  console.log(`User ${firebaseUser.uid}'s plan has expired. Downgrading to free.`);
                  await userDocRef.update({
                      plan: 'free',
                      planExpiryDate: firebase.firestore.FieldValue.delete(),
                      // Reset to default free limit if applicable
                      ...(userData.type === UserType.COMPANY && { followerSearchLimit: 10000 })
                  });
                  // Update local userData object to reflect the change immediately
                  userData.plan = 'free';
                  delete userData.planExpiryDate;
                  if (userData.type === UserType.COMPANY) {
                    userData.followerSearchLimit = 10000;
                  }
              }
            }

            if (userData) {
              const displayName = userData.influencerName || userData.companyName || userData.name || 'User';
              const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=c4b5fd&color=4c1d95&bold=true`;
              
              const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
              const usageDocRef = db.collection('users').doc(firebaseUser.uid).collection('usage').doc(yearMonth);

              if (userData.type === UserType.COMPANY) {
                  let proposalLimit = -1; // -1 for unlimited
                  if (userData.plan === 'free') {
                      try {
                          const planSettings = await db.collection('settings').doc('companyPlan').get();
                          proposalLimit = planSettings.exists ? (planSettings.data()?.proposalLimit ?? 10) : 10;
                      } catch (settingsError) {
                          console.warn("Could not fetch company plan settings due to permissions. Using default value.", settingsError);
                          proposalLimit = 10;
                      }
                  }
                  userData.proposalLimit = proposalLimit;

                  try {
                    const usageDoc = await usageDocRef.get();
                    userData.monthlyProposalsSent = usageDoc.exists ? (usageDoc.data()?.proposalCount || 0) : 0;
                  } catch (usageError) {
                      console.warn("Could not fetch company usage data due to permissions. Defaulting to 0.", usageError);
                      userData.monthlyProposalsSent = 0;
                  }
              } else if (userData.type === UserType.INFLUENCER) {
                  let requestLimit = -1;
                  if (userData.plan === 'free') {
                      try {
                          const planSettings = await db.collection('settings').doc('influencerPlan').get();
                          requestLimit = planSettings.exists ? (planSettings.data()?.requestLimit ?? 10) : 10;
                      } catch (settingsError) {
                          console.warn("Could not fetch influencer plan settings due to permissions. Using default value.", settingsError);
                          requestLimit = 10;
                      }
                  }
                  userData.requestLimit = requestLimit;

                  try {
                    const usageDoc = await usageDocRef.get();
                    userData.monthlyRequestsSent = usageDoc.exists ? (usageDoc.data()?.requestCount || 0) : 0;
                  } catch (usageError) {
                      console.warn("Could not fetch influencer usage data due to permissions. Defaulting to 0.", usageError);
                      userData.monthlyRequestsSent = 0;
                  }
              }

              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                name: userData.name || '',
                type: userData.type,
                avatarUrl: userData.avatarUrl || defaultAvatar,
                companyName: userData.companyName || '',
                businessRegistrationNumber: userData.businessRegistrationNumber || '',
                influencerName: userData.influencerName || '',
                followerCount: userData.followerCount || 0,
                bio: userData.bio || '',
                instagramUrl: userData.instagramUrl || '',
                youtubeUrl: userData.youtubeUrl || '',
                tiktokUrl: userData.tiktokUrl || '',
                categories: userData.categories || [],
                companyDescription: userData.companyDescription || '',
                websiteUrl: userData.websiteUrl || '',
                phone: userData.phone || '',
                kakaoId: userData.kakaoId || '',
                role: userData.role || 'user',
                status: userData.status || 'profile_pending',
                deletionRequestDate: userData.deletionRequestDate || null,
                plan: userData.plan || 'free',
                followerSearchLimit: userData.followerSearchLimit ?? 10000,
                planExpiryDate: userData.planExpiryDate,
                proposalLimit: userData.proposalLimit,
                monthlyProposalsSent: userData.monthlyProposalsSent,
                requestLimit: userData.requestLimit,
                monthlyRequestsSent: userData.monthlyRequestsSent,
              });
              setCurrentPage('dashboard');
            } else {
               console.error("User data is missing in Firestore document.");
               await auth.signOut();
               setUser(null);
            }
          } else {
            console.log("User document not found in Firestore. Likely a new sign-up.");
          }
        } else {
          setUser(null);
          if (currentPage === 'dashboard') {
              setCurrentPage('landing');
          }
        }
      } catch (error) {
        console.error("An error occurred during authentication state change:", error);
        setUser(null);
        setCurrentPage('landing');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentPage]);
  
  const handleUserUpdate = useCallback((updatedData: Partial<User>) => {
      setUser(prevUser => prevUser ? { ...prevUser, ...updatedData } : null);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
        await auth.signOut();
        setMainContent('dashboard'); 
        setViewingProfileId(null);
        setViewingProductId(null);
    } catch(error) {
        console.error("Error signing out: ", error);
    }
  }, []);

  const handleReactivate = useCallback(async () => {
    if (!user) return;
    try {
        const userDocRef = db.collection('users').doc(user.uid);
        const updatedDataForFirestore = {
            status: 'active' as const,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };
        await userDocRef.update(updatedDataForFirestore);
        
        const updatedDataForState: Partial<User> = {
            status: 'active' as const,
            lastLogin: firebase.firestore.Timestamp.now()
        };
        handleUserUpdate(updatedDataForState);
    } catch (error) {
        console.error("Error reactivating account:", error);
        alert("계정을 활성화하는 중 오류가 발생했습니다.");
    }
  }, [user, handleUserUpdate]);
  
  const handleCancelDeletion = useCallback(async () => {
    if (!user) return;
    try {
        const userDocRef = db.collection('users').doc(user.uid);
        await userDocRef.update({
            status: 'active',
            deletionRequestDate: firebase.firestore.FieldValue.delete(),
        });
        handleUserUpdate({ status: 'active', deletionRequestDate: null });
    } catch (error) {
        console.error("Error cancelling deletion:", error);
        alert("탈퇴 신청을 취소하는 중 오류가 발생했습니다.");
    }
  }, [user, handleUserUpdate]);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);
  
  const handleViewProfile = (profileId: string) => {
    setViewingProfileId(profileId);
    setMainContent('public-profile');
  };

  const handleBackToList = () => {
    setViewingProfileId(null);
    setMainContent('find-influencers');
  }
  
  const handleViewProduct = (productId: string) => {
    setViewingProductId(productId);
    setMainContent('product-market');
  };

  const handleBackToMarket = () => {
    setViewingProductId(null);
    setMainContent('product-market');
  };

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  if (showTermsOfService) {
    return <TermsOfServicePage onBack={() => setShowTermsOfService(false)} language={language} />;
  }

  if (showAboutUsPage) {
    return <AboutUsPage onBack={() => setShowAboutUsPage(false)} language={language} />;
  }

  if (showPrivacyPolicy) {
    return <PrivacyPolicyPage onBack={() => setShowPrivacyPolicy(false)} language={language} />;
  }

  const renderContent = () => {
    if (user) {
        if (user.role === 'admin') {
          return <MainPage 
              user={user} 
              onLogout={handleLogout} 
              language={language} 
              onLanguageChange={handleLanguageChange}
              mainContent={mainContent}
              setMainContent={setMainContent}
              onUserUpdate={handleUserUpdate}
              onViewProfile={handleViewProfile}
              viewingProfileId={viewingProfileId}
              setViewingProfileId={setViewingProfileId}
              onBackToList={handleBackToList}
              viewingProductId={viewingProductId}
              setViewingProductId={setViewingProductId}
              onViewProduct={handleViewProduct}
              onBackToMarket={handleBackToMarket}
              onNavigateToPrivacy={() => setShowPrivacyPolicy(true)}
              onNavigateToContact={() => setShowContactModal(true)}
          />;
        }

        switch (user.status) {
            case 'profile_pending':
                return <CompleteProfilePage user={user} language={language} onProfileComplete={handleUserUpdate} />;
            case 'suspended':
                return (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
                        <h1 className="text-3xl font-bold text-red-600 mb-4">{translations[language].accountSuspendedTitle}</h1>
                        <p className="text-slate-700 mb-8">{translations[language].accountSuspendedMessage}</p>
                        <button onClick={handleLogout} className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-6 rounded-lg transition-colors">
                            {translations[language].logout}
                        </button>
                    </div>
                );
            case 'dormant':
                return <DormantAccountPage user={user} language={language} onReactivate={handleReactivate} onLogout={handleLogout} />;
            case 'deletion_requested':
                return <DeletionRequestedPage user={user} language={language} onCancelDeletion={handleCancelDeletion} onLogout={handleLogout} />;
            case 'pending':
                return <PendingApprovalPage language={language} onLogout={handleLogout} />;
            case 'rejected':
                return <RejectedPage language={language} onLogout={handleLogout} />;
            case 'active':
            default:
                return <MainPage 
                    user={user} 
                    onLogout={handleLogout} 
                    language={language} 
                    onLanguageChange={handleLanguageChange}
                    mainContent={mainContent}
                    setMainContent={setMainContent}
                    onUserUpdate={handleUserUpdate}
                    onViewProfile={handleViewProfile}
                    viewingProfileId={viewingProfileId}
                    setViewingProfileId={setViewingProfileId}
                    onBackToList={handleBackToList}
                    viewingProductId={viewingProductId}
                    setViewingProductId={setViewingProductId}
                    onViewProduct={handleViewProduct}
                    onBackToMarket={handleBackToMarket}
                    onNavigateToPrivacy={() => setShowPrivacyPolicy(true)}
                    onNavigateToContact={() => setShowContactModal(true)}
                />;
        }
    }
    
    switch (currentPage) {
      case 'login':
        return <LoginPage language={language} onLanguageChange={handleLanguageChange} onNavigateToLanding={() => navigateTo('landing')} />;
      case 'landing':
      default:
        return <LandingPage onNavigateToLogin={() => navigateTo('login')} language={language} onLanguageChange={handleLanguageChange} onNavigateToPrivacy={() => setShowPrivacyPolicy(true)} onNavigateToTerms={() => setShowTermsOfService(true)} onNavigateToAboutUs={() => setShowAboutUsPage(true)} onNavigateToContact={() => setShowContactModal(true)} />;
    }
  }

  return (
    <div className="min-h-screen antialiased">
      {renderContent()}
       {showContactModal && (
          <ContactUsModal
            isOpen={showContactModal}
            onClose={() => setShowContactModal(false)}
            language={language}
            currentUser={user}
          />
        )}
    </div>
  );
};

export default App;
