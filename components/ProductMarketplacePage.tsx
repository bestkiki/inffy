import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { Product, Language } from '../types';
import { translations } from '../translations';
import { CATEGORIES } from './constants';
import ProductCard from './ProductCard';
import { SearchIcon } from './icons/SearchIcon';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon';

interface ProductMarketplacePageProps {
  language: Language;
  onViewProduct: (productId: string) => void;
}

const ProductMarketplacePage: React.FC<ProductMarketplacePageProps> = ({ language, onViewProduct }) => {
  const t = translations[language];
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const snapshot = await db.collection('products').where('status', '==', 'active').orderBy('createdAt', 'desc').get();
        const productData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Product[];
        setProducts(productData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const nameMatch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
      return nameMatch && categoryMatch;
    });
  }, [products, searchTerm, selectedCategory]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-3xl font-bold text-slate-800">{t.productMarketTitle}</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchByProductName}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-100 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary border-transparent"
              aria-label={t.filterByCategory}
            >
              <option value="all">{t.allCategories}</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              language={language}
              onViewDetails={() => onViewProduct(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <ShoppingBagIcon className="w-16 h-16 mx-auto text-slate-300" />
            <h3 className="mt-4 text-2xl font-bold text-slate-800">{t.noProductsFound}</h3>
            <p className="mt-2 text-slate-500">{t.noProductsFoundDesc}</p>
        </div>
      )}
    </div>
  );
};

export default ProductMarketplacePage;
