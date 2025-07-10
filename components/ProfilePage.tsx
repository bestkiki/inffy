
import React, { useState, useEffect } from 'react';
import { User, UserType, Language } from '../types';
import { translations } from '../translations';
import { db, auth } from '../firebase';
import firebase from 'firebase/compat/app';
import { CATEGORIES } from './constants';
import { PencilIcon } from './icons/PencilIcon';
import DeleteAccountModal from './DeleteAccountModal';

interface ProfilePageProps {
  user: User;
  language: Language;
  onUserUpdate: (updatedData: Partial<User>) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, language, onUserUpdate }) => {
  const t = translations[language];
  const isInfluencer = user.type === UserType.INFLUENCER;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setFormData({ ...user });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumberInput = (e.target as HTMLInputElement).type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumberInput ? parseInt(value) || 0 : value }));
  };
  
  const handleCategoryChange = (category: string) => {
    const currentCategories = formData.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    setFormData(prev => ({ ...prev, categories: newCategories }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    const userDocRef = db.collection('users').doc(user.uid);
    
    const updatedData: Partial<User> = {
        name: formData.name,
        avatarUrl: formData.avatarUrl,
        phone: formData.phone,
    };

    if (isInfluencer) {
        Object.assign(updatedData, {
            influencerName: formData.influencerName,
            followerCount: formData.followerCount,
            bio: formData.bio,
            instagramUrl: formData.instagramUrl,
            youtubeUrl: formData.youtubeUrl,
            tiktokUrl: formData.tiktokUrl,
            categories: formData.categories,
            kakaoId: formData.kakaoId,
        });
    } else {
        Object.assign(updatedData, {
            companyName: formData.companyName,
            businessRegistrationNumber: formData.businessRegistrationNumber,
            companyDescription: formData.companyDescription,
            websiteUrl: formData.websiteUrl,
        });
    }

    // Filter out undefined values to avoid Firestore errors
    const cleanData = Object.entries(updatedData).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        (acc as any)[key] = value;
      }
      return acc;
    }, {} as Partial<User>);


    try {
      await userDocRef.update(cleanData);
      onUserUpdate(cleanData);
      setNotification(t.profileUpdated);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setNotification("Error updating profile.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };
  
  const handleCancel = () => {
      setFormData({...user});
      setIsEditing(false);
  }

  const handleRequestDeletion = async () => {
    setIsLoading(true);
    try {
        await db.collection('users').doc(user.uid).update({
            status: 'deletion_requested',
            deletionRequestDate: firebase.firestore.FieldValue.serverTimestamp(),
        });
        
        // Optimistic update of local state
        onUserUpdate({ 
            status: 'deletion_requested', 
            // Set a client-side timestamp for immediate UI update.
            // The server timestamp will be the source of truth.
            deletionRequestDate: firebase.firestore.Timestamp.now() 
        });

        setIsDeleteModalOpen(false);
        // App.tsx will handle redirecting to the DeletionRequestedPage
    } catch (error) {
        console.error("Error requesting account deletion:", error);
        alert('계정 탈퇴 신청 중 오류가 발생했습니다.');
    } finally {
        setIsLoading(false);
    }
  };

  const renderTextField = (label: string, value: string | undefined | string[] | number, customClass: string = "text-slate-900") => (
    <div>
        <label className="block text-sm font-medium text-slate-500">{label}</label>
        <p className={`mt-1 break-words ${customClass}`}>
            {Array.isArray(value) 
                ? value.join(', ') || '-' 
                : (typeof value === 'number' ? value.toLocaleString() : value) || '-'}
        </p>
    </div>
  );

  const renderInputField = (label: string, name: string, value: string | number, placeholder: string = "", type: string = "text") => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder={placeholder} />
    </div>
  );

  const renderTextareaField = (label: string, name: string, value: string, placeholder: string = "") => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <textarea id={name} name={name} rows={4} value={value} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder={placeholder}></textarea>
    </div>
  );
  
  const renderCategorySelection = () => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{t.influencerCategoriesLabel}</label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {CATEGORIES.map(category => (
          <label key={category} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-brand-light transition-colors">
            <input
              type="checkbox"
              checked={formData.categories?.includes(category) || false}
              onChange={() => handleCategoryChange(category)}
              className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-secondary"
            />
            <span className="text-sm text-slate-800">{category}</span>
          </label>
        ))}
      </div>
    </div>
  );
  
  const displayName = formData.influencerName || formData.companyName || formData.name || 'User';
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=c4b5fd&color=4c1d95&bold=true`;
  const planName = user.plan ? t[`plan_${user.plan}`] : t.plan_free;

  return (
    <>
    <div className="bg-white p-8 rounded-2xl shadow-lg">
        {notification && (
            <div className={`mb-4 p-3 rounded-lg ${notification === t.profileUpdated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-center font-semibold`}>
                {notification}
            </div>
        )}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-slate-800">{isInfluencer ? t.myProfile : t.companyProfile}</h2>
            {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 py-2 px-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors">
                    <PencilIcon className="w-5 h-5"/>
                    <span>{t.editProfile}</span>
                </button>
            )}
        </div>
        
        <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 flex flex-col items-center md:items-start space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700 w-full">{t.profilePicture}</h3>
                    <div className="relative w-32 h-32">
                        <img 
                          src={formData.avatarUrl || defaultAvatar}
                          alt="Profile Preview" 
                          className="w-32 h-32 rounded-full shadow-md object-cover" 
                          onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                        />
                    </div>
                    {isEditing && (
                      <div className="w-full">
                        {renderInputField(t.profileImageUrlLabel, 'avatarUrl', formData.avatarUrl || '', t.profileImageUrlPlaceholder, 'url')}
                      </div>
                    )}
                </div>


                <div className="md:col-span-2 space-y-6">
                    <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">{t.basicInformation}</h3>
                    {isEditing ? renderInputField(isInfluencer ? t.influencerNameLabel : t.companyNameLabel, isInfluencer ? 'influencerName': 'companyName', isInfluencer ? formData.influencerName || '' : formData.companyName || '') : renderTextField(isInfluencer ? t.influencerNameLabel : t.companyNameLabel, isInfluencer ? user.influencerName : user.companyName)}
                    
                    {isInfluencer ? (
                        <>
                          {isEditing ? renderInputField(t.nameLabel, 'name', formData.name || '', t.namePlaceholder) : renderTextField(t.nameLabel, user.name)}
                          {isEditing ? renderInputField(t.followerCountLabel, 'followerCount', formData.followerCount || 0, t.followerCountPlaceholder, "number") : renderTextField(t.followerCountLabel, user.followerCount)}
                          {renderTextField(t.emailLabel, user.email)}
                          {isEditing ? renderTextareaField(t.bioLabel, 'bio', formData.bio || '', t.bioPlaceholder) : renderTextField(t.bioLabel, user.bio)}
                        </>
                    ) : (
                         <>
                          {isEditing ? renderInputField(t.nameLabel, 'name', formData.name || '', t.namePlaceholder) : renderTextField(t.nameLabel, user.name)}
                          {renderTextField(t.myPlan, planName, "font-bold text-brand-primary")}
                          {user.plan !== 'free' && user.planExpiryDate && renderTextField(t.planExpiryDateLabel, user.planExpiryDate.toDate().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US'))}
                          {renderTextField(t.emailLabel, user.email)}
                          {isEditing ? renderInputField(t.companyContactPhoneLabel, 'phone', formData.phone || '', t.phonePlaceholder, 'tel') : renderTextField(t.companyContactPhoneLabel, user.phone)}
                          {isEditing ? renderInputField(t.businessNumberLabel, 'businessRegistrationNumber', formData.businessRegistrationNumber || '', t.businessNumberPlaceholder) : renderTextField(t.businessNumberLabel, user.businessRegistrationNumber)}
                          {isEditing ? renderTextareaField(t.companyDescriptionLabel, 'companyDescription', formData.companyDescription || '', t.companyDescriptionPlaceholder) : renderTextField(t.companyDescriptionLabel, user.companyDescription)}
                         </>
                    )}
                </div>
            </div>

            {isInfluencer && (
                <>
                  <div className="mt-8 pt-6 border-t">
                      <h3 className="text-lg font-semibold text-slate-700 mb-4">{t.contactInformation}</h3>
                      <div className="space-y-4">
                          {isEditing ? renderInputField(t.phoneLabel, 'phone', formData.phone || '', t.phonePlaceholder, 'tel') : renderTextField(t.phoneLabel, user.phone)}
                          {isEditing ? renderInputField(t.kakaoIdLabel, 'kakaoId', formData.kakaoId || '', t.kakaoIdPlaceholder) : renderTextField(t.kakaoIdLabel, user.kakaoId)}
                      </div>
                  </div>
                  <div className="mt-8 pt-6 border-t">
                       <h3 className="text-lg font-semibold text-slate-700 mb-4">{t.influencerCategoriesLabel}</h3>
                       {isEditing ? renderCategorySelection() : renderTextField('', user.categories)}
                  </div>
                </>
            )}
            
            <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">{isInfluencer ? t.socialLinksLabel : t.websiteUrlLabel}</h3>
                <div className="space-y-4">
                  {isInfluencer ? (
                    <>
                        {isEditing ? renderInputField(t.instagramUrlLabel, 'instagramUrl', formData.instagramUrl || '', 'https://instagram.com/username') : renderTextField(t.instagramUrlLabel, user.instagramUrl)}
                        {isEditing ? renderInputField(t.youtubeUrlLabel, 'youtubeUrl', formData.youtubeUrl || '', 'https://youtube.com/channel/...') : renderTextField(t.youtubeUrlLabel, user.youtubeUrl)}
                        {isEditing ? renderInputField(t.tiktokUrlLabel, 'tiktokUrl', formData.tiktokUrl || '', 'https://tiktok.com/@username') : renderTextField(t.tiktokUrlLabel, user.tiktokUrl)}
                    </>
                  ) : (
                    <>
                        {isEditing ? renderInputField(t.websiteUrlLabel, 'websiteUrl', formData.websiteUrl || '', t.websiteUrlPlaceholder) : renderTextField(t.websiteUrlLabel, user.websiteUrl)}
                    </>
                  )}
                </div>
            </div>

            {isEditing && (
                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={handleCancel} className="py-2 px-6 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
                        {t.cancel}
                    </button>
                    <button type="submit" disabled={isLoading} className="flex items-center justify-center py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:bg-slate-400">
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t.saveChanges}
                    </button>
                </div>
            )}
        </form>

        {!isEditing && (
          <div className="mt-12 pt-6 border-t border-red-200">
            <h3 className="text-lg font-semibold text-red-700">{t.accountDeletionSectionTitle}</h3>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">{t.accountDeletionWarning}</p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="mt-4 py-2 px-5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              {t.requestAccountDeletionButton}
            </button>
          </div>
        )}
    </div>
    <DeleteAccountModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleRequestDeletion}
        language={language}
        isLoading={isLoading}
    />
    </>
  );
};

export default ProfilePage;