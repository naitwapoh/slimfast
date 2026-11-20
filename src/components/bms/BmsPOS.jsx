import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle, AlertCircle, Printer, User, DollarSign } from 'lucide-react';
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

    const orderId = 'POS-' + Math.floor(100000 + Math.random() * 900000);
    const totalTZS = (Number(selectedProduct.priceTZS || selectedProduct.price) || 0) * quantity;

    const saleRecord = {
      orderId,
      customerName: customerName || 'Walk-in Customer',
      phoneNumber: 'In-Shop Counter',
      country: 'Tanzania',
      city: 'Local Store',
      address: 'Shop Counter',
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
      channel: 'pos',
      status: 'Delivered',
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
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black font-serif text-brand-forest">
          {t('bms.pos.title')}
        </h2>
        <p className="text-xs text-brand-charcoal/70 mt-1">
          {t('bms.pos.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Entry Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-brand-leaf/25 shadow-sm space-y-5">
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

          <form onSubmit={handleCompleteSale} className="space-y-4">
            
            {/* Product Selector */}
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">
                {t('bms.pos.selectProduct')} *
              </label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs text-brand-charcoal focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40"
              >
                <option value="">{t('bms.pos.chooseProduct')}</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={(p.stock ?? 0) <= 0}>
                    {p.name} — {formatPrice(p.priceTZS || p.price)} (Stock: {p.stock ?? 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity & Stock Check */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.pos.quantity')} *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct ? selectedProduct.stock : 999}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs text-brand-charcoal focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  Current Stock Available
                </label>
                <div className="px-3.5 py-2.5 rounded-xl border border-brand-leaf/20 bg-brand-surface text-xs font-bold text-brand-forest">
                  {selectedProduct ? `${selectedProduct.stock ?? 0} units` : 'Select product'}
                </div>
              </div>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">
                {t('bms.pos.customerName')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-brand-muted" />
                <input
                  type="text"
                  placeholder="e.g. Walk-in Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-leaf/30 text-xs text-brand-charcoal focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs text-brand-charcoal focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40 font-semibold"
              >
                <option value="Cash">Cash (Counter)</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Tigo Pesa">Tigo Pesa</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Bank Card">Bank Card / POS Machine</option>
              </select>
            </div>

            {/* Sale Total Preview & Submit */}
            <div className="pt-4 border-t border-brand-leaf/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-muted">Total Due:</span>
                <div className="text-xl font-black text-brand-forest font-serif">
                  {formatPrice(
                    selectedProduct ? (selectedProduct.priceTZS || selectedProduct.price) * quantity : 0
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedProduct || (selectedProduct.stock ?? 0) < quantity}
                className={`px-6 py-3.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                  loading || !selectedProduct || (selectedProduct.stock ?? 0) < quantity
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-brand-forest hover:bg-brand-leaf text-white hover:shadow-lg'
                }`}
              >
                {loading ? t('loading') : t('bms.pos.recordSale')}
              </button>
            </div>
          </form>
        </div>

        {/* Counter Receipt Preview Panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-brand-leaf/25 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-brand-leaf/20">
            <h3 className="text-xs font-extrabold uppercase text-brand-forest tracking-wider">
              {t('bms.pos.receipt')}
            </h3>
            {lastSaleReceipt && (
              <button
                type="button"
                onClick={() => setLastSaleReceipt(lastSaleReceipt)}
                className="text-xs text-brand-forest hover:text-brand-leaf flex items-center space-x-1 font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
            )}
          </div>

          {lastSaleReceipt ? (
            <div className="bg-brand-surface/60 rounded-2xl p-4 text-xs space-y-2 border border-brand-leaf/20 font-mono">
              <div className="text-center font-bold font-serif text-brand-forest text-sm pb-2 border-b border-brand-leaf/20">
                SLIMFAST COUNTER RECEIPT
              </div>
              <div className="flex justify-between">
                <span>Receipt:</span>
                <span className="font-bold">#{lastSaleReceipt.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Staff:</span>
                <span>{lastSaleReceipt.recordedByStaffName}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{lastSaleReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span>{lastSaleReceipt.paymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-brand-leaf/20">
                {(lastSaleReceipt.items || []).map((it, idx) => (
                  <div key={idx} className="flex justify-between font-bold">
                    <span>{it.quantity}x {it.name}</span>
                    <span>{formatPrice(it.priceTZS * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-brand-leaf/20 flex justify-between font-extrabold text-brand-forest text-sm">
                <span>TOTAL:</span>
                <span>{formatPrice(lastSaleReceipt.totalTZS)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-brand-muted text-xs space-y-2">
              <ShoppingCart className="w-8 h-8 mx-auto text-brand-leaf" />
              <p>Completed walk-in receipts will appear here for instant printing or customer verification.</p>
            </div>
          )}
        </div>

      </div>

      {/* Printable modal if staff clicks print */}
      {lastSaleReceipt && (
        <PackingSlipModal
          order={lastSaleReceipt}
          onClose={() => setLastSaleReceipt(null)}
        />
      )}

    </div>
  );
};
