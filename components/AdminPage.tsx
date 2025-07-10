





import React, { useState, useEffect, useMemo } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { User, Language, UserType, Product, NotificationType, UpgradeRequest, UpgradeRequestStatus, Announcement } from '../types';
import { translations } from '../translations';
import { SearchIcon } from './icons/SearchIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import UserDetailsModal from './UserDetailsModal';
import { CubeIcon } from './icons/CubeIcon';
import { EyeIcon } from './icons/EyeIcon';
import ProductDetailsModal from './ProductDetailsModal';
import { createNotification } from '../lib/notifications';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { CogIcon } from './icons/CogIcon';
import { ArrowUpCircleIcon } from './icons/ArrowUpCircleIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ChatBubbleLeftEllipsisIcon } from './icons/ChatBubbleLeftEllipsisIcon';
import InquiryManagement from './InquiryManagement';


interface AdminPageProps {
  user: User;
  language: Language;
  onNavigateToPrivacy: () => void;
}

type UserStatusFilter = 'pending' | 'active' | 'suspended' | 'rejected' | 'profile_pending' | 'dormant' | 'deletion_requested';
type ProductStatusFilter = 'pending' | 'active' | 'rejected';
type MainTab = 'users' | 'products' | 'planSettings' | 'upgradeRequests' | 'announcements' | 'dormancy' | 'inquiries';

