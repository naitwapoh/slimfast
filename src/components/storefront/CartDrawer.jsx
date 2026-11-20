import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';
import { CheckoutModal } from './CheckoutModal';

export const CartDrawer = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotalTZS
  } = useCart();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={() => setIsCartOpen(false)}
      >
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div 
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-brand-leaf/20 flex items-center justify-between bg-brand-surface">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-brand-forest" />
                <h3 className="text-lg font-bold font-serif text-brand-forest">
                  {t('cart.title')} ({items.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-white text-brand-charcoal transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-brand-surface flex items-center justify-center text-brand-muted">
                    <ShoppingBag className="w-8 h-8 text-brand-leaf" />
                  </div>
                  <h4 className="text-base font-bold text-brand-forest">
                    {t('cart.emptyTitle')}
                  </h4>
                  <p className="text-xs text-brand-charcoal/70 max-w-xs mx-auto">
                    {t('cart.emptyDesc')}
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center space-x-4 p-3.5 bg-brand-surface/50 rounded-2xl border border-brand-leaf/20"
                  >
                    <div className="w-16 h-16 shrink-0 bg-white rounded-xl p-1.5 flex items-center justify-center border border-brand-leaf/20">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/leaf.svg';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-brand-forest truncate font-serif">
                        {item.name}
                      </h4>
                      <p className="text-xs font-bold text-brand-leaf mt-0.5">
                        {formatPrice(item.priceTZS)}
                      </p>

                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-white border border-brand-leaf/30 flex items-center justify-center text-brand-charcoal hover:bg-brand-surface"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-md bg-white border border-brand-leaf/30 flex items-center justify-center text-brand-charcoal hover:bg-brand-surface"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-brand-muted hover:text-red-600 transition-colors"
                      title={t('cart.remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout Button */}
            {items.length > 0 && (
              <div className="p-6 border-t border-brand-leaf/20 bg-brand-surface space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-brand-charcoal">
                    <span>{t('cart.subtotal')}</span>
                    <span className="font-bold text-sm text-brand-forest">
                      {formatPrice(subtotalTZS)}
                    </span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>{t('cart.delivery')}</span>
                    <span>{t('cart.deliveryCalculated')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-leaf/20 flex justify-between items-center">
                  <span className="text-sm font-bold text-brand-charcoal">{t('cart.total')}</span>
                  <span className="text-xl font-black text-brand-forest font-serif">
                    {formatPrice(subtotalTZS)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutModalOpen(true);
                  }}
                  className="w-full py-4 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white font-bold text-sm shadow-herbal flex items-center justify-center space-x-2 transition-all duration-200"
                >
                  <span>{t('cart.checkoutButton')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full text-center text-xs text-brand-muted hover:text-red-600 font-semibold transition-colors"
                >
                  {t('cart.clearCart')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pan-African Checkout Modal */}
      {checkoutModalOpen && (
        <CheckoutModal onClose={() => setCheckoutModalOpen(false)} />
      )}
    </>
  );
};

