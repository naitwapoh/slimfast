import React from 'react';
import { X, CheckCircle, ShieldCheck, HeartPulse, Sparkles, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';

export const ProductDetailsModal = ({ product, onClose }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  if (!product) return null;

  const isOutOfStock = (product.stock ?? 0) <= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-brand-leaf/30 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-brand-surface hover:bg-brand-leaf/20 text-brand-charcoal hover:text-brand-forest transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header & Product identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-brand-leaf/20 pb-6">
            <div className="w-36 h-36 shrink-0 bg-brand-surface rounded-2xl p-4 flex items-center justify-center border border-brand-leaf/30">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-5xl">🌿</span>
              )}
            </div>

            <div className="text-center sm:text-left flex-1 space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-leaf/15 text-brand-forest text-xs font-bold uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{product.category || 'SLIMFAST Organic Formula'}</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-brand-forest">
                {product.name}
              </h2>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                <span className="text-2xl font-black text-brand-leaf">
                  {formatPrice(product.priceTZS || product.price || 0)}
                </span>
                {product.netWeight && (
                  <span className="text-xs bg-brand-surface px-2.5 py-1 rounded-md text-brand-muted font-bold border border-brand-leaf/20">
                    {t('products.netWeight')}: {product.netWeight}
                  </span>
                )}
                {product.expiryDate && (
                  <span className="text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md font-bold border border-amber-200">
                    {t('products.batchExpiry')}: {product.expiryDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Key Botanicals & Ingredients */}
          {product.ingredients && (
            <div className="bg-brand-surface/60 rounded-2xl p-4 border border-brand-leaf/20">
              <h4 className="text-xs uppercase font-extrabold text-brand-forest tracking-wider mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-brand-leaf" />
                <span>{t('products.ingredients')}</span>
              </h4>
              <p className="text-sm text-brand-charcoal font-medium leading-relaxed">
                {product.ingredients}
              </p>
            </div>
          )}

          {/* Directions for Use */}
          {product.directions && (
            <div className="bg-white rounded-2xl p-4 border border-brand-leaf/30 shadow-sm">
              <h4 className="text-xs uppercase font-extrabold text-brand-forest tracking-wider mb-2 flex items-center space-x-1.5">
                <HeartPulse className="w-4 h-4 text-brand-leaf" />
                <span>{t('products.directions')}</span>
              </h4>
              <p className="text-sm text-brand-charcoal font-medium leading-relaxed">
                {product.directions}
              </p>
            </div>
          )}

          {/* Benefits */}
          {product.benefits && (
            <div>
              <h4 className="text-xs uppercase font-extrabold text-brand-forest tracking-wider mb-3">
                {t('products.benefits')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Array.isArray(product.benefits) ? product.benefits : product.benefits.split(',')).map((benefit, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs font-semibold text-brand-charcoal bg-brand-surface/50 p-2.5 rounded-xl border border-brand-leaf/15">
                    <CheckCircle className="w-4 h-4 text-brand-leaf shrink-0 mt-0.5" />
                    <span>{typeof benefit === 'string' ? benefit.trim() : benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-brand-leaf/20 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-brand-muted block font-medium">Availability</span>
              <span className={`text-sm font-bold ${isOutOfStock ? 'text-red-600' : 'text-brand-forest'}`}>
                {isOutOfStock ? t('products.outOfStock') : `${product.stock ?? 0} units ready in store`}
              </span>
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => {
                addToCart(product, 1);
                onClose();
              }}
              className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-md transition-all ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-forest hover:bg-brand-leaf text-white hover:shadow-lg'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? t('products.outOfStock') : t('products.addToCart')}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
