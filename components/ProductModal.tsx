
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { Language, User, Product, SupplyType } from '../types';
import { translations } from '../translations';
import { XIcon } from './icons/XIcon';
import { CATEGORIES } from './constants';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: User;
  productToEdit: Product | null;
  onSuccess: (message: string) => void;
}

interface ProductFormData {
  productName: string;
  productImageUrl: string;
  productSalesUrl: string;
  description: string;
  category: string;
  retailPrice: number | '';
  groupBuyPriceConfig: {
    type: 'fixed' | 'negotiable' | 'discretionary';
    value: number | '';
  };
  supplyConfig: {
    type: 'fixed' | 'negotiable';
    supplyType: SupplyType;
    value: number | '';
  };
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, language, user, productToEdit, onSuccess }) => {
  const t = translations[language];

  const initialState: ProductFormData = {
    productName: '',
    productImageUrl: '',
    productSalesUrl: '',
    description: '',
    category: '',
    retailPrice: '',
    groupBuyPriceConfig: { type: 'fixed', value: '' },
    supplyConfig: { type: 'fixed', supplyType: SupplyType.COMMISSION, value: '' },
  };
  
  const [formData, setFormData] = useState<ProductFormData>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        productName: productToEdit.productName,
        productImageUrl: productToEdit.productImageUrl,
        productSalesUrl: productToEdit.productSalesUrl || '',
        description: productToEdit.description,
        category: productToEdit.category,
        retailPrice: productToEdit.retailPrice,
        groupBuyPriceConfig: {
          type: productToEdit.groupBuyPriceConfig.type,
          value: productToEdit.groupBuyPriceConfig.value || '',
        },
        supplyConfig: {
          type: productToEdit.supplyConfig.type,
          supplyType: productToEdit.supplyConfig.supplyType || SupplyType.COMMISSION,
          value: productToEdit.supplyConfig.value || '',
        },
      });
    } else {
      setFormData(initialState);
    }
  }, [productToEdit, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNestedChange = (section: 'groupBuyPriceConfig' | 'supplyConfig', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { productName, productImageUrl, description, category, retailPrice, groupBuyPriceConfig, supplyConfig } = formData;
    
    let isDataValid = true;
    if (!productName || !productImageUrl || !description || !category || retailPrice === '') {
        isDataValid = false;
    }
    if (groupBuyPriceConfig.type === 'fixed' && groupBuyPriceConfig.value === '') {
        isDataValid = false;
    }
    if (supplyConfig.type === 'fixed' && (supplyConfig.value === '' || !supplyConfig.supplyType)) {
        isDataValid = false;
    }

    if (!isDataValid) {
        setError("모든 필수 필드를 입력해주세요.");
        setIsLoading(false);
        return;
    }

    try {
        if (productToEdit) {
            // Logic for UPDATING an existing product
            const productDataForUpdate: { [key: string]: any } = {
                productName,
                productImageUrl,
                productSalesUrl: formData.productSalesUrl,
                description,
                category,
                retailPrice: Number(retailPrice),
                'groupBuyPriceConfig.type': groupBuyPriceConfig.type,
                'supplyConfig.type': supplyConfig.type
            };

            if (groupBuyPriceConfig.type === 'fixed') {
                productDataForUpdate['groupBuyPriceConfig.value'] = Number(groupBuyPriceConfig.value);
            } else {
                productDataForUpdate['groupBuyPriceConfig.value'] = firebase.firestore.FieldValue.delete();
            }
            
            if (supplyConfig.type === 'fixed') {
                productDataForUpdate['supplyConfig.supplyType'] = supplyConfig.supplyType;
                productDataForUpdate['supplyConfig.value'] = Number(supplyConfig.value);
            } else {
                productDataForUpdate['supplyConfig.supplyType'] = firebase.firestore.FieldValue.delete();
                productDataForUpdate['supplyConfig.value'] = firebase.firestore.FieldValue.delete();
            }
            
            await db.collection('products').doc(productToEdit.id).update(productDataForUpdate);
            onSuccess(t.productUpdatedSuccess);
        } else {
            // Logic for ADDING a new product
            const productDataForAdd: any = {
                brandId: user.uid,
                brandName: user.companyName || user.name,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                productName,
                productImageUrl,
                productSalesUrl: formData.productSalesUrl,
                description,
                category,
                retailPrice: Number(retailPrice),
                groupBuyPriceConfig: { type: groupBuyPriceConfig.type },
                supplyConfig: { type: supplyConfig.type }
            };

            if (groupBuyPriceConfig.type === 'fixed') {
                productDataForAdd.groupBuyPriceConfig.value = Number(groupBuyPriceConfig.value);
            }
            
            if (supplyConfig.type === 'fixed') {
                productDataForAdd.supplyConfig.supplyType = supplyConfig.supplyType;
                productDataForAdd.supplyConfig.value = Number(supplyConfig.value);
            }

            await db.collection('products').add(productDataForAdd);
            onSuccess(t.productSubmittedSuccess);
        }
    } catch (err) {
        console.error("Error saving product: ", err);
        setError(t.productAddUpdateError);
    } finally {
        setIsLoading(false);
    }
  };

  const showNegotiableWarning = formData.groupBuyPriceConfig.type !== 'fixed' || formData.supplyConfig.type !== 'fixed';

  if (!isOpen) return null;
  
  const RadioButton = ({ name, value, checked, onChange, label }: {name: string, value: string, checked: boolean, onChange: (e:any) => void, label:string}) => (
    <button type="button" name={name} value={value} onClick={onChange} className={`p-3 rounded-lg border-2 text-center transition-all duration-200 w-full ${checked ? 'border-brand-primary bg-brand-light text-brand-dark font-bold' : 'border-slate-300 bg-white hover:border-brand-secondary'}`}>
        {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-800">{productToEdit ? t.editProduct : t.addProduct}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6" /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">{error}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-slate-700 mb-1">{t.productNameLabel}</label>
                <input id="productName" name="productName" type="text" value={formData.productName} onChange={handleInputChange} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" />
              </div>
               <div>
                <label htmlFor="productImageUrl" className="block text-sm font-medium text-slate-700 mb-1">{t.productImageUrl}</label>
                <input id="productImageUrl" name="productImageUrl" type="url" value={formData.productImageUrl} onChange={handleInputChange} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" />
              </div>
          </div>
          
          <div>
            <label htmlFor="productSalesUrl" className="block text-sm font-medium text-slate-700 mb-1">{t.productSalesUrl}</label>
            <input id="productSalesUrl" name="productSalesUrl" type="url" value={formData.productSalesUrl || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">{t.productDescription}</label>
            <textarea id="description" name="description" rows={3} value={formData.description} onChange={handleInputChange} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">{t.productCategory}</label>
                <select id="category" name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary">
                    <option value="" disabled>{t.selectCategory}</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="retailPrice" className="block text-sm font-medium text-slate-700 mb-1">{t.retailPrice}</label>
                <input id="retailPrice" name="retailPrice" type="number" value={formData.retailPrice} onChange={handleInputChange} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" />
              </div>
          </div>
          
          <div className="pt-4 border-t">
            <label className="block text-sm font-bold text-slate-700 mb-2">{t.groupBuyPriceConfigLabel}</label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <RadioButton name="groupBuyPriceType" value="fixed" checked={formData.groupBuyPriceConfig.type === 'fixed'} onChange={() => handleNestedChange('groupBuyPriceConfig', 'type', 'fixed')} label={t.priceTypeFixed} />
              <RadioButton name="groupBuyPriceType" value="negotiable" checked={formData.groupBuyPriceConfig.type === 'negotiable'} onChange={() => handleNestedChange('groupBuyPriceConfig', 'type', 'negotiable')} label={t.priceTypeNegotiable} />
              <RadioButton name="groupBuyPriceType" value="discretionary" checked={formData.groupBuyPriceConfig.type === 'discretionary'} onChange={() => handleNestedChange('groupBuyPriceConfig', 'type', 'discretionary')} label={t.priceTypeDiscretionary} />
            </div>
            {formData.groupBuyPriceConfig.type === 'fixed' && (
              <div className="animate-fade-in">
                <label htmlFor="groupBuyPrice" className="block text-sm font-medium text-slate-700 mb-1">{t.groupBuyPriceLabel}</label>
                <input id="groupBuyPrice" name="groupBuyPrice" type="number" value={formData.groupBuyPriceConfig.value} onChange={(e) => handleNestedChange('groupBuyPriceConfig', 'value', e.target.value)} placeholder={t.groupBuyPricePlaceholder} required className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" />
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
              <label className="block text-sm font-bold text-slate-700 mb-2">{t.supplyInfoConfigLabel}</label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                 <RadioButton name="supplyConfigType" value="fixed" checked={formData.supplyConfig.type === 'fixed'} onChange={() => handleNestedChange('supplyConfig', 'type', 'fixed')} label={t.valueFixed} />
                 <RadioButton name="supplyConfigType" value="negotiable" checked={formData.supplyConfig.type === 'negotiable'} onChange={() => handleNestedChange('supplyConfig', 'type', 'negotiable')} label={t.priceTypeNegotiable} />
              </div>
              {formData.supplyConfig.type === 'fixed' && (
                  <div className="space-y-4 p-4 bg-slate-50 rounded-lg animate-fade-in">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t.supplyType}</label>
                        <div className="grid grid-cols-2 gap-3">
                            <RadioButton name="supplyType" value={SupplyType.COMMISSION} checked={formData.supplyConfig.supplyType === SupplyType.COMMISSION} onChange={() => handleNestedChange('supplyConfig', 'supplyType', SupplyType.COMMISSION)} label={t.supplyType_COMMISSION}/>
                            <RadioButton name="supplyType" value={SupplyType.FIXED} checked={formData.supplyConfig.supplyType === SupplyType.FIXED} onChange={() => handleNestedChange('supplyConfig', 'supplyType', SupplyType.FIXED)} label={t.supplyType_FIXED}/>
                        </div>
                    </div>
                    <div>
                      {formData.supplyConfig.supplyType === SupplyType.COMMISSION ? (
                          <>
                              <label htmlFor="supplyValue" className="block text-sm font-medium text-slate-700 mb-1">{t.commissionRate}</label>
                              <input id="supplyValue" name="supplyValue" type="number" value={formData.supplyConfig.value} onChange={(e) => handleNestedChange('supplyConfig', 'value', e.target.value)} placeholder={t.productCommissionRatePlaceholder} required className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" />
                          </>
                      ) : (
                          <>
                              <label htmlFor="supplyValue" className="block text-sm font-medium text-slate-700 mb-1">{t.supplyPrice}</label>
                              <input id="supplyValue" name="supplyValue" type="number" value={formData.supplyConfig.value} onChange={(e) => handleNestedChange('supplyConfig', 'value', e.target.value)} placeholder={t.supplyPricePlaceholder} required className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" />
                          </>
                      )}
                    </div>
                  </div>
              )}
          </div>
          
          {showNegotiableWarning && (
            <div className="p-3 mt-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex">
                <div className="flex-shrink-0"><ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" /></div>
                <div className="ml-3"><p className="text-sm text-yellow-800">{t.negotiablePriceWarning}</p></div>
              </div>
            </div>
          )}

        </div>

        <div className="p-6 border-t bg-slate-50 rounded-b-2xl mt-auto">
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-white font-bold bg-brand-primary hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300">
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : t.saveChanges}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ProductModal;