import React, { useState } from 'react';
import { X, CheckCircle, Phone, MapPin, CreditCard, MessageSquare, AlertCircle } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-brand-leaf/30 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-brand-surface hover:bg-brand-leaf/20 text-brand-charcoal transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {completedOrder ? (
          
          /* Order Success View */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-brand-forest/10 border border-brand-leaf/30 flex items-center justify-center text-brand-forest">
              <CheckCircle className="w-10 h-10 text-brand-leaf animate-bounce" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold text-brand-leaf tracking-wider block">
                SLIMFAST Pan-African Dispatch
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-brand-forest mt-1">
                {t('checkout.orderSuccessTitle')}
              </h2>
              <p className="text-sm text-brand-charcoal/80 mt-2 max-w-md mx-auto leading-relaxed">
                {t('checkout.orderSuccessDesc', { orderId: completedOrder.orderId })}
              </p>
            </div>

            {/* Order Recap Box */}
            <div className="bg-brand-surface rounded-2xl p-5 text-left text-xs space-y-2 border border-brand-leaf/20">
              <div className="flex justify-between">
                <span className="text-brand-muted">Order ID:</span>
                <span className="font-bold text-brand-forest">#{completedOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Recipient:</span>
                <span className="font-bold">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Destination:</span>
                <span className="font-bold">{completedOrder.city}, {completedOrder.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Total:</span>
                <span className="font-extrabold text-brand-forest text-sm">
                  {formatPrice(completedOrder.totalTZS, completedOrder.currency)}
                </span>
              </div>
            </div>

            {/* WhatsApp Confirmation Action Button */}
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm shadow-md flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              <span>{t('checkout.confirmWhatsApp')}</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-brand-muted hover:text-brand-forest transition-colors"
            >
              {t('checkout.backToShop')}
            </button>
          </div>

        ) : (

          /* Pan-African Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs uppercase font-extrabold text-brand-leaf tracking-wider block">
                Express Checkout
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-brand-forest">
                {t('checkout.title')}
              </h2>
              <p className="text-xs text-brand-charcoal/70 mt-1">
                {t('checkout.subtitle')}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Customer Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-brand-forest tracking-wider">
                {t('checkout.customerInfo')}
              </h4>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('checkout.fullName')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('checkout.fullNamePlaceholder')}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs text-brand-charcoal focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('checkout.phoneNumber')} *
                </label>
                <input
                  type="tel"
                  required
                  placeholder={t('checkout.phoneNumberPlaceholder')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs text-brand-charcoal focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40"
                />
                <span className="text-[10px] text-brand-muted mt-1 block">
                  {t('checkout.phoneHelp')}
                </span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-3 pt-2 border-t border-brand-leaf/20">
              <h4 className="text-xs font-extrabold uppercase text-brand-forest tracking-wider">
                {t('checkout.deliveryAddress')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    {t('checkout.country')} *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs text-brand-charcoal focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40"
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
                    placeholder={t('checkout.cityPlaceholder')}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs text-brand-charcoal focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('checkout.address')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('checkout.addressPlaceholder')}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs text-brand-charcoal focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3 pt-2 border-t border-brand-leaf/20">
              <h4 className="text-xs font-extrabold uppercase text-brand-forest tracking-wider">
                {t('checkout.paymentMethod')}
              </h4>

              <div className="space-y-2">
                {paymentOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer text-xs font-bold transition-colors ${
                      formData.paymentMethod === opt.label
                        ? 'border-brand-forest bg-brand-surface text-brand-forest'
                        : 'border-brand-leaf/25 text-brand-charcoal hover:bg-brand-surface/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.label}
                      checked={formData.paymentMethod === opt.label}
                      onChange={() => setFormData({ ...formData, paymentMethod: opt.label })}
                      className="text-brand-forest focus:ring-brand-forest"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Total & Submit */}
            <div className="pt-4 border-t border-brand-leaf/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-muted">
                  {t('checkout.orderSummary')}
                </span>
                <div className="text-xl font-black text-brand-forest font-serif">
                  {formatPrice(subtotalTZS)}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className={`px-7 py-3.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                  loading || items.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-brand-forest hover:bg-brand-leaf text-white hover:shadow-lg'
                }`}
              >
                {loading ? t('checkout.processing') : t('checkout.placeOrder')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