const PlanSettings: React.FC<{language: Language; t: any; setNotification: any}> = ({ language, t, setNotification }) => {
    const [companyPlan, setCompanyPlan] = useState({ price: '', accountInfo: '', proposalLimit: '' });
    const [influencerPlan, setInfluencerPlan] = useState({ price: '', accountInfo: '', requestLimit: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const companyPlanDoc = await db.collection('settings').doc('companyPlan').get();
                if (companyPlanDoc.exists) {
                    const data = companyPlanDoc.data()!;
                    setCompanyPlan({
                        price: data.price ?? '',
                        accountInfo: data.accountInfo ?? '',
                        proposalLimit: data.proposalLimit ?? ''
                    });
                }
                
                const influencerPlanDoc = await db.collection('settings').doc('influencerPlan').get();
                if (influencerPlanDoc.exists) {
                    const data = influencerPlanDoc.data()!;
                    setInfluencerPlan({
                        price: data.price ?? '',
                        accountInfo: data.accountInfo ?? '',
                        requestLimit: data.requestLimit ?? ''
                    });
                }

            } catch (error) {
                console.error("Error fetching plan settings:", error);
                 setNotification({ type: 'error', message: 'Failed to load settings.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [setNotification]);
    
    const handleCompanyChange = (field: keyof typeof companyPlan, value: string) => {
        setCompanyPlan(prev => ({ ...prev, [field]: value }));
    };

    const handleInfluencerChange = (field: keyof typeof influencerPlan, value: string) => {
        setInfluencerPlan(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await db.collection('settings').doc('companyPlan').set({
                price: Number(companyPlan.price) || 0,
                accountInfo: companyPlan.accountInfo,
                proposalLimit: Number(companyPlan.proposalLimit) || 0,
            }, { merge: true });
            
            await db.collection('settings').doc('influencerPlan').set({
                price: Number(influencerPlan.price) || 0,
                accountInfo: influencerPlan.accountInfo,
                requestLimit: Number(influencerPlan.requestLimit) || 0,
            }, { merge: true });

            setNotification({ type: 'success', message: t.settingsUpdatedSuccess });
        } catch (error) {
            console.error("Error saving plan settings:", error);
            setNotification({ type: 'error', message: t.settingsUpdateError });
        } finally {
            setIsSaving(false);
            setTimeout(() => setNotification(null), 4000);
        }
    };
    
    if (isLoading) {
        return <div className="p-8 text-center">Loading settings...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Plan Settings */}
                <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                    <h3 className="text-xl font-bold text-slate-800">{t.companyPlanSettingsTitle}</h3>
                    <div>
                        <label htmlFor="companyPrice" className="block text-sm font-medium text-slate-700 mb-1">{t.proPlanPriceLabel}</label>
                        <input id="companyPrice" type="number" value={companyPlan.price} onChange={(e) => handleCompanyChange('price', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg"/>
                    </div>
                    <div>
                        <label htmlFor="companyAccountInfo" className="block text-sm font-medium text-slate-700 mb-1">{t.proPlanAccountInfoLabel}</label>
                        <textarea id="companyAccountInfo" rows={3} value={companyPlan.accountInfo} onChange={(e) => handleCompanyChange('accountInfo', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg"/>
                    </div>
                    <div>
                        <label htmlFor="proposalLimit" className="block text-sm font-medium text-slate-700 mb-1">{t.monthlyProposalLimitLabel}</label>
                        <input id="proposalLimit" type="number" value={companyPlan.proposalLimit} onChange={(e) => handleCompanyChange('proposalLimit', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg"/>
                    </div>
                </div>

                {/* Influencer Plan Settings */}
                <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                    <h3 className="text-xl font-bold text-slate-800">{t.influencerPlanSettingsTitle}</h3>
                    <div>
                        <label htmlFor="influencerPrice" className="block text-sm font-medium text-slate-700 mb-1">{t.proPlanPriceLabel}</label>
                        <input id="influencerPrice" type="number" value={influencerPlan.price} onChange={(e) => handleInfluencerChange('price', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg"/>
                    </div>
                    <div>
                        <label htmlFor="influencerAccountInfo" className="block text-sm font-medium text-slate-700 mb-1">{t.proPlanAccountInfoLabel}</label>
                        <textarea id="influencerAccountInfo" rows={3} value={influencerPlan.accountInfo} onChange={(e) => handleInfluencerChange('accountInfo', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg"/>
                    </div>
                    <div>
                        <label htmlFor="requestLimit" className="block text-sm font-medium text-slate-700 mb-1">{t.influencerMonthlyRequestLimitLabel}</label>
                        <input id="requestLimit" type="number" value={influencerPlan.requestLimit} onChange={(e) => handleInfluencerChange('requestLimit', e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg"/>
                    </div>
                </div>
            </div>
            <div className="pt-4 border-t">
                 <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:bg-slate-400">
                    {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t.saveSettings}
                </button>
            </div>
        </div>
    );
};

const AnnouncementManager: React.FC<{ targetType: UserType; t: any; setNotification: any; }> = ({ targetType, t, setNotification }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = db.collection('announcements')
      .where('targetUserType', '==', targetType)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
        setAnnouncements(data);
        setIsLoading(false);
      }, err => {
        console.error("Error fetching announcements:", err);
        setNotification({ type: 'error', message: "공지 목록을 불러오는데 실패했습니다." });
        setIsLoading(false);
      });

    return () => unsubscribe();
  }, [targetType, setNotification]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
  };

  const handleEditClick = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setContent(announcement.content);
    window.scrollTo(0, 0); // Scroll to top to see the form
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm(t.confirmDeleteAnnouncement)) {
      try {
        await db.collection('announcements').doc(id).delete();
        setNotification({ type: 'success', message: t.announcementDeletedSuccess });
      } catch (error) {
        console.error("Error deleting announcement:", error);
        setNotification({ type: 'error', message: t.announcementDeleteError });
      }
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setNotification({ type: 'error', message: '제목과 내용을 모두 입력해주세요.' });
      setTimeout(() => setNotification(null), 4000);
      return;
    }
    setIsSaving(true);

    try {
      if (editingId) {
        // Update
        await db.collection('announcements').doc(editingId).update({ title, content });
        setNotification({ type: 'success', message: t.announcementUpdatedSuccess });
      } else {
        // Create
        await db.collection('announcements').add({
          title,
          content,
          targetUserType: targetType,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        setNotification({ type: 'success', message: t.announcementSavedSuccess });
      }
      resetForm();
    } catch (error) {
      console.error(`Error saving ${targetType} announcement:`, error);
      setNotification({ type: 'error', message: t.announcementSaveError });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const titleText = targetType === UserType.COMPANY ? t.companyAnnouncements : t.influencerAnnouncements;

  return (
    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
      <h3 className="text-xl font-bold text-slate-800">{editingId ? t.editAnnouncement : titleText}</h3>
      <div>
        <label htmlFor={`title-${targetType}`} className="block text-sm font-medium text-slate-700 mb-1">{t.announcementTitleLabel}</label>
        <input id={`title-${targetType}`} type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg"/>
      </div>
      <div>
        <label htmlFor={`content-${targetType}`} className="block text-sm font-medium text-slate-700 mb-1">{t.announcementContentLabel}</label>
        <textarea id={`content-${targetType}`} rows={5} value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg"/>
      </div>
      <div className="pt-2 flex justify-end gap-2">
        {editingId && (
          <button onClick={resetForm} className="py-2 px-4 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
            {t.cancel}
          </button>
        )}
        <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:bg-slate-400">
          {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : (editingId ? t.update : t.saveAnnouncement)}
        </button>
      </div>

      <div className="pt-4 border-t mt-4">
        <h4 className="font-semibold text-slate-600 mb-2">등록된 공지 목록</h4>
        {isLoading ? <p>Loading...</p> : announcements.length === 0 ? <p className="text-slate-500 text-sm">등록된 공지가 없습니다.</p> : (
          <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {announcements.map(ann => (
              <li key={ann.id} className="bg-white p-3 rounded-lg border flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-800">{ann.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{ann.createdAt?.toDate().toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                   <button onClick={() => handleEditClick(ann)} className="p-2 text-slate-500 hover:text-blue-600" title={t.edit}><PencilIcon className="w-4 h-4"/></button>
                   <button onClick={() => handleDeleteClick(ann.id)} className="p-2 text-slate-500 hover:text-red-600" title={t.delete}><TrashIcon className="w-4 h-4"/></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};


const AdminPage: React.FC<AdminPageProps> = ({ user, language, onNavigateToPrivacy }) => {
  const t = translations[language];
  
  // Common state
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>('users');

  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatusFilter>('pending');
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Product management state
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState<ProductStatusFilter>('pending');
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Upgrade requests state
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const usersSnapshot = await db.collection('users').get();
        const usersData = usersSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id })) as User[];
        setUsers(usersData);
        
        const productsSnapshot = await db.collection('products').get();
        const productsData = productsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Product[];
        setProducts(productsData);

        const upgradeRequestsSnapshot = await db.collection('upgradeRequests')
          .where('status', '==', UpgradeRequestStatus.PENDING)
          .orderBy('createdAt', 'desc')
          .get();
        const requestsData = upgradeRequestsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as UpgradeRequest[];
        setUpgradeRequests(requestsData);

      } catch (error) {
        console.error("Error fetching admin data:", error);
        setNotification({ type: 'error', message: 'Failed to load data. Check console and security rules.' });
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);
  
  // --- User Management ---
  const handleViewUserDetails = (userToView: User) => {
    setViewingUser(userToView);
    setIsUserDetailsModalOpen(true);
  };
  
  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.uid === updatedUser.uid ? updatedUser : u));
    setIsUserDetailsModalOpen(false);
    setNotification({ type: 'success', message: t.planUpdatedSuccess });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateUserStatus = async (targetUser: User, newStatus: NonNullable<User['status']>) => {
    if (targetUser.uid === user.uid) {
        alert("You cannot change your own status.");
        return;
    }
    
    try {
        await db.collection('users').doc(targetUser.uid).update({ status: newStatus });
        setUsers(prevUsers => prevUsers.map(u => u.uid === targetUser.uid ? { ...u, status: newStatus } : u));
        let message = t.userStatusUpdatedSuccess;
        if (newStatus === 'active') message = t.userApprovedSuccess;
        if (newStatus === 'rejected') message = t.userRejectedSuccess;
        if (newStatus === 'dormant') message = '사용자를 휴면 처리했습니다.';
        setNotification({ type: 'success', message });
    } catch (error) {
        console.error("Error updating user status:", error);
        setNotification({ type: 'error', message: t.userStatusUpdateError });
    }
    setTimeout(() => setNotification(null), 4000);
  };
  
  const handlePermanentDeleteUser = async (userId: string) => {
    if (!window.confirm(t.confirmPermanentDelete)) {
      return;
    }
    try {
      // Note: This only deletes the Firestore document.
      // In a production app, you'd also need a Cloud Function to delete the Firebase Auth user.
      await db.collection('users').doc(userId).delete();
      setUsers(prevUsers => prevUsers.filter(u => u.uid !== userId));
      setNotification({ type: 'success', message: t.userPermanentlyDeletedSuccess });
    } catch (error) {
      console.error("Error permanently deleting user:", error);
      setNotification({ type: 'error', message: t.userPermanentDeleteError });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(u => (u.status || 'profile_pending') === userStatusFilter)
      .filter(u => {
        const term = userSearchTerm.toLowerCase();
        if (!term) return true;
        const name = u.influencerName || u.companyName || u.name || '';
        return u.email.toLowerCase().includes(term) || name.toLowerCase().includes(term);
    });
  }, [users, userSearchTerm, userStatusFilter]);

  // --- Product Management ---
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.status === productStatusFilter)
      .filter(p => {
        const term = productSearchTerm.toLowerCase();
        if (!term) return true;
        return p.productName.toLowerCase().includes(term) || p.brandName.toLowerCase().includes(term);
      });
  }, [products, productSearchTerm, productStatusFilter]);

  const handleViewProductDetails = (productToView: Product) => {
      setViewingProduct(productToView);
      setIsProductDetailsModalOpen(true);
  }

  const handleUpdateProductStatus = async (product: Product, newStatus: 'active' | 'rejected' | 'pending') => {
      try {
          await db.collection('products').doc(product.id).update({ status: newStatus });
          setProducts(prev => prev.map(p => p.id === product.id ? {...p, status: newStatus} : p));

          let message = t.productStatusUpdatedSuccess;
          let notificationType: NotificationType | null = null;

          if (newStatus === 'active') {
            message = t.productApprovedSuccess;
            notificationType = NotificationType.PRODUCT_APPROVED;
          } else if (newStatus === 'rejected') {
            message = t.productRejectedSuccess;
            notificationType = NotificationType.PRODUCT_REJECTED;
          } else if (newStatus === 'pending') {
            message = t.productRestoredForReviewSuccess;
            notificationType = NotificationType.PRODUCT_RESTORED_FOR_REVIEW;
          }
          
          setNotification({ type: 'success', message });

          if (notificationType) {
            await createNotification(
                product.brandId,
                notificationType,
                "Inffy Admin", // From Admin
                '', // No avatar for admin for now
                'my-products',
                product.id
            );
          }
      } catch (error) {
          console.error("Error updating product status:", error);
          setNotification({ type: 'error', message: t.productStatusUpdateError });
      }
       setTimeout(() => setNotification(null), 4000);
  };
  
  // --- Upgrade Requests ---
  const handleMarkRequestCompleted = async (requestId: string) => {
    try {
        await db.collection('upgradeRequests').doc(requestId).update({ status: UpgradeRequestStatus.COMPLETED });
        setUpgradeRequests(prev => prev.filter(req => req.id !== requestId));
        setNotification({ type: 'success', message: t.upgradeRequestCompletedSuccess });
    } catch(err) {
        console.error("Error marking request as complete:", err);
        setNotification({ type: 'error', message: t.upgradeRequestCompleteError });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // --- Render helpers ---
  const getUserStatusChip = (status: User['status']) => {
    const s = status || 'profile_pending';
    let statusText: string;
    switch(s) {
        case 'profile_pending': statusText = t.completeProfileTitle; break;
        case 'pending': statusText = t.admin_status_pending; break;
        case 'rejected': statusText = t.admin_status_rejected; break;
        case 'active': statusText = t.status_active; break;
        case 'suspended': statusText = t.status_suspended; break;
        case 'dormant': statusText = t.status_dormant; break;
        case 'deletion_requested': statusText = t.filter_deletion_requested; break;
        default: statusText = s;
    }
    let colorClasses = 'text-slate-800 bg-slate-100';
    if (s === 'active') colorClasses = 'text-green-800 bg-green-100';
    if (s === 'suspended' || s === 'rejected' || s === 'deletion_requested') colorClasses = 'text-red-800 bg-red-100';
    if (s === 'pending' || s === 'profile_pending') colorClasses = 'text-yellow-800 bg-yellow-100';
    if (s === 'dormant') colorClasses = 'text-gray-800 bg-gray-200';
    return <span className={`px-3 py-1 text-xs font-medium rounded-full ${colorClasses}`}>{statusText}</span>;
  };

  const getProductStatusChip = (status: Product['status']) => {
      const statusText = t[`product_status_${status}`] || status;
      let colorClasses = 'text-slate-800 bg-slate-100';
      if (status === 'active') colorClasses = 'text-green-800 bg-green-100';
      if (status === 'rejected') colorClasses = 'text-red-800 bg-red-100';
      if (status === 'pending') colorClasses = 'text-yellow-800 bg-yellow-100';
      if (status === 'archived') colorClasses = 'text-gray-800 bg-gray-100';
      return <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${colorClasses}`}>{statusText}</span>;
  }
  
  const formatDate = (timestamp: firebase.firestore.Timestamp) => {
      if (!timestamp?.toDate) return 'N/A';
      return timestamp.toDate().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US');
  };

  const renderUserManagement = () => (
    <>
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:max-w-md">
            <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2" />
            <input type="text" placeholder={t.searchByUser} value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} className="w-full bg-slate-100 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
        </div>
        <div className="flex border-b border-slate-200 md:border-none w-full md:w-auto overflow-x-auto">
          {(['pending', 'active', 'suspended', 'rejected', 'dormant', 'deletion_requested'] as UserStatusFilter[]).map(tab => (
            <button key={tab} onClick={() => setUserStatusFilter(tab)} className={`px-4 py-3 font-semibold text-sm transition-colors whitespace-nowrap ${userStatusFilter === tab ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'}`}>
              {t[`filter_${tab}`]}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
         {filteredUsers.length === 0 ? (
          <div className="text-center py-20"><ShieldCheckIcon className="w-16 h-16 mx-auto text-slate-300" /><h3 className="mt-4 text-2xl font-bold text-slate-800">{t.noUsersFound}</h3><p className="mt-1 text-slate-500">{userStatusFilter === 'pending' ? '모든 사용자가 승인되었습니다.' : '이 필터와 일치하는 사용자가 없습니다.'}</p></div>
        ) : (
        <table className="w-full min-w-max text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr><th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.user}</th><th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.plan}</th><th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.status}</th><th className="p-4 text-sm font-semibold text-slate-600 tracking-wider text-center">{t.actions}</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(u => {
              const displayName = u.influencerName || u.companyName || u.name || 'N/A';
              const planName = u.plan ? t[`plan_${u.plan}`] : t.plan_free;
              return (
                <tr key={u.uid}>
                  <td className="p-4"><div className="flex items-center gap-3"><img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=c4b5fd&color=4c1d95`} alt={displayName} className="w-10 h-10 rounded-full object-cover bg-slate-100" /><div><p className="font-medium text-slate-800">{displayName}</p><p className="text-xs text-slate-500">{u.email}</p></div></div></td>
                  <td className="p-4 text-slate-600">{planName}</td><td className="p-4">{getUserStatusChip(u.status)}</td>
                  <td className="p-4 text-center"><div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleViewUserDetails(u)} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">{t.viewDetails}</button>
                    {u.status === 'pending' && (<><button onClick={() => handleUpdateUserStatus(u, 'active')} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors">{t.approveButton}</button><button onClick={() => handleUpdateUserStatus(u, 'rejected')} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">{t.admin_rejectButton}</button></>)}
                    {u.status === 'active' && u.uid !== user.uid && (<button onClick={() => handleUpdateUserStatus(u, 'suspended')} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors">{t.suspendAccount}</button>)}
                    {(u.status === 'suspended' || u.status === 'rejected' || u.status === 'dormant') && (<button onClick={() => handleUpdateUserStatus(u, 'active')} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors">{t.activateAccount}</button>)}
                    {u.status === 'deletion_requested' && (() => {
                        if (!u.deletionRequestDate) return null;
                        const deletionScheduledDate = new Date(u.deletionRequestDate.toDate());
                        deletionScheduledDate.setDate(deletionScheduledDate.getDate() + 30);
                        const now = new Date();

                        if (now > deletionScheduledDate) {
                            return (
                                <button
                                    onClick={() => handlePermanentDeleteUser(u.uid)}
                                    className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                                >
                                    {t.permanentDeleteButton}
                                </button>
                            );
                        } else {
                            return (
                                <span className="text-sm text-slate-500">
                                    {t.deletionScheduledOn}: {deletionScheduledDate.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}
                                </span>
                            );
                        }
                    })()}
                  </div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        )}
      </div>
    </>
  );
  
  const renderProductManagement = () => (
    <>
       <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:max-w-md">
            <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2" />
            <input type="text" placeholder={t.searchByProduct} value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} className="w-full bg-slate-100 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
        </div>
        <div className="flex border-b border-slate-200 md:border-none w-full md:w-auto overflow-x-auto">
          {(['pending', 'active', 'rejected'] as ProductStatusFilter[]).map(tab => (
            <button key={tab} onClick={() => setProductStatusFilter(tab)} className={`px-4 py-3 font-semibold text-sm transition-colors whitespace-nowrap ${productStatusFilter === tab ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'}`}>
              {t[`filter_product_${tab}`]}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
         {filteredProducts.length === 0 ? (
          <div className="text-center py-20"><CubeIcon className="w-16 h-16 mx-auto text-slate-300" /><h3 className="mt-4 text-2xl font-bold text-slate-800">{t.noProductsFound}</h3><p className="mt-1 text-slate-500">{t.noProductsInFilter}</p></div>
        ) : (
        <table className="w-full min-w-max text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr><th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.product}</th><th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.brand}</th><th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.status}</th><th className="p-4 text-sm font-semibold text-slate-600 tracking-wider text-center">{t.actions}</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td className="p-4"><div className="flex items-center gap-3"><img src={p.productImageUrl} alt={p.productName} className="w-10 h-10 rounded-lg object-cover bg-slate-100" /><div><span className="font-medium text-slate-800">{p.productName}</span><div className="text-xs text-slate-500">{p.category}</div></div></div></td>
                <td className="p-4 text-slate-600">{p.brandName}</td><td className="p-4">{getProductStatusChip(p.status)}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleViewProductDetails(p)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                      <EyeIcon className="w-4 h-4" />
                      <span>{t.viewDetails}</span>
                    </button>
                    {p.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateProductStatus(p, 'active')} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors">{t.approveButton}</button>
                        <button onClick={() => handleUpdateProductStatus(p, 'rejected')} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">{t.admin_rejectButton}</button>
                      </>
                    )}
                    {p.status === 'active' && (
                      <>
                        <button onClick={() => handleUpdateProductStatus(p, 'rejected')} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">{t.admin_rejectButton}</button>
                        <button onClick={() => handleUpdateProductStatus(p, 'pending')} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors">{t.requestChanges}</button>
                      </>
                    )}
                    {p.status === 'rejected' && (
                      <button onClick={() => handleUpdateProductStatus(p, 'pending')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                          <ArrowUturnLeftIcon className="w-4 h-4" />
                          <span>{t.restoreForReview}</span>
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
    </>
  );

  const renderDormancyManagement = () => {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const elevenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, now.getDate());

    const twelveMonthsAgoTimestamp = firebase.firestore.Timestamp.fromDate(twelveMonthsAgo);
    const elevenMonthsAgoTimestamp = firebase.firestore.Timestamp.fromDate(elevenMonthsAgo);

    const activeUsers = users.filter(u => u.status === 'active' && u.lastLogin && u.role !== 'admin');
    
    const approachingDormancyUsers = activeUsers.filter(u => 
        u.lastLogin! < elevenMonthsAgoTimestamp && u.lastLogin! >= twelveMonthsAgoTimestamp
    );
    
    const eligibleForDormancyUsers = activeUsers.filter(u => u.lastLogin! < twelveMonthsAgoTimestamp);

    return (
        <div className="p-6 space-y-8">
            {/* Approaching Dormancy */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{t.approachingDormancyTitle}</h3>
                {approachingDormancyUsers.length === 0 ? (
                    <p className="text-slate-500">{t.noApproachingDormancy}</p>
                ) : (
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full min-w-max text-left">
                          <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                  <th className="p-4 text-sm font-semibold text-slate-600">{t.user}</th>
                                  <th className="p-4 text-sm font-semibold text-slate-600">{t.lastLoginDate}</th>
                                  <th className="p-4 text-sm font-semibold text-slate-600">{t.actions}</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {approachingDormancyUsers.map(u => (
                                  <tr key={u.uid}>
                                      <td className="p-4 font-medium text-slate-800">{u.name} ({u.email})</td>
                                      <td className="p-4 text-slate-600">{formatDate(u.lastLogin!)}</td>
                                      <td className="p-4 text-sm text-yellow-700 italic">{t.manualNotificationRequired}</td>
                                  </tr>
                              ))}
                          </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Eligible for Dormancy */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{t.eligibleForDormancyTitle}</h3>
                {eligibleForDormancyUsers.length === 0 ? (
                     <p className="text-slate-500">{t.noEligibleForDormancy}</p>
                ) : (
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full min-w-max text-left">
                           <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                  <th className="p-4 text-sm font-semibold text-slate-600">{t.user}</th>
                                  <th className="p-4 text-sm font-semibold text-slate-600">{t.lastLoginDate}</th>
                                  <th className="p-4 text-sm font-semibold text-slate-600 text-center">{t.actions}</th>
                              </tr>
                          </thead>
                           <tbody className="divide-y divide-slate-100">
                              {eligibleForDormancyUsers.map(u => (
                                  <tr key={u.uid}>
                                      <td className="p-4 font-medium text-slate-800">{u.name} ({u.email})</td>
                                      <td className="p-4 text-slate-600">{formatDate(u.lastLogin!)}</td>
                                      <td className="p-4 text-center">
                                          <button 
                                              onClick={() => handleUpdateUserStatus(u, 'dormant')}
                                              className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                                          >
                                              {t.setToDormant}
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                        </table>
                    </div>
                )}
            </div>
             <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                <p><strong>참고:</strong> 개인정보처리방침에 따라, 12개월 이상 미접속한 사용자는 휴면 계정으로 전환해야 합니다. '휴면 전환 예정' 목록의 사용자에게는 30일 전 안내 메일을 발송하고, '휴면 전환 대상' 목록의 사용자는 '휴면 처리' 버튼을 눌러 상태를 변경해주세요.</p>
            </div>
        </div>
    );
  };

  const renderUpgradeRequests = () => (
    <div className="overflow-x-auto">
        {upgradeRequests.length === 0 ? (
            <div className="text-center py-20">
                <ArrowUpCircleIcon className="w-16 h-16 mx-auto text-slate-300" />
                <h3 className="mt-4 text-2xl font-bold text-slate-800">{t.noUpgradeRequests}</h3>
            </div>
        ) : (
            <table className="w-full min-w-max text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.companyNameLabel}</th>
                        <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.depositorName}</th>
                        <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.requestDate}</th>
                        <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider text-center">{t.actions}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {upgradeRequests.map(req => (
                        <tr key={req.id}>
                            <td className="p-4 font-medium text-slate-800">{req.companyName}</td>
                            <td className="p-4 text-slate-600">{req.depositorName}</td>
                            <td className="p-4 text-slate-600">{formatDate(req.createdAt)}</td>
                            <td className="p-4 text-center">
                                <button
                                    onClick={() => handleMarkRequestCompleted(req.id)}
                                    className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                >
                                    {t.markAsCompleted}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
  );

  const renderAnnouncements = () => (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <AnnouncementManager targetType={UserType.COMPANY} t={t} setNotification={setNotification} />
      <AnnouncementManager targetType={UserType.INFLUENCER} t={t} setNotification={setNotification} />
    </div>
  );
  
  const renderInquiryManagement = () => (
    <InquiryManagement language={language} t={t} setNotification={setNotification} />
  );

  const mainTabsConfig = [
      { id: 'users', label: t.userManagementTitle, icon: <ShieldCheckIcon className="w-5 h-5 mr-2" /> },
      { id: 'products', label: t.productManagementTitle, icon: <CubeIcon className="w-5 h-5 mr-2" /> },
      { id: 'inquiries', label: t.inquiryManagementTitle, icon: <ChatBubbleLeftEllipsisIcon className="w-5 h-5 mr-2" /> },
      { id: 'dormancy', label: t.dormancyManagement, icon: <ClockIcon className="w-5 h-5 mr-2" />},
      { id: 'upgradeRequests', label: t.upgradeRequestsTitle, icon: <ArrowUpCircleIcon className="w-5 h-5 mr-2" /> },
      { id: 'planSettings', label: t.planSettings, icon: <CogIcon className="w-5 h-5 mr-2" /> },
      { id: 'announcements', label: t.announcementManagementTitle, icon: <PencilIcon className="w-5 h-5 mr-2" /> },
  ]

  return (
    <>
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">{t.adminPage}</h2>
        <div className="flex bg-slate-200 rounded-lg p-1 flex-wrap">
            {mainTabsConfig.map(tab => (
                 <button key={tab.id} onClick={() => setMainTab(tab.id as MainTab)} className={`flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mainTab === tab.id ? 'bg-white text-brand-primary shadow' : 'text-slate-600 hover:bg-white/50'}`}>
                     {tab.icon}
                     <span>{tab.label}</span>
                 </button>
            ))}
        </div>
      </header>

      {notification && (
        <div className={`p-4 rounded-lg flex items-center ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.type === 'success' ? <CheckIcon className="w-6 h-6 mr-3"/> : <XCircleIcon className="w-6 h-6 mr-3"/>}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-md">
        {isLoading ? (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary"></div>
            </div>
        ) : mainTab === 'users' ? renderUserManagement() 
          : mainTab === 'products' ? renderProductManagement()
          : mainTab === 'inquiries' ? renderInquiryManagement()
          : mainTab === 'planSettings' ? <PlanSettings language={language} t={t} setNotification={setNotification} />
          : mainTab === 'announcements' ? renderAnnouncements()
          : mainTab === 'dormancy' ? renderDormancyManagement()
          : renderUpgradeRequests()
        }
      </div>
    </div>
    
    {isUserDetailsModalOpen && viewingUser && (
      <UserDetailsModal 
        isOpen={isUserDetailsModalOpen} 
        onClose={() => setIsUserDetailsModalOpen(false)} 
        language={language} 
        user={viewingUser}
        onUserUpdate={handleUserUpdated}
      />
    )}
    {isProductDetailsModalOpen && viewingProduct && (
      <ProductDetailsModal isOpen={isProductDetailsModalOpen} onClose={() => setIsProductDetailsModalOpen(false)} language={language} product={viewingProduct} />
    )}
    </>
  );
};

export default AdminPage;