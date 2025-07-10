
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { GlobeIcon } from './icons/GlobeIcon';
import { SearchIcon } from './icons/SearchIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { CollectionIcon } from './icons/CollectionIcon';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigateToPrivacy: () => void;
  onNavigateToTerms: () => void;
  onNavigateToAboutUs: () => void;
  onNavigateToContact: () => void;
}

const LanguageSwitcher: React.FC<{
    language: Language;
    onLanguageChange: (lang: Language) => void;
    className?: string;
}> = ({ language, onLanguageChange, className }) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectLanguage = (lang: Language) => {
        onLanguageChange(lang);
        setIsOpen(false);
    }

    return (
        <div className={`relative ${className}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center text-slate-500 hover:text-brand-primary transition-colors">
                <GlobeIcon className="w-6 h-6" />
                <span className="ml-2 font-medium">{language.toUpperCase()}</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-xl z-20 py-1 border">
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

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, language, onLanguageChange, onNavigateToPrivacy, onNavigateToTerms, onNavigateToAboutUs, onNavigateToContact }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'brands' | 'influencers'>('brands');

  const ProcessStep: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({ icon, title, description }) => (
    <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-center w-16 h-16 bg-brand-light rounded-full mx-auto mb-5">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 leading-relaxed px-2">{description}</p>
    </div>
  );

  const brandSteps = [
    { icon: <SearchIcon className="w-8 h-8 text-brand-primary"/>, title: t.brand_step_1_title, description: t.brand_step_1_desc },
    { icon: <PaperAirplaneIcon className="w-8 h-8 text-brand-primary"/>, title: t.brand_step_2_title, description: t.brand_step_2_desc },
    { icon: <CollectionIcon className="w-8 h-8 text-brand-primary"/>, title: t.brand_step_3_title, description: t.brand_step_3_desc },
  ];

  const influencerSteps = [
    { icon: <ShoppingBagIcon className="w-8 h-8 text-brand-primary"/>, title: t.influencer_step_1_title, description: t.influencer_step_1_desc },
    { icon: <UserPlusIcon className="w-8 h-8 text-brand-primary"/>, title: t.influencer_step_2_title, description: t.influencer_step_2_desc },
    { icon: <CurrencyDollarIcon className="w-8 h-8 text-brand-primary"/>, title: t.influencer_step_3_title, description: t.influencer_step_3_desc },
  ]

  return (
    <div className="bg-white text-slate-700 antialiased">
        <header className="sticky top-0 bg-white/80 backdrop-blur-lg z-10 border-b border-slate-200">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="#" className="text-3xl font-extrabold text-brand-primary tracking-tighter">Inffy</a>
                <div className="hidden md:flex items-center space-x-8">
                    <a href="#how-it-works" className="text-slate-600 hover:text-brand-primary font-medium transition-colors">{t.how_it_works_title}</a>
                    <a href="#for-influencers" className="text-slate-600 hover:text-brand-primary font-medium transition-colors">{t.nav_for_influencers}</a>
                </div>
                <div className="flex items-center space-x-4">
                    <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
                    <button onClick={onNavigateToLogin} className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105">
                        {t.nav_login}
                    </button>
                </div>
            </nav>
        </header>

        <main>
            <section className="relative py-24 md:py-32 bg-slate-50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-light via-white to-white"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-primary/5 rounded-bl-full"></div>
                 <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-brand-secondary/5 rounded-tr-full"></div>

                <div className="container mx-auto px-6 relative z-10">
                   <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tighter leading-tight">
                                {t.landing_hero_title}
                            </h2>
                            <p className="mt-6 max-w-xl text-lg md:text-xl text-slate-600 mx-auto md:mx-0">
                                {t.landing_hero_subtitle}
                            </p>
                            <button onClick={onNavigateToLogin} className="mt-10 bg-brand-primary hover:bg-brand-dark text-white font-bold py-4 px-10 rounded-full transition-transform transform hover:scale-105 shadow-lg text-lg">
                                {t.landing_cta_main}
                            </button>
                        </div>
                        <div className="hidden md:flex justify-center">
                             <div className="relative w-96 h-96">
                                <div className="absolute top-0 left-10 w-64 h-64 bg-brand-accent rounded-full opacity-30 animate-blob"></div>
                                <div className="absolute top-10 right-0 w-72 h-72 bg-brand-secondary rounded-full opacity-30 animate-blob animation-delay-2000"></div>
                                <div className="absolute bottom-0 left-20 w-56 h-56 bg-brand-primary rounded-full opacity-30 animate-blob animation-delay-4000"></div>
                            </div>
                        </div>
                   </div>
                </div>
            </section>

            <section id="how-it-works" className="py-24 bg-slate-50">
                 <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800">{t.how_it_works_title}</h2>
                    </div>

                    <div className="flex justify-center mb-10">
                        <div className="bg-slate-200 p-1.5 rounded-full flex gap-2">
                             <button onClick={() => setActiveTab('brands')} className={`px-6 py-2.5 rounded-full text-base font-semibold transition-colors ${activeTab === 'brands' ? 'bg-white text-brand-dark shadow-md' : 'text-slate-600 hover:bg-white/50'}`}>
                                {t.how_it_works_for_brands_tab}
                             </button>
                             <button onClick={() => setActiveTab('influencers')} className={`px-6 py-2.5 rounded-full text-base font-semibold transition-colors ${activeTab === 'influencers' ? 'bg-white text-brand-dark shadow-md' : 'text-slate-600 hover:bg-white/50'}`}>
                                {t.how_it_works_for_influencers_tab}
                            </button>
                        </div>
                    </div>
                    
                    {activeTab === 'brands' && (
                        <div className="text-center animate-fade-in">
                            <h3 className="text-2xl font-semibold text-slate-700 mb-10">{t.brands_headline}</h3>
                            <div className="grid md:grid-cols-3 gap-8">
                                {brandSteps.map((step, i) => <ProcessStep key={i} {...step} />)}
                            </div>
                        </div>
                    )}

                    {activeTab === 'influencers' && (
                        <div className="text-center animate-fade-in">
                            <h3 className="text-2xl font-semibold text-slate-700 mb-10">{t.influencers_headline}</h3>
                             <div className="grid md:grid-cols-3 gap-8">
                                {influencerSteps.map((step, i) => <ProcessStep key={i} {...step} />)}
                            </div>
                        </div>
                    )}
                 </div>
            </section>

            <section id="for-influencers" className="py-24 bg-gradient-to-tr from-brand-dark to-slate-900 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">{t.for_influencers_title}</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-brand-light">{t.for_influencers_desc}</p>
                     <button onClick={onNavigateToLogin} className="mt-8 bg-white hover:bg-brand-light text-brand-dark font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg">
                        {t.for_influencers_cta}
                    </button>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 text-center">
                     <h2 className="text-3xl md:text-4xl font-bold text-slate-800">{t.final_cta_title}</h2>
                     <button onClick={onNavigateToLogin} className="mt-8 bg-brand-primary hover:bg-brand-dark text-white font-bold py-4 px-10 rounded-full transition-transform transform hover:scale-105 shadow-lg text-lg">
                        {t.final_cta_button}
                    </button>
                </div>
            </section>
        </main>

        <footer className="bg-slate-800 text-slate-300">
            <div className="container mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                     <div className="mb-6 md:mb-0">
                        <a href="#" className="text-2xl font-extrabold text-white tracking-tighter">Inffy</a>
                        <p className="text-sm text-slate-400 mt-1">{t.loginSubtitle}</p>
                     </div>
                     <div className="flex space-x-6">
                        <button onClick={onNavigateToAboutUs} className="hover:text-white transition-colors">{t.footer_about}</button>
                        <button onClick={onNavigateToContact} className="hover:text-white transition-colors">{t.footer_contact}</button>
                        <button onClick={onNavigateToPrivacy} className="hover:text-white transition-colors">{t.footer_privacy}</button>
                        <button onClick={onNavigateToTerms} className="hover:text-white transition-colors">{t.footer_terms}</button>
                     </div>
                </div>
                <div className="mt-8 border-t border-slate-700 pt-6 text-center text-sm text-slate-400">
                    {t.footerCopyright}
                </div>
            </div>
        </footer>

        <style>{`
          .animate-fade-in {
            animation: fadeIn 0.6s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
        `}</style>
    </div>
  );
};

export default LandingPage;