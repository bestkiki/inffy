
import React, { useState } from 'react';
import { UserType, Language } from '../types';
import { translations } from '../translations';
import { auth, db } from '../firebase';

interface LoginPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigateToLanding: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ language, onLanguageChange, onNavigateToLanding }) => {
  const t = translations[language];

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [influencerName, setInfluencerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [userType, setUserType] = useState<UserType>(UserType.INFLUENCER);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (isSignUp) {
      if (!name.trim()) {
        setError(t.errorNameRequired);
        setIsLoading(false);
        return;
      }
      if (userType === UserType.COMPANY && (!companyName.trim() || !businessNumber.trim())) {
        setError(t.errorBusinessInfoRequired);
        setIsLoading(false);
        return;
      }
      try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        if (!user) {
            throw new Error("User creation failed.");
        }
        
        const userData: any = {
          name: name,
          email: user.email,
          type: userType,
          status: 'profile_pending', // New users start here
          role: 'user',
        };

        if (userType === UserType.INFLUENCER) {
            userData.influencerName = influencerName;
        }

        if (userType === UserType.COMPANY) {
            userData.companyName = companyName;
            userData.businessRegistrationNumber = businessNumber;
        }

        await db.collection("users").doc(user.uid).set(userData, { merge: true });

      } catch (err: any) {
        setError(t.firebaseErrors[err.code] || err.message);
      }
    } else {
      try {
        await auth.signInWithEmailAndPassword(email, password);
      } catch (err: any) {
        setError(t.firebaseErrors[err.code] || err.message);
      }
    }
    setIsLoading(false);
  };

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
    setInfluencerName('');
    setCompanyName('');
    setBusinessNumber('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-white flex flex-col items-center justify-center p-4 transition-all duration-500">
      <header className="text-center mb-8">
        <button onClick={onNavigateToLanding} className="focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-4 rounded-lg">
          <h1 className="text-5xl md:text-6xl font-extrabold text-brand-primary tracking-tighter hover:opacity-80 transition-opacity">{t.loginTitle}</h1>
        </button>
        <p className="text-lg md:text-xl text-slate-600 mt-4 max-w-xl mx-auto">{t.loginSubtitle}</p>
      </header>

      <main className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-6">{isSignUp ? t.createAccount : t.loginToAccount}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
             <div>
              <span className="block text-sm font-medium text-slate-700 mb-2">{t.accountTypeLabel}</span>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setUserType(UserType.INFLUENCER)} className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${userType === UserType.INFLUENCER ? 'border-brand-primary bg-brand-light text-brand-dark font-bold' : 'border-slate-300 bg-white hover:border-brand-secondary'}`}>
                  {t.forInfluencers}
                </button>
                <button type="button" onClick={() => setUserType(UserType.COMPANY)} className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${userType === UserType.COMPANY ? 'border-brand-primary bg-brand-light text-brand-dark font-bold' : 'border-slate-300 bg-white hover:border-brand-secondary'}`}>
                  {t.forBrandsShort}
                </button>
              </div>
            </div>
          )}

          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">{t.nameLabel}</label>
              <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder={t.namePlaceholder} />
            </div>
          )}

          {isSignUp && userType === UserType.INFLUENCER && (
             <div>
              <label htmlFor="influencerName" className="block text-sm font-medium text-slate-700 mb-1">{t.influencerNameLabel}</label>
              <input id="influencerName" name="influencerName" type="text" value={influencerName} onChange={(e) => setInfluencerName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder={t.influencerNamePlaceholder} />
            </div>
          )}

          {isSignUp && userType === UserType.COMPANY && (
            <>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">{t.companyNameLabel}</label>
                <input id="companyName" name="companyName" type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder={t.companyNamePlaceholder} />
              </div>
               <div>
                <label htmlFor="businessNumber" className="block text-sm font-medium text-slate-700 mb-1">{t.businessNumberLabel}</label>
                <input id="businessNumber" name="businessNumber" type="text" required value={businessNumber} onChange={(e) => setBusinessNumber(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder={t.businessNumberPlaceholder} />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">{t.emailLabel}</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder="you@example.com" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">{t.passwordLabel}</label>
            <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" placeholder="••••••••" />
          </div>

          {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">{error}</p>}

          <div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-white font-bold bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (isSignUp ? t.signUpButton : t.loginAction)}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isSignUp ? t.alreadyHaveAccount : t.dontHaveAccount}{' '}
          <button onClick={toggleForm} className="font-medium text-brand-primary hover:text-brand-dark focus:outline-none focus:underline">
            {isSignUp ? t.loginAction : t.createAccount}
          </button>
        </p>
      </main>

      <footer className="text-center mt-12 text-slate-500">
        <p>{t.footerCopyright}</p>
        <div className="mt-2 text-sm">
          <button onClick={() => onLanguageChange('ko')} className={`font-semibold ${language === 'ko' ? 'text-brand-primary' : 'text-slate-500 hover:text-brand-primary'}`}>한국어</button>
          <span className="mx-2">|</span>
          <button onClick={() => onLanguageChange('en')} className={`font-semibold ${language === 'en' ? 'text-brand-primary' : 'text-slate-500 hover:text-brand-primary'}`}>English</button>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
