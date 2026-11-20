import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../context/LanguageContext';
import { ProductCard } from './ProductCard';
import { ProductDetailsModal } from './ProductDetailsModal';
import { Leaf } from 'lucide-react';

// The 2 official core SLIMFAST products (25,000 TZS each) + Complete Combo (50,000 TZS)
export const DEFAULT_SLIMFAST_PRODUCTS = [
  {
    id: "sf-slimming-tea",
    name: "SLIMFAST Best Slimming Tea (Jar)",
    category: "Slimming Tea",
    priceTZS: 25000,
    stock: 50,
    lowStockThreshold: 10,
    batchNumber: "SF-TEA-2025",
    expiryDate: "FEB 2027",
    netWeight: "150g Jar",
    ingredients: "Moringa oleifera, Black Pepper, Great Basil, Garcinia Cambogia, Fennel",
    directions: "1 teaspoon in boiling water, steep 4 minutes, 1 cup daily before bed.",
    benefits: "Visceral belly fat burn, Digestive detox, Anti-bloating, Metabolism boost, Blood sugar support",
    imageUrl: "/slimming-tea.jpg"
  },
  {
    id: "sf-bean-powder",
    name: "SLIMFAST Bean Powder for Weight Loss (250g Pouch)",
    category: "Bean Powder",
    priceTZS: 25000,
    stock: 50,
    lowStockThreshold: 10,
    batchNumber: "SF-BP-2025",
    expiryDate: "FEB 2027",
    netWeight: "250g Pouch",
    ingredients: "Unroasted Arabica AAA Decaffeinated Beans, Green Tea Extracts, Dandelion Purifying Herbs",
    directions: "1 coffee spoon in boiling water every morning before or during breakfast.",
    benefits: "Appetite suppression, Thermogenesis, Cholesterol balance, Clean all-day vitality",
    imageUrl: "/bean-powder.jpg"
  },
  {
    id: "sf-full-combo",
    name: "SLIMFAST Complete Duo Combo (Tea + Bean Powder)",
    category: "Combo Treatment",
    priceTZS: 50000,
    stock: 40,
    lowStockThreshold: 5,
    batchNumber: "SF-COMBO-2025",
    expiryDate: "FEB 2027",
    netWeight: "Tea (150g) + Bean Powder (250g)",
    ingredients: "Morning Arabica Bean Powder + Evening Moringa Slimming Tea synergistic treatment",
    directions: "Morning: 1 spoon Bean Powder with breakfast. Evening: 1 cup Slimming Tea before sleep.",
    benefits: "Full 24-hour fat burn, appetite control, total digestive cleansing & body detox",
    imageUrl: "/duo-combo.jpg"
  }
];

export const ProductCatalog = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState(DEFAULT_SLIMFAST_PRODUCTS);
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
        if (!snapshot.empty) {
          const items = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
          setProducts(items);
        } else {
          // If Firestore collection has not been seeded yet, present official default products
          setProducts(DEFAULT_SLIMFAST_PRODUCTS);
        }
        setLoading(false);
      }, (err) => {
        console.warn('Firestore products fetch notice:', err.message);
        setProducts(DEFAULT_SLIMFAST_PRODUCTS);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error('Failed to listen to products:', e);
      setProducts(DEFAULT_SLIMFAST_PRODUCTS);
      setLoading(false);
    }
  }, []);

  const categories = ['ALL', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = filterCategory === 'ALL'
    ? products
    : products.filter(p => p.category === filterCategory);

  return (
    <section id="products" className="py-12 sm:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14 space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-surface border border-brand-leaf/30 text-brand-forest text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5 text-brand-leaf" />
            <span>{t('brandSubtitle')}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif text-brand-forest">
            {t('products.title')}
          </h2>

          <p className="text-sm sm:text-base text-brand-charcoal/80 leading-relaxed font-normal max-w-xl mx-auto">
            {t('products.subtitle')}
          </p>
        </div>

        {/* Category Filter Pills (Mobile friendly horizontal scroll / wrap) */}
        {categories.length > 2 && (
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-3 mb-8 gap-2 no-scrollbar px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  filterCategory === cat
                    ? 'bg-brand-forest text-white shadow-md'
                    : 'bg-brand-surface text-brand-charcoal hover:bg-brand-leaf/10 border border-brand-leaf/20'
                }`}
              >
                {cat === 'ALL' ? t('products.allCategories') : cat}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={(prod) => setSelectedProduct(prod)}
            />
          ))}
        </div>

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
