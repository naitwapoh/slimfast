import React from 'react';
import { ShoppingBag, Eye, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product, onViewDetails }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const isLowStock = !isOutOfStock && (product.stock ?? 0) <= (product.lowStockThreshold || 10);

  return (
    <div className="bg-white rounded-3xl border border-brand-leaf/25 shadow-herbal hover:shadow-herbal-lg transition-all duration-300 flex flex-col overflow-hidden group">
      
      {/* Product Image Area */}
      <div className="relative bg-gradient-to-br from-brand-surface to-brand-surface/40 p-4 sm:p-6 flex items-center justify-center min-h-[220px] sm:min-h-[260px] overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-44 sm:h-48 object-contain transform group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/logo.jpg';
            }}
          />
        ) : (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-brand-forest/10 border border-brand-leaf/30 flex flex-col items-center justify-center text-brand-forest p-3 text-center">
            <span className="text-2xl sm:text-3xl mb-1">🌿</span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-brand-charcoal">SLIMFAST</span>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-red-100 text-red-700 text-[10px] sm:text-xs font-bold rounded-full border border-red-200">
              {t('products.outOfStock')}
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-bold rounded-full border border-amber-200">
              {t('products.lowStock', { count: product.stock })}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-brand-forest/10 text-brand-forest text-[10px] sm:text-xs font-bold rounded-full border border-brand-forest/20 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-leaf" />
              <span>{t('products.inStock')}</span>
            </span>
          )}
        </div>

        {/* Batch Expiry Badge */}
        {product.expiryDate && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm px-2 sm:px-2.5 py-0.5 rounded-md border border-brand-leaf/30 text-[9px] sm:text-[10px] font-bold text-brand-charcoal">
            Exp: {product.expiryDate}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        <div>
          <div className="flex items-center space-x-1 text-[10px] sm:text-[11px] font-bold text-brand-leaf uppercase tracking-wider">
            <span>{product.category || '100% Herbal'}</span>
            {product.netWeight && <span>• {product.netWeight}</span>}
          </div>

          <h3 className="text-lg sm:text-xl font-bold font-serif text-brand-forest mt-1 group-hover:text-brand-leaf transition-colors leading-snug">
            {product.name}
          </h3>

          <p className="text-xs text-brand-charcoal/70 line-clamp-2 mt-1 sm:mt-1.5">
            {product.directions || product.description || 'Natural herbal remedy formulated for healthy, sustainable weight loss and digestive cleanse.'}
          </p>

          {/* Quick ingredients pill preview */}
          {product.ingredients && (
            <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1">
              {product.ingredients.split(',').slice(0, 3).map((item, idx) => (
                <span key={idx} className="inline-block px-1.5 sm:px-2 py-0.5 bg-brand-surface text-brand-charcoal text-[9px] sm:text-[10px] font-medium rounded-md border border-brand-leaf/20">
                  {item.trim()}
                </span>
              ))}
              {product.ingredients.split(',').length > 3 && (
                <span className="text-[9px] sm:text-[10px] text-brand-muted font-bold self-center">
                  +{product.ingredients.split(',').length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing and Action Buttons */}
        <div className="pt-3 border-t border-brand-surface flex items-center justify-between gap-2">
          <div>
            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-brand-muted">
              {t('products.price')}
            </div>
            <div className="text-base sm:text-lg font-black text-brand-forest">
              {formatPrice(product.priceTZS || product.price || 0)}
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              type="button"
              onClick={() => onViewDetails(product)}
              className="p-2 sm:p-2.5 rounded-xl border border-brand-leaf/30 text-brand-charcoal hover:bg-brand-surface hover:text-brand-forest transition-colors"
              title={t('products.viewDetails')}
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => addToCart(product, 1)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all duration-200 ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-forest hover:bg-brand-leaf text-white hover:shadow-md'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? t('products.outOfStock') : t('products.addToCart')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
