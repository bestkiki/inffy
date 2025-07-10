
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface TermsOfServicePageProps {
  onBack: () => void;
  language: Language;
}

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onBack, language }) => {
  const t = translations[language];

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center">
            <button onClick={onBack} className="flex items-center text-slate-600 hover:text-brand-primary font-semibold transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              <span>뒤로가기</span>
            </button>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">이용약관</h1>
          
          <div className="prose prose-slate max-w-none">
            <p>Inffy 서비스에 오신 것을 환영합니다. 본 약관은 Inffy(이하 "회사")가 제공하는 모든 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.</p>
            
            <hr className="my-6"/>

            <h2>제1조 (용어의 정의)</h2>
            <ol>
              <li><strong>서비스:</strong> 회사가 제공하는 브랜드와 인플루언서 매칭 및 관련 제반 서비스를 의미합니다.</li>
              <li><strong>회원:</strong> 회사에 개인정보를 제공하고 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 서비스를 이용할 수 있는 자를 말합니다. 회원은 '인플루언서 회원'과 '브랜드 회원'으로 구분됩니다.</li>
              <li><strong>인플루언서 회원:</strong> 자신의 소셜 미디어 채널을 통해 영향력을 행사하며, 브랜드와의 협업을 희망하여 회원으로 가입한 개인 또는 사업자를 의미합니다.</li>
              <li><strong>브랜드 회원:</strong> 자사의 제품 또는 서비스 홍보를 위해 인플루언서와의 협업을 희망하여 회원으로 가입한 기업 또는 개인사업자를 의미합니다.</li>
              <li><strong>캠페인:</strong> 브랜드 회원이 인플루언서 회원에게 제안하는 마케팅 협업 활동을 의미합니다.</li>
            </ol>

            <hr className="my-6"/>

            <h2>제2조 (약관의 효력 및 변경)</h2>
            <ol>
                <li>본 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다.</li>
                <li>회사는 합리적인 사유가 발생할 경우, 관련 법령에 위배되지 않는 범위 안에서 본 약관을 개정할 수 있습니다.</li>
                <li>회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다. 다만, 회원에게 불리하게 약관내용을 변경하는 경우에는 최소한 30일 이상의 사전 유예기간을 두고 공지합니다.</li>
                <li>회원이 개정약관의 적용에 동의하지 않는 경우, 회원은 서비스 이용을 중단하고 회원 탈퇴를 할 수 있습니다.</li>
            </ol>
            
            <hr className="my-6"/>

            <h2>제3조 (회원가입)</h2>
            <ol>
                <li>회원가입은 서비스를 이용하려는 자가 본 약관의 내용에 동의하고, 회사가 정한 가입 양식에 따라 회원정보를 기입하여 신청하면, 회사가 이를 승낙함으로써 체결됩니다.</li>
                <li>회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 유보하거나 거절할 수 있습니다.
                    <ul>
                        <li>가입신청자가 이전에 회원자격을 상실한 적이 있는 경우</li>
                        <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                        <li>사회의 안녕질서 또는 미풍양속을 저해할 목적으로 신청한 경우</li>
                        <li>기타 회사가 정한 이용신청요건이 미비되었을 때</li>
                    </ul>
                </li>
            </ol>

            <hr className="my-6"/>

            <h2>제4조 (서비스의 제공 및 변경)</h2>
            <ol>
                <li>회사는 다음과 같은 서비스를 제공합니다.
                    <ul>
                        <li>인플루언서 및 브랜드 정보 검색 서비스</li>
                        <li>캠페인 제안 및 협업 요청 기능</li>
                        <li>캠페인 관리 대시보드</li>
                        <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스</li>
                    </ul>
                </li>
                <li>회사는 서비스의 내용, 품질, 또는 기술적 사양 등에 대해 회사의 정책적인 판단에 따라 변경할 수 있습니다.</li>
            </ol>

            <hr className="my-6"/>

            <h2>제5조 (회원의 의무)</h2>
            <ol>
                <li>회원은 회원가입 신청 또는 회원정보 변경 시 모든 사항을 사실에 근거하여 본인의 진정한 정보로 작성하여야 하며, 허위 또는 타인의 정보를 등록할 경우 이와 관련된 모든 권리를 주장할 수 없습니다.</li>
                <li>회원은 관계법령, 본 약관에서 규정하는 사항, 서비스 이용 안내 및 주의사항 등 회사가 공지하는 사항을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.</li>
                <li>회원은 회사의 사전 승낙 없이 서비스를 이용하여 영업활동을 할 수 없으며, 그 영업활동의 결과에 대해 회사는 책임을 지지 않습니다.</li>
            </ol>
            
            <hr className="my-6"/>

            <h2>제6조 (회사의 의무)</h2>
            <ol>
                <li>회사는 관련 법령과 본 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다하여 노력합니다.</li>
                <li>회사는 회원이 안전하게 서비스를 이용할 수 있도록 개인정보(신용정보 포함) 보호를 위한 보안 시스템을 갖추어야 하며, 개인정보처리방침을 공시하고 준수합니다.</li>
            </ol>

            <hr className="my-6"/>

            <h2>제7조 (계약해지 및 이용제한)</h2>
            <ol>
                <li>회원이 서비스 이용계약을 해지하고자 할 경우에는 회사가 정한 절차에 따라 회원 탈퇴를 신청해야 합니다.</li>
                <li>회사는 회원이 다음 각 호에 해당하는 행위를 하였을 경우, 사전통지 없이 이용계약을 해지하거나 또는 기간을 정하여 서비스 이용을 중지할 수 있습니다.
                    <ul>
                        <li>타인의 서비스 ID 및 비밀번호를 도용한 경우</li>
                        <li>서비스 운영을 고의로 방해한 경우</li>
                        <li>공공질서 및 미풍양속에 저해되는 내용을 고의로 유포시킨 경우</li>
                        <li>국익 또는 사회적 공익을 저해할 목적으로 서비스 이용을 계획 또는 실행하는 경우</li>
                    </ul>
                </li>
            </ol>
            
            <hr className="my-6"/>

            <h2>제8조 (면책조항)</h2>
            <ol>
                <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
                <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
                <li>회사는 회원이 서비스를 이용하여 기대하는 수익을 얻지 못하거나 상실한 것에 대하여 책임을 지지 않으며, 서비스를 통해 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</li>
                <li>회사는 회원 간 또는 회원과 제3자 상호간에 서비스를 매개로 하여 거래 등을 한 경우에는 책임이 면제됩니다.</li>
            </ol>
            
            <hr className="my-6"/>

            <h2>제9조 (분쟁 해결)</h2>
            <ol>
                <li>회사와 회원은 서비스와 관련하여 발생한 분쟁을 원만하게 해결하기 위하여 필요한 노력을 해야 합니다.</li>
                <li>전항의 노력에도 불구하고, 분쟁에 대해 소송이 제기될 경우 회사의 본사 소재지를 관할하는 법원을 전속 관할법원으로 합니다.</li>
            </ol>
            
            <p><strong>부칙</strong></p>
            <p>1. 이 약관은 2025년 7월 30일부터 시행됩니다.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfServicePage;
