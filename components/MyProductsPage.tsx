


import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { User, Language, Product } from '../types';
import { translations } from '../translations';
import { CubeIcon } from './icons/CubeIcon';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import ProductModal from './ProductModal';
import { LinkIcon } from './icons/LinkIcon';

interface MyProductsPageProps {
  user: User;
  language: Language;
}

const MyProductsPage: React.FC<MyProductsPageProps> = ({ user, language }) => {
  const t = translations[language];
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = db.collection('products')
      .where('brandId', '==', user.uid)
      .onSnapshot(snapshot => {
        const productData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        
        productData.sort((a, b) => {
            const dateA = a.createdAt as firebase.firestore.Timestamp;
            const dateB = b.createdAt as firebase.firestore.Timestamp;
            return (dateB?.toMillis?.() || 0) - (dateA?.toMillis?.() || 0);
        });

        setProducts(productData);
        setIsLoading(false);
      }, error => {
        console.error("Error fetching products:", error);
        setIsLoading(false);
      });

    return () => unsubscribe();
  }, [user.uid]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleModalSuccess = (message: string) => {
    setNotification({ type: 'success', message });
    handleModalClose();
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleToggleArchive = async (product: Product, archive: boolean) => {
    const newStatus = archive ? 'archived' : 'pending'; // Restore to pending for re-review
    const successMessage = archive ? t.productArchived : t.productRestored;
    try {
      await db.collection('products').doc(product.id).update({ status: newStatus });
      setNotification({ type: 'success', message: successMessage });
    } catch (error) {
      console.error("Error updating product status:", error);
      setNotification({ type: 'error', message: 'Error updating status' });
    }
    setTimeout(() => setNotification(null), 4000);
  };
  
  const getStatusChip = (status: Product['status']) => {
    const statusText = t[`product_status_${status}`] || status;
    let colorClasses = 'text-slate-800 bg-slate-100';
    if (status === 'active') colorClasses = 'text-green-800 bg-green-100';
    if (status === 'rejected') colorClasses = 'text-red-800 bg-red-100';
    if (status === 'pending') colorClasses = 'text-yellow-800 bg-yellow-100';
    if (status === 'archived') colorClasses = 'text-gray-800 bg-gray-100';
    return <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${colorClasses}`}>{statusText}</span>;
  }

  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };
  
  const renderSupplyInfo = (product: Product) => {
    // Defensive coding: check if supplyConfig exists for legacy data
    if (!product.supplyConfig) {
      return '--';
    }

    if (product.supplyConfig.type === 'negotiable') {
      return <span className="px-3 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">{t.priceTypeNegotiable}</span>
    }
    
    if (product.supplyConfig.type === 'fixed' && product.supplyConfig.supplyType && product.supplyConfig.value !== undefined) {
      const { supplyType, value } = product.supplyConfig;
      return (
        <div>
            <p className="font-semibold">{t[`supplyType_${supplyType}`]}</p>
            <p>{supplyType === 'COMMISSION' ? `${value}%` : formatCurrency(value)}</p>
        </div>
      );
    }
    
    return '--';
  };

  const displayedProducts = products.filter(p => showArchived ? p.status === 'archived' : p.status !== 'archived');

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-slate-800">{t.myProductsTitle}</h2>
            <div className="flex items-center gap-4">
                 <button
                    onClick={() => setShowArchived(!showArchived)}
                    className="flex items-center gap-2 py-2 px-4 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                >
                    {showArchived ? (
                        <>
                           <CubeIcon className="w-5 h-5"/>
                           <span>{t.showActiveProducts}</span>
                        </>
                    ) : (
                        <>
                           <ArchiveBoxIcon className="w-5 h-5"/>
                           <span>{t.showArchivedProducts}</span>
                        </>
                    )}
                </button>
                <button onClick={handleAddNewProduct} className="flex items-center gap-2 py-2 px-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors">
                    <PlusIcon className="w-5 h-5"/>
                    <span>{t.addProduct}</span>
                </button>
            </div>
        </div>

        {notification && (
            <div className={`p-4 rounded-lg flex items-center ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {notification.type === 'success' ? <CheckIcon className="w-6 h-6 mr-3"/> : <XCircleIcon className="w-6 h-6 mr-3"/>}
                <span className="font-semibold">{notification.message}</span>
            </div>
        )}

        {isLoading ? (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary"></div>
            </div>
        ) : displayedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-md">
                <CubeIcon className="w-16 h-16 mx-auto text-slate-300" />
                <h3 className="mt-4 text-2xl font-bold text-slate-800">{showArchived ? t.noArchivedProducts : t.noProducts}</h3>
                <p className="mt-2 text-slate-500">{showArchived ? t.noArchivedProductsDesc : t.noProductsDesc}</p>
            </div>
        ) : (
            <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
                <table className="w-full min-w-max text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.product}</th>
                            <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.status}</th>
                            <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.retailPrice}</th>
                            <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider">{t.supplyInfo}</th>
                            <th className="p-4 text-sm font-semibold text-slate-600 tracking-wider text-center">{t.actionsLabel}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {displayedProducts.map(product => (
                            <tr key={product.id}>
                                <td className="p-4">
                                    <div className="flex items-center gap-4">
                                        <img src={product.productImageUrl} alt={product.productName} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                                        <div>
                                            <p className="font-medium text-slate-800">{product.productName}</p>
                                            <p className="text-sm text-slate-500">{product.category}</p>
                                            {product.productSalesUrl && (
                                                <a href={product.productSalesUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-brand-secondary hover:text-brand-dark hover:underline">
                                                    <LinkIcon className="w-3 h-3" />
                                                    <span>{t.productSalesUrlShort}</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">{getStatusChip(product.status)}</td>
                                <td className="p-4 text-slate-600">{formatCurrency(product.retailPrice)}</td>
                                <td className="p-4 text-slate-600">
                                    {renderSupplyInfo(product)}
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-center items-center space-x-2">
                                        <button onClick={() => handleEditProduct(product)} className="p-2 text-slate-500 hover:text-brand-primary rounded-full transition-colors" title={t.editProduct}><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleToggleArchive(product, product.status !== 'archived')} className="p-2 text-slate-500 hover:text-red-500 rounded-full transition-colors" title={product.status === 'archived' ? t.restore : t.archive}>
                                            {product.status !== 'archived' ? <ArchiveBoxIcon className="w-5 h-5"/> : <ArrowUturnLeftIcon className="w-5 h-5"/>}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        language={language}
        user={user}
        productToEdit={editingProduct}
        onSuccess={handleModalSuccess}
      />
    </>
  );
};

export default MyProductsPage;