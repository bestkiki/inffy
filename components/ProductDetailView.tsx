

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { Product, Language, User, UserType } from '../types';
import { translations } from '../translations';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { LinkIcon } from './icons/LinkIcon';
import CollaborationRequestModal from './CollaborationRequestModal';

interface ProductDetailViewProps {
  productId: string;
  language: Language;
  onBack: () => void;
  currentUser: User;
  onUserUpdate: (updatedData: Partial<User>) => void;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ productId, language, onBack, currentUser, onUserUpdate }) => {
  const t = translations[language];
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const productDocRef = db.collection('products').doc(productId);
        const docSnap = await productDocRef.get();
        if (docSnap.exists) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          console.error("No such product!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
      setIsLoading(false);
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const formatCurrency = (amount: number) => `₩${amount.toLocaleString()}`;

  const renderInfoRow = (label: string, value: string | React.ReactNode) => (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-1 text-lg text-slate-800 font-semibold">{value}</div>
    </div>
  );
  
  const renderGroupBuyPrice = () => {
      if (!product?.groupBuyPriceConfig) return null;
      
      const { type, value } = product.groupBuyPriceConfig;
      
      if (type === 'fixed' && value !== undefined) {
          return renderInfoRow(t.groupBuyPriceLabel, formatCurrency(value));
      }
      if (type === 'negotiable') {
          return renderInfoRow(t.groupBuyPriceLabel, <span className="text-base text-purple-600">{t.priceTypeNegotiable}</span>);
      }
      if (type === 'discretionary') {
          return renderInfoRow(t.groupBuyPriceLabel, <span className="text-base text-purple-600">{t.priceTypeDiscretionary}</span>);
      }
      return null;
  }
  
  const renderSupplyInfo = () => {
      if (!product?.supplyConfig) return null;
      
      const { type, supplyType, value } = product.supplyConfig;

      if (type === 'negotiable') {
          return <p className="font-semibold text-purple-600">{t.priceTypeNegotiable}</p>;
      }
      
      if (type === 'fixed' && supplyType && value !== undefined) {
           return (
            <div>
              <p className="font-semibold">{t[`supplyType_${supplyType}`]}</p>
              <p className="text-lg">{supplyType === 'COMMISSION' ? `${value}%` : formatCurrency(value)}</p>
            </div>
           );
      }
      
      return <p>--</p>;
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  if (!product) {
    return <div>{t.noProductsFound}</div>;
  }
  
  const handleRequestSuccess = () => {
    setIsModalOpen(false);
    alert(t.requestSentSuccess);
  };
  
  const isRequestLimitReached = 
    currentUser.type === UserType.INFLUENCER &&
    currentUser.plan === 'free' &&
    currentUser.requestLimit !== -1 &&
    (currentUser.monthlyRequestsSent ?? 0) >= currentUser.requestLimit;

  return (
    <>
      <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
        <div className="flex justify-between items-start mb-6">
          <button onClick={onBack} className="flex items-center text-slate-600 hover:text-brand-primary font-semibold transition-colors">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            {t.backToMarket}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side: Image */}
          <div>
            <img 
              src={product.productImageUrl} 
              alt={product.productName}
              className="w-full h-auto object-cover rounded-xl shadow-lg aspect-square"
            />
          </div>

          {/* Right Side: Details */}
          <div className="space-y-6">
            <div>
              <p className="text-base text-slate-500 font-medium">{product.brandName}</p>
              <h2 className="mt-1 text-3xl lg:text-4xl font-bold text-slate-800">{product.productName}</h2>
              <p className="mt-1 text-sm text-brand-secondary font-semibold">{product.category}</p>
            </div>
            
            <p className="text-slate-600 leading-relaxed">{product.description}</p>
            
            {product.productSalesUrl && (
              <a href={product.productSalesUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-2 px-4 bg-brand-light text-brand-dark font-semibold rounded-lg hover:bg-brand-accent transition-colors">
                <LinkIcon className="w-5 h-5"/>
                <span>{t.productSalesUrl}</span>
              </a>
            )}
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              {renderInfoRow(t.retailPrice, formatCurrency(product.retailPrice))}
              {renderGroupBuyPrice()}
            </div>
            
            <div className="pt-4 border-t">
                <h3 className="text-lg font-bold text-slate-700 mb-2">{t.supplyInfo}</h3>
                <div className="p-4 bg-slate-50 rounded-lg">
                  {renderSupplyInfo()}
                </div>
            </div>

            {currentUser.type === UserType.INFLUENCER && (
              <div className="mt-6 pt-6 border-t">
                  <button
                      onClick={() => setIsModalOpen(true)}
                      disabled={isRequestLimitReached}
                      title={isRequestLimitReached ? t.requestLimitReached : ""}
                      className="w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-full hover:bg-brand-dark transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
                  >
                      {t.requestGroupBuy}
                  </button>
                  {isRequestLimitReached && <p className="text-red-500 text-xs mt-2 text-center">{t.requestLimitReached}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isModalOpen && product && (
        <CollaborationRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          language={language}
          influencer={currentUser}
          product={product}
          onSuccess={handleRequestSuccess}
          onUserUpdate={onUserUpdate}
        />
      )}
    </>
  );
};

export default ProductDetailView;