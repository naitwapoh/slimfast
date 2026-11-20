import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../context/LanguageContext';
import { ProductCard } from './ProductCard';
import { ProductDetailsModal } from './ProductDetailsModal';
import { Leaf, PackageOpen, Sparkles, Filter } from 'lucide-react';

export const ProductCatalog = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const q = collection(db, 'products');
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setProducts(items);
        setLoading(false);
      }, (err) => {
        console.warn('Firestore products fetch notice:', err.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error('Failed to listen to products:', e);
      setLoading(false);
    }
  }, []);

  const categories = ['ALL', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = filterCategory === 'ALL'
    ? products
    : products.filter(p => p.category === filterCategory);

  return (
    <section id="products" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-surface border border-brand-leaf/30 text-brand-forest text-xs font-bold uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5 text-brand-leaf" />
            <span>{t('brandSubtitle')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-brand-forest">
            {t('products.title')}
          </h2>

          <p className="text-base text-brand-charcoal/80 leading-relaxed font-normal">
            {t('products.subtitle')}
          </p>
        </div>

        {/* Categories Bar (Only if products exist) */}
        {products.length > 0 && categories.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterCategory === cat
                    ? 'bg-brand-forest text-white shadow-md'
                    : 'bg-brand-surface text-brand-charcoal hover:bg-brand-leaf/15 border border-brand-leaf/20'
                }`}
              >
                {cat === 'ALL' ? t('all') : cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-brand-leaf/30 border-t-brand-forest rounded-full animate-spin" />
            <p className="text-sm font-semibold text-brand-muted">{t('loading')}</p>
          </div>
        ) : products.length === 0 ? (
          
          /* Clean Empty State (Strictly compliant with No Demo Data Rule) */
          <div className="max-w-xl mx-auto text-center py-16 px-6 bg-brand-surface/70 rounded-3xl border border-dashed border-brand-leaf/40 space-y-4 shadow-sm">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white flex items-center justify-center text-brand-muted shadow-sm">
              <PackageOpen className="w-10 h-10 text-brand-leaf" />
            </div>
            
            <h3 className="text-2xl font-bold font-serif text-brand-forest">
              {t('products.emptyTitle')}
            </h3>

            <p className="text-sm text-brand-charcoal/70 leading-relaxed max-w-md mx-auto">
              {t('products.emptyDesc')}
            </p>

            <div className="pt-2">
              <a
                href="#portal"
                className="inline-flex items-center space-x-2 text-xs font-bold text-brand-forest hover:text-brand-leaf underline underline-offset-4"
              >
                <span>{t('portalLink')}</span>
              </a>
            </div>
          </div>

        ) : (

          /* Product Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        )}

      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
};

