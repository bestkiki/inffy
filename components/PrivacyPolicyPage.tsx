import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface PrivacyPolicyPageProps {
  onBack: () => void;
  language: Language;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack, language }) => {
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
          <h1 className="text-3xl font-bold text-slate-800 mb-6">개인정보처리방침</h1>
          
          <div className="prose prose-slate max-w-none">
            <p>Inffy(이하 "회사")는 「개인정보 보호법」 등 관련 법령에 따라 이용자의 개인정보와 권익을 보호하고, 개인정보 관련 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같은 처리방침을 수립·공개합니다.</p>
            
            <hr className="my-6"/>

            <h2>제1조 (개인정보의 처리 목적)</h2>
            <p>회사는 다음의 목적을 위해 개인정보를 처리합니다. 처리 목적이 변경되는 경우, 관련 법령에 따라 사전 동의를 받는 등 필요한 조치를 이행합니다.</p>
            <ol>
              <li><strong>홈페이지 회원가입 및 관리</strong><br/>회원 가입 의사 확인, 본인 확인, 회원제 서비스 제공, 부정 이용 방지, 고지사항 전달 등</li>
              <li><strong>서비스 제공</strong><br/>인플루언서와 브랜드 간 매칭, 협업 제안·요청 관리, 캠페인 운영, 계약 진행 등</li>
              <li><strong>문의 처리</strong><br/>신원 확인, 문의사항 확인, 연락 및 통지, 처리 결과 안내 등</li>
            </ol>

            <hr className="my-6"/>

            <h2>제2조 (처리하는 개인정보의 항목)</h2>
            <p>회사는 다음의 개인정보를 수집·처리합니다.</p>
            <ol>
              <li><strong>공통 수집 항목</strong><br/>이메일 주소, 비밀번호, 담당자 이름</li>
              <li><strong>인플루언서 회원</strong><br/>활동명, 팔로워 수, SNS 링크(인스타그램, 유튜브, 틱톡 등), 자기소개, 관심 카테고리, 연락처, 카카오톡 ID</li>
              <li><strong>브랜드/기업 회원</strong><br/>회사명/브랜드명, 사업자등록번호, 웹사이트, 회사 소개, 담당자 연락처</li>
              <li><strong>자동 수집 항목</strong><br/>IP 주소, 쿠키, 서비스 이용 기록, 접속 로그 등</li>
            </ol>

            <hr className="my-6"/>

            <h2>제3조 (개인정보의 보유 및 이용 기간)</h2>
            <p>회사는 수집한 개인정보를 수집·이용 목적이 달성될 때까지 보유하며, 관련 법령에 따라 일정 기간 보관해야 하는 정보는 다음과 같습니다.</p>
            <ol>
              <li><strong>회원가입 및 관리</strong><br/>회원 탈퇴 시까지<br/>단, 관계 법령 위반으로 인한 수사·조사가 진행 중인 경우 해당 절차 종료 시까지<br/>서비스 이용에 따른 채권·채무 정산 시까지</li>
              <li><strong>전자상거래 등에서의 소비자 보호에 관한 법률에 따른 보관</strong><br/>
                <ul>
                  <li>계약 또는 청약 철회 등에 관한 기록: 5년</li>
                  <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                  <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                </ul>
              </li>
            </ol>
            
            <hr className="my-6"/>

            <h2>제4조 (개인정보의 제3자 제공)</h2>
            <p>회사는 정보주체의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며, 다음의 경우에 한하여 제3자에게 제공합니다.</p>
            <ol>
                <li>정보주체의 사전 동의를 받은 경우</li>
                <li>법령에 특별한 규정이 있는 경우</li>
            </ol>
            <p>또한, 아래의 경우에 정보주체 동의를 얻어 최소한의 범위 내에서 개인정보를 제공합니다.</p>
            <ul>
                <li><strong>협업/캠페인 성사 시</strong><br/>인플루언서와 브랜드 간 원활한 협업 진행을 위해 상호 간 이메일, 전화번호, 카카오 ID 등을 제공할 수 있습니다.</li>
            </ul>
            
            <hr className="my-6"/>

            <h2>제5조 (정보주체의 권리·의무 및 행사방법)</h2>
            <p>정보주체는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ol>
                <li>개인정보 열람 요청</li>
                <li>개인정보 정정·삭제 요청</li>
                <li>개인정보 처리 정지 요청</li>
            </ol>
            <p>권리 행사는 서면, 이메일, 팩스 등을 통해 회사에 요청할 수 있으며, 회사는 지체 없이 조치합니다.</p>
            <p>※ 만 14세 미만 아동의 경우 법정대리인이 권리를 행사할 수 있습니다.</p>
            
            <hr className="my-6"/>

            <h2>제6조 (개인정보의 파기)</h2>
            <p>회사는 개인정보 보유기간의 경과 또는 처리 목적 달성 등 불필요하게 된 개인정보는 지체 없이 파기합니다.</p>
            <ol>
                <li><strong>파기 절차</strong><br/>불필요한 개인정보를 선정하고, 회사 내부 방침에 따라 승인 후 파기</li>
                <li><strong>파기 방법</strong><br/>
                    <ul>
                        <li>전자 파일: 복구 불가능한 방식으로 영구 삭제</li>
                        <li>종이 문서: 분쇄하거나 소각</li>
                    </ul>
                </li>
            </ol>
            
            <hr className="my-6"/>
            
            <h2>제7조 (개인정보 보호책임자)</h2>
            <p>회사는 개인정보 보호 관련 업무 총괄 및 민원 처리를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
            <ul>
              <li>성명: 박기현</li>
              <li>직책: 대표</li>
              <li>연락처: 010-4919-0742, bestkiki1@naver.com</li>
            </ul>
            <p>※ 개인정보 보호 관련 문의사항은 위 연락처를 통해 접수해주시기 바랍니다.</p>
            
            <hr className="my-6"/>
            
            <h2>제8조 (개인정보 유효기간제)</h2>
            <ol>
                <li>회사는 1년 동안 회사의 서비스를 이용하지 않은 회원의 개인정보를 「개인정보 보호법」 제39조의6에 따라 다른 회원의 개인정보와 분리하여 별도로 저장·관리합니다. (휴면계정 전환)</li>
                <li>회사는 분리 저장된 개인정보를 법률에 특별한 규정이 있는 경우를 제외하고는 해당 개인정보를 이용하거나 제공하지 않습니다.</li>
                <li>회사는 휴면계정으로 전환되기 30일 이전에 해당 회원에게 개인정보가 분리되어 저장·관리되는 사실과 전환 예정일 및 분리·저장되는 개인정보 항목을 이메일 등 사용자가 명확히 인지할 수 있는 방법으로 사전 통지합니다.</li>
                <li>회원은 휴면계정 전환 이후에 다시 로그인을 하거나 본인확인 절차를 거친 후, 서비스 이용 의사를 표시하는 경우 휴면 상태가 해제되어 정상적인 서비스를 이용할 수 있습니다.</li>
            </ol>

            <hr className="my-6"/>

            <h2>제9조 (개인정보처리방침의 변경)</h2>
            <p>이 개인정보처리방침은 시행일로부터 적용되며, 내용 추가, 삭제, 수정이 있을 경우 변경 사항은 시행 7일 전부터 홈페이지 공지사항 등을 통해 고지합니다.</p>
            <ul>
              <li>공고일자: 2025년 7월 23일</li>
              <li>시행일자: 2025년 7월 30일</li>
            </ul>

          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;