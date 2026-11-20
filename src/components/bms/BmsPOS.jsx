import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle, AlertCircle, Printer, User, DollarSign, Plus, Minus } from 'lucide-react';
import { collection, onSnapshot, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { PackingSlipModal } from './PackingSlipModal';

export const BmsPOS = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { userProfile, currentUser } = useAuth();

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [channel, setChannel] = useState('walk-in'); // 'walk-in' or 'online'
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastSaleReceipt, setLastSaleReceipt] = useState(null);

  // Read available products
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      const items = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      setProducts(items);
    });
    return () => unsub();
  }, []);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleCompleteSale = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      setErrorMessage('Please select a product.');
      return;
    }

    if (quantity <= 0) {
      setErrorMessage('Quantity must be at least 1.');
      return;
    }

    if ((selectedProduct.stock ?? 0) < quantity) {
      setErrorMessage(t('bms.pos.noStock', { stock: selectedProduct.stock ?? 0 }));
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const orderId = (channel === 'online' ? 'ONL-' : 'POS-') + Math.floor(100000 + Math.random() * 900000);
    const totalTZS = (Number(selectedProduct.priceTZS || selectedProduct.price) || 0) * quantity;

    const saleRecord = {
      orderId,
      customerName: customerName || (channel === 'online' ? 'Online Customer' : 'Walk-in Customer'),
      phoneNumber: channel === 'online' ? 'Online WhatsApp/Phone' : 'Shop Counter',
      country: 'Tanzania',
      city: 'Local Area',
      address: channel === 'online' ? 'Delivery via Courier' : 'Direct Pickup Counter',
      paymentMethod,
      items: [
        {
          id: selectedProduct.id,
          name: selectedProduct.name,
          priceTZS: selectedProduct.priceTZS || selectedProduct.price,
          quantity: quantity
        }
      ],
      totalTZS,
      currency: 'TZS',
      channel: channel,
      status: channel === 'online' ? 'Confirmed' : 'Delivered',
      recordedByStaffId: currentUser?.uid || 'staff',
      recordedByStaffName: userProfile?.name || currentUser?.email || 'Staff Worker',
      createdAt: new Date().toISOString()
    };

    try {
      if (db) {
        // 1. Record POS sale in orders
        await addDoc(collection(db, 'orders'), saleRecord);

        // 2. Decrement stock
        const prodRef = doc(db, 'products', selectedProduct.id);
        await updateDoc(prodRef, {
          stock: increment(-quantity)
        });

        // 3. Log staff action in audit log
        await addDoc(collection(db, 'audit_logs'), {
          action: `Walk-in POS Sale: ${quantity}x ${selectedProduct.name} (${formatPrice(totalTZS)})`,
          performedBy: userProfile?.name || currentUser?.email || 'Worker',
          staffId: currentUser?.uid || '',
          timestamp: new Date().toISOString()
        });
      }

      setSuccessMessage(t('bms.pos.saleSuccess'));
      setLastSaleReceipt(saleRecord);
      // Reset form
      setQuantity(1);
      setCustomerName('');
    } catch (err) {
      console.error('POS Sale error:', err);
      setErrorMessage(err.message || 'Error processing sale.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black font-serif text-brand-forest">
          {t('bms.pos.title')}
        </h2>
        <p className="text-xs text-brand-charcoal/70 mt-0.5 sm:mt-1">
          {t('bms.pos.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* Entry Form */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-7 rounded-3xl border border-brand-leaf/25 shadow-sm space-y-4 sm:space-y-5">
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleCompleteSale} className="space-y-3.5 sm:space-y-4">
            
            {/* Product Selector */}
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">
                {t('bms.pos.selectProduct')} *
              </label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-brand-leaf/30 text-xs text-brand-charcoal focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40"
              >
                <option value="">{t('bms.pos.chooseProduct')}</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={(p.stock ?? 0) <= 0}>
                    {p.name} — {formatPrice(p.priceTZS || p.price)} (Stock: {p.stock ?? 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Selector with Touch Controls */}
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">
                {t('bms.pos.quantity')} *
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-leaf/30 flex items-center justify-center text-brand-charcoal hover:bg-brand-leaf/20"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct ? selectedProduct.stock : 999}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-20 text-center py-2.5 rounded-xl border border-brand-leaf/30 text-sm font-black text-brand-forest focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-leaf/30 flex items-center justify-center text-brand-charcoal hover:bg-brand-leaf/20"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Quick Presets for Speed */}
                <div className="flex items-center space-x-1 pl-2">
                  {[1, 2, 5].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuantity(preset)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        quantity === preset
                          ? 'bg-brand-forest text-white border-brand-forest'
                          : 'bg-white text-brand-muted border-brand-leaf/20 hover:bg-brand-surface'
                      }`}
                    >
                      {preset}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Channel: Walk-in vs Online */}
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">
                Sales Channel *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('walk-in')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    channel === 'walk-in'
                      ? 'bg-brand-forest text-white border-brand-forest shadow-sm'
                      : 'bg-brand-surface/40 text-brand-charcoal border-brand-leaf/30 hover:bg-brand-surface'
                  }`}
                >
                  Walk-in Counter
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('online')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    channel === 'online'
                      ? 'bg-brand-forest text-white border-brand-forest shadow-sm'
                      : 'bg-brand-surface/40 text-brand-charcoal border-brand-leaf/30 hover:bg-brand-surface'
                  }`}
                >
                  Online Customer
                </button>
              </div>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">
                Customer Name (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3.5 text-brand-muted" />
                <input
                  type="text"
                  placeholder="e.g. Walk-in Counter Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 sm:py-3 rounded-xl border border-brand-leaf/30 text-xs text-brand-charcoal focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">
                {t('bms.pos.paymentMethod')} *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-brand-leaf/30 text-xs text-brand-charcoal focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40 font-semibold"
              >
                <option value="Cash">Cash (Counter)</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Tigo Pesa">Tigo Pesa</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Bank Card">Bank Card</option>
              </select>
            </div>

            {/* Price Preview */}
            {selectedProduct && (
              <div className="p-3.5 bg-brand-surface rounded-2xl border border-brand-leaf/25 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-brand-muted uppercase font-bold block">Total Payable:</span>
                  <span className="text-lg font-black text-brand-forest">
                    {formatPrice((Number(selectedProduct.priceTZS || selectedProduct.price) || 0) * quantity)}
                  </span>
                </div>
                <span className="text-xs font-bold text-brand-leaf">
                  Stock after sale: {(selectedProduct.stock ?? 0) - quantity}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedProduct}
              className={`w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all ${
                loading || !selectedProduct
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-forest hover:bg-brand-leaf text-white hover:shadow-lg'
              }`}
            >
              {loading ? 'Recording Sale...' : t('bms.pos.submitSale')}
            </button>
          </form>
        </div>

        {/* Counter Receipt Preview */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-7 rounded-3xl border border-brand-leaf/25 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-brand-leaf/20 pb-3">
            <Printer className="w-4 h-4 text-brand-forest" />
            <h3 className="text-sm font-bold font-serif text-brand-forest">
              Latest Sale Receipt
            </h3>
          </div>

          {lastSaleReceipt ? (
            <div className="p-4 bg-brand-surface rounded-2xl border border-brand-leaf/30 space-y-3 text-xs">
              <div className="flex justify-between border-b border-brand-leaf/20 pb-2">
                <span className="font-bold text-brand-muted">Receipt #:</span>
                <span className="font-mono font-bold text-brand-forest">#{lastSaleReceipt.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Customer:</span>
                <span className="font-bold text-brand-charcoal">{lastSaleReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Channel:</span>
                <span className="font-bold uppercase text-[10px] text-brand-leaf">{lastSaleReceipt.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Items:</span>
                <span className="font-bold text-brand-charcoal">{lastSaleReceipt.items[0]?.quantity}x {lastSaleReceipt.items[0]?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Payment:</span>
                <span className="font-bold text-brand-charcoal">{lastSaleReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-brand-leaf/20 text-sm font-bold">
                <span className="text-brand-forest">Amount Paid:</span>
                <span className="text-brand-leaf font-black">{formatPrice(lastSaleReceipt.totalTZS)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-brand-muted">
              Select product and complete sale to print or view counter receipt.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
