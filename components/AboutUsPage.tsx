import React from 'react';
import { Language } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface AboutUsPageProps {
  onBack: () => void;
  language: Language;
}

const AboutUsPage: React.FC<AboutUsPageProps> = ({ onBack, language }) => {
  const content = {
    ko: {
      title: "회사 소개",
      back: "뒤로가기",
      heroTitle: "연결의 가치를 믿습니다",
      heroSubtitle: "Inffy는 재능 있는 인플루언서와 혁신적인 브랜드가 만나 새로운 시너지를 창출하는 세상을 꿈꿉니다.",
      visionTitle: "우리의 비전",
      visionText: "우리는 투명하고 효율적인 매칭 시스템을 통해 모든 규모의 브랜드가 적합한 인플루언서를 찾고, 모든 인플루언서가 자신의 영향력을 가치있게 활용할 수 있는 건강한 크리에이터 생태계를 만드는 것을 목표로 합니다.",
      missionTitle: "우리의 미션",
      missionText: "신뢰할 수 있는 데이터를 기반으로 가장 확실한 파트너십을 연결하고, 성장 가능성이 있는 모두에게 공정한 기회를 제공하여 함께 성공하는 경험을 만듭니다."
    },
    en: {
      title: "About Us",
      back: "Back",
      heroTitle: "We Believe in the Value of Connection",
      heroSubtitle: "Inffy dreams of a world where talented influencers and innovative brands meet to create new synergies.",
      visionTitle: "Our Vision",
      visionText: "Our goal is to create a healthy creator ecosystem where brands of all sizes can find the right influencers through a transparent and efficient matching system, and every influencer can utilize their influence valuably.",
      missionTitle: "Our Mission",
      missionText: "We connect the most certain partnerships based on reliable data, provide fair opportunities to everyone with growth potential, and create experiences of succeeding together."
    }
  };

  const t = content[language];

  return (
    <div className="bg-slate-50 min-h-screen animate-fade-in">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center">
          <button onClick={onBack} className="flex items-center text-slate-600 hover:text-brand-primary font-semibold transition-colors">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>{t.back}</span>
          </button>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <section className="text-center py-16 px-6 bg-brand-primary text-white rounded-2xl shadow-lg" style={{ backgroundImage: 'linear-gradient(to right, #6d28d9, #8b5cf6)' }}>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{t.heroTitle}</h1>
            <p className="mt-4 text-lg md:text-xl text-brand-light max-w-2xl mx-auto">{t.heroSubtitle}</p>
          </section>

          {/* Vision & Mission Section */}
          <section className="mt-12 grid md:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">{t.visionTitle}</h2>
              <p className="text-slate-600 leading-relaxed">{t.visionText}</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">{t.missionTitle}</h2>
              <p className="text-slate-600 leading-relaxed">{t.missionText}</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AboutUsPage;
