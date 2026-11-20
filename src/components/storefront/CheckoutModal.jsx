import React, { useState } from 'react';
import { X, CheckCircle, Phone, MapPin, CreditCard, MessageSquare, AlertCircle } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';

export const CheckoutModal = ({ onClose }) => {
  const { t } = useLanguage();
  const { currency, formatPrice, convertPrice } = useCurrency();
  const { items, subtotalTZS, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: 'Tanzania',
    city: '',
    address: '',
    paymentMethod: 'Mobile Money (M-Pesa, Tigo Pesa, Airtel Money)'
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  const countries = [
    'Tanzania',
    'Kenya',
    'Uganda',
    'Rwanda',
    'Burundi',
    'DR Congo',
    'Nigeria',
    'South Africa',
    'Other African Country'
  ];

  const paymentOptions = [
    { id: 'mobile_money', label: t('checkout.mobileMoney') },
    { id: 'cash_on_delivery', label: t('checkout.cashOnDelivery') },
    { id: 'bank_card', label: t('checkout.bankCard') },
  ];

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.city || !formData.address) {
      setErrorMessage('Please fill in all delivery details.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const orderId = 'SF-' + Math.floor(100000 + Math.random() * 900000);
    const totalInCurrentCurrency = convertPrice(subtotalTZS, currency);

    const orderData = {
      orderId,
      customerName: formData.fullName,
      phoneNumber: formData.phone,
      country: formData.country,
      city: formData.city,
      address: formData.address,
      paymentMethod: formData.paymentMethod,
      items: items.map(it => ({
        id: it.id,
        name: it.name,
        priceTZS: it.priceTZS,
        quantity: it.quantity
      })),
      totalTZS: subtotalTZS,
      totalConverted: totalInCurrentCurrency,
      currency: currency,
      channel: 'online',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Write order to Firestore
      if (db) {
        await addDoc(collection(db, 'orders'), orderData);

        // 2. Decrement stock in Firestore products collection
        for (const it of items) {
          try {
            const productRef = doc(db, 'products', it.id);
            await updateDoc(productRef, {
              stock: increment(-it.quantity)
            });
          } catch (stkErr) {
            console.warn('Could not decrement stock for item:', it.id, stkErr);
          }
        }
      }

      setCompletedOrder({
        ...orderData,
        orderId
      });
      clearCart();
    } catch (err) {
      console.error('Order submission error:', err);
      setErrorMessage(err.message || 'Error recording order. Please try again or order directly via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp Order Confirmation Generator
  const generateWhatsAppLink = () => {
    if (!completedOrder) return '#';
    const itemsSummary = completedOrder.items
      .map(i => `${i.quantity}x ${i.name}`)
      .join(', ');

    const message = t('checkout.whatsappTemplate', {
      orderId: completedOrder.orderId,
      items: itemsSummary,
      total: formatPrice(completedOrder.totalTZS, completedOrder.currency),
      name: completedOrder.customerName,
      city: completedOrder.city,
      country: completedOrder.country
    });

    return `https://wa.me/255752613616?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-brand-leaf/30 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-brand-surface hover:bg-brand-leaf/20 text-brand-charcoal transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {completedOrder ? (
          
          /* Order Success View */
          <div className="p-6 sm:p-8 text-center space-y-5 sm:space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-brand-forest/10 border border-brand-leaf/30 flex items-center justify-center text-brand-forest">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-brand-leaf animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-leaf">
                {t('checkout.successBadge')}
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-serif text-brand-forest">
                {t('checkout.successTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-brand-charcoal/80 max-w-md mx-auto">
                {t('checkout.successSubtitle')}
              </p>
            </div>

            {/* Order Card Preview */}
            <div className="bg-brand-surface p-4 rounded-2xl border border-brand-leaf/30 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-brand-leaf/20 pb-2">
                <span className="font-bold text-brand-muted">Order ID:</span>
                <span className="font-mono font-black text-brand-forest">#{completedOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Recipient:</span>
                <span className="font-bold text-brand-charcoal">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Phone / WhatsApp:</span>
                <span className="font-bold text-brand-charcoal">{completedOrder.phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Destination:</span>
                <span className="font-bold text-brand-charcoal">{completedOrder.city}, {completedOrder.country}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-brand-leaf/20 text-sm font-bold">
                <span className="text-brand-forest">Total Payable:</span>
                <span className="text-brand-leaf font-black">{formatPrice(completedOrder.totalTZS, completedOrder.currency)}</span>
              </div>
            </div>

            {/* Click to WhatsApp CTA Button */}
            <div className="space-y-3 pt-2">
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm sm:text-base shadow-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>{t('checkout.confirmWhatsAppBtn')}</span>
              </a>
              <p className="text-[11px] text-brand-muted">
                Pre-filled order directed to SLIMFAST Dispatch: <strong className="text-brand-forest">+255 752 613 616</strong>
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-brand-charcoal hover:underline"
              >
                Return to Store
              </button>
            </div>
          </div>

        ) : (

          /* Checkout Form */
          <div className="p-5 sm:p-8">
            <div className="mb-5 sm:mb-6 pr-8">
              <h3 className="text-xl sm:text-2xl font-black font-serif text-brand-forest">
                {t('checkout.title')}
              </h3>
              <p className="text-xs text-brand-charcoal/70 mt-1">
                {t('checkout.subtitle')}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('checkout.fullName')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grace Mwangi"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-brand-leaf/30 text-xs sm:text-sm focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/30"
                />
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('checkout.phone')} (WhatsApp) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-brand-muted" />
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    placeholder="+255 752 613 616 / +254 7..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-brand-leaf/30 text-xs sm:text-sm focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/30"
                  />
                </div>
              </div>

              {/* Country & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    {t('checkout.country')} *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-brand-leaf/30 text-xs sm:text-sm focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/30"
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    {t('checkout.city')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dar es Salaam / Nairobi"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-brand-leaf/30 text-xs sm:text-sm focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/30"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('checkout.address')} *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-brand-muted" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kinondoni / Westlands / Kololo"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-brand-leaf/30 text-xs sm:text-sm focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/30"
                  />
                </div>
              </div>

              {/* Payment Method Preference */}
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('checkout.paymentMethod')}
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-brand-leaf/30 text-xs sm:text-sm focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/30"
                >
                  <option value="Mobile Money (M-Pesa, Tigo Pesa, Airtel Money, MTN)">
                    Mobile Money (M-Pesa / Tigo Pesa / Airtel Money / MTN)
                  </option>
                  <option value="Cash on Delivery">
                    Cash on Delivery (Available in major cities)
                  </option>
                  <option value="Bank Transfer / Card">
                    Bank Transfer / Visa / MasterCard
                  </option>
                </select>
              </div>

              {/* Order Items Review Mini Box */}
              <div className="bg-brand-surface p-3.5 rounded-xl border border-brand-leaf/20 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-brand-forest">
                  <span>Selected Products ({items.length}):</span>
                  <span>{formatPrice(subtotalTZS)}</span>
                </div>
                <div className="text-[11px] text-brand-muted">
                  {items.map(i => `${i.quantity}x ${i.name}`).join(' • ')}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm shadow-herbal flex items-center justify-center space-x-2 transition-all ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-brand-forest hover:bg-brand-leaf text-white hover:shadow-lg'
                }`}
              >
                <span>{loading ? 'Processing Order...' : t('checkout.submitOrder')}</span>
              </button>

              <p className="text-[10px] text-center text-brand-muted">
                Order will be confirmed with our dispatch team on WhatsApp (+255 752 613 616)
              </p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
