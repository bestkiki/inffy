
import React from 'react';
import { Product, Language } from '../types';
import { translations } from '../translations';
import { XIcon } from './icons/XIcon';
import { LinkIcon } from './icons/LinkIcon';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  product: Product;
}

const DetailItem: React.FC<{ label: string; value?: string | number | React.ReactNode }> = ({ label, value }) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return (
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <div className="mt-1 text-slate-800">{value}</div>
    </div>
  );
};

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ isOpen, onClose, language, product }) => {
  const t = translations[language];
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => `₩${amount.toLocaleString()}`;

  const renderGroupBuyPrice = () => {
      if (!product?.groupBuyPriceConfig) return null;
      const { type, value } = product.groupBuyPriceConfig;
      let displayValue: React.ReactNode;
      if (type === 'fixed' && value !== undefined) {
          displayValue = formatCurrency(value);
      } else {
          displayValue = <span className="font-semibold text-purple-600">{t[`priceType${type.charAt(0).toUpperCase() + type.slice(1)}`]}</span>
      }
      return <DetailItem label={t.groupBuyPriceLabel} value={displayValue} />;
  }
  
  const renderSupplyInfo = () => {
    if (!product?.supplyConfig) return '--';
    const { type, supplyType, value } = product.supplyConfig;

    if (type === 'negotiable') {
      return <p className="font-semibold text-purple-600">{t.priceTypeNegotiable}</p>;
    }
    
    if (type === 'fixed' && supplyType && value !== undefined) {
      return (
        <div>
          <p className="font-semibold">{t[`supplyType_${supplyType}`]}</p>
          <p className="text-slate-700">{supplyType === 'COMMISSION' ? `${value}%` : formatCurrency(value)}</p>
        </div>
      );
    }
    return '--';
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800">{t.productDetailsTitle}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img src={product.productImageUrl} alt={product.productName} className="w-full sm:w-48 h-auto sm:h-48 rounded-lg object-cover bg-slate-100 shrink-0" />
            <div className="space-y-4">
                <div>
                    <p className="font-semibold text-sm text-brand-primary">{product.brandName}</p>
                    <h3 className="text-xl font-bold text-slate-800">{product.productName}</h3>
                    <p className="text-sm text-slate-500">{product.category}</p>
                </div>
                <p className="text-slate-600">{product.description}</p>
                 {product.productSalesUrl && (
                    <a href={product.productSalesUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-brand-secondary hover:text-brand-dark hover:underline">
                        <LinkIcon className="w-4 h-4" />
                        <span>{t.productSalesUrlShort}</span>
                    </a>
                )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
             <DetailItem label={t.retailPrice} value={formatCurrency(product.retailPrice)} />
             {renderGroupBuyPrice()}
             <div className="md:col-span-2 pt-2 border-t mt-2">
                 <p className="text-sm text-slate-500 font-medium mb-1">{t.supplyInfo}</p>
                 <div className="p-3 bg-slate-50 rounded-lg">
                    {renderSupplyInfo()}
                 </div>
            </div>
          </div>
        </div>

        <footer className="p-4 border-t bg-slate-50 text-right mt-auto">
          <button
            onClick={onClose}
            className="py-2 px-6 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
          >
            {t.closeButton}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ProductDetailsModal;