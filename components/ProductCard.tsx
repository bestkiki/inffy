import React from 'react';
import { Product, Language } from '../types';
import { translations } from '../translations';

interface ProductCardProps {
  product: Product;
  language: Language;
  onViewDetails: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, language, onViewDetails }) => {
  const t = translations[language];

  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col group">
      <div className="relative">
        <img className="w-full h-48 object-cover" src={product.productImageUrl} alt={product.productName} />
        <div className="absolute top-2 right-2 px-2 py-1 bg-brand-primary/80 text-white text-xs font-bold rounded-full backdrop-blur-sm">
          {product.category}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-sm text-slate-500">{product.brandName}</p>
        <h3 className="text-lg font-bold text-slate-800 leading-tight truncate mt-1">{product.productName}</h3>
        <p className="mt-2 text-xl font-semibold text-brand-primary">{formatCurrency(product.retailPrice)}</p>
        <div className="mt-auto pt-4">
          <button onClick={onViewDetails} className="w-full bg-brand-primary text-white font-semibold py-2 rounded-lg hover:bg-brand-dark transition-colors">
            {t.viewDetails}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
