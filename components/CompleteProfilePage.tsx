import React, { useState } from 'react';
import { db } from '../firebase';
import { User, Language, UserType } from '../types';
import { translations } from '../translations';
import { SparklesIcon } from './icons/SparklesIcon';
import { CATEGORIES } from './constants';

interface CompleteProfilePageProps {
  user: User;
  language: Language;
  onProfileComplete: (updatedData: Partial<User>) => void;
}

const CompleteProfilePage: React.FC<CompleteProfilePageProps> = ({ user, language, onProfileComplete }) => {
  const t = translations[language];
  const isInfluencer = user.type === UserType.INFLUENCER;

  const [formData, setFormData] = useState({
    bio: '',
    categories: [] as string[],
    instagramUrl: '',
    followerCount: '' as number | '',
    websiteUrl: '',
    companyDescription: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategoryChange = (category: string) => {
    setFormData(prev => {
      const currentCategories = prev.categories;
      const newCategories = currentCategories.includes(category)
        ? currentCategories.filter(c => c !== category)
        : [...currentCategories, category];
      return { ...prev, categories: newCategories };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (isInfluencer && !formData.instagramUrl) {
        setError(t.instagramUrlRequired);
        setIsLoading(false);
        return;
    }
    if (!isInfluencer && !formData.websiteUrl) {
        setError(t.websiteUrlRequired);
        setIsLoading(false);
        return;
    }

    const updatedData: Partial<User> = {
      status: 'pending', // Move to admin approval queue
      ...(isInfluencer && {
          bio: formData.bio,
          categories: formData.categories,
          instagramUrl: formData.instagramUrl,
          followerCount: Number(formData.followerCount) || 0,
      }),
      ...(!isInfluencer && {
          websiteUrl: formData.websiteUrl,
          companyDescription: formData.companyDescription,
      }),
    };
    
    try {
      await db.collection('users').doc(user.uid).update(updatedData);
      onProfileComplete(updatedData); // Update user state in App.tsx
      alert(t.profileCompletionSuccess);
    } catch (err) {
      console.error("Error submitting profile for review:", err);
      setError(t.profileCompletionError);
      setIsLoading(false);
    }
  };
  
  const renderInputField = (label: string, name: string, value: string | number, placeholder: string = "", type: string = "text", required: boolean = false) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder={placeholder} required={required} />
    </div>
  );

  const renderTextareaField = (label: string, name: string, value: string, placeholder: string = "") => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <textarea id={name} name={name} rows={4} value={value} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder={placeholder}></textarea>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-white flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-2xl bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-slate-100">
        <header className="text-center mb-8">
            <SparklesIcon className="w-12 h-12 mx-auto text-brand-primary"/>
            <h1 className="text-3xl font-extrabold text-slate-800 mt-4">{t.completeProfileTitle}</h1>
            <p className="text-slate-600 mt-2">{t.completeProfileSubtitle}</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">{error}</p>}
          
          {isInfluencer ? (
            <>
              {renderInputField(t.instagramUrlLabel, 'instagramUrl', formData.instagramUrl, 'https://instagram.com/username', 'url', true)}
              {renderInputField(t.followerCountLabel, 'followerCount', formData.followerCount, t.followerCountPlaceholder, 'number')}
              {renderTextareaField(t.bioLabel, 'bio', formData.bio, t.bioPlaceholder)}
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
            </>
          ) : (
            <>
              {renderInputField(t.websiteUrlLabel, 'websiteUrl', formData.websiteUrl, t.websiteUrlPlaceholder, 'url', true)}
              {renderTextareaField(t.companyDescriptionLabel, 'companyDescription', formData.companyDescription, t.companyDescriptionPlaceholder)}
            </>
          )}

          <div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-white font-bold bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : t.submitApplication}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CompleteProfilePage;
