import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Printer, 
  Clock, 
  CheckCircle, 
  Truck, 
  PackageCheck, 
  Trash2, 
  Phone, 
  MapPin,
  AlertCircle
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { PackingSlipModal } from './PackingSlipModal';

export const BmsOrders = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { isOwner, userProfile, currentUser } = useAuth();

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPackingSlipOrder, setSelectedPackingSlipOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(collection(db, 'orders'), (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(list);
      setLoading(false);
    }, (err) => {
      console.warn('Orders listener notice:', err.message);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        lastUpdatedBy: userProfile?.name || currentUser?.email || 'Staff',
        updatedAt: new Date().toISOString()
      });

      // Audit log
      await addDoc(collection(db, 'audit_logs'), {
        action: `Order #${orderId} status changed to ${newStatus}`,
        performedBy: userProfile?.name || currentUser?.email || 'Staff',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Could not update status: ' + err.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!isOwner) return;
    if (!window.confirm(t('bms.orders.confirmDelete', { id: orderId }))) return;
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      await addDoc(collection(db, 'audit_logs'), {
        action: `Deleted order #${orderId}`,
        performedBy: userProfile?.name || currentUser?.email || 'Owner',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Could not delete order: ' + err.message);
    }
  };

  const filteredOrders = orders.filter(ord => {
    const matchesStatus = statusFilter === 'ALL' || ord.status === statusFilter;
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      (ord.orderId && ord.orderId.toLowerCase().includes(s)) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(s)) ||
      (ord.phoneNumber && ord.phoneNumber.toLowerCase().includes(s)) ||
      (ord.city && ord.city.toLowerCase().includes(s)) ||
      (ord.country && ord.country.toLowerCase().includes(s));
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Dispatched':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black font-serif text-brand-forest">
          {t('bms.orders.title')}
        </h2>
        <p className="text-xs text-brand-charcoal/70 mt-1">
          {t('bms.orders.subtitle')}
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-brand-leaf/25 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-brand-muted" />
          <input
            type="text"
            placeholder={t('bms.orders.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-brand-leaf/30 text-xs text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-forest bg-brand-surface/40"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-brand-muted shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-brand-leaf/30 text-xs font-bold text-brand-charcoal bg-brand-surface/40 focus:outline-none"
          >
            <option value="ALL">All Statuses ({orders.length})</option>
            <option value="Pending">{t('bms.orders.statusPending')}</option>
            <option value="Confirmed">{t('bms.orders.statusConfirmed')}</option>
            <option value="Dispatched">{t('bms.orders.statusDispatched')}</option>
            <option value="Delivered">{t('bms.orders.statusDelivered')}</option>
          </select>
        </div>
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-brand-leaf/30 border-t-brand-forest rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-brand-muted mt-2">{t('loading')}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        
        /* Clean Empty Orders State */
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-brand-leaf/30 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-surface flex items-center justify-center text-brand-muted">
            <Clock className="w-8 h-8 text-brand-leaf" />
          </div>
          <h3 className="text-lg font-bold font-serif text-brand-forest">
            {t('bms.orders.emptyOrders')}
          </h3>
          <p className="text-xs text-brand-charcoal/70 max-w-sm mx-auto">
            Online storefront orders and walk-in counter sales will appear here for fulfillment and packing slip generation.
          </p>
        </div>

      ) : (

        <div className="bg-white rounded-3xl border border-brand-leaf/25 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-surface font-bold text-brand-forest border-b border-brand-leaf/20">
                <tr>
                  <th className="p-4">{t('bms.orders.orderId')}</th>
                  <th className="p-4">{t('bms.orders.customer')}</th>
                  <th className="p-4">{t('bms.orders.location')}</th>
                  <th className="p-4">{t('bms.orders.items')}</th>
                  <th className="p-4">{t('bms.orders.total')}</th>
                  <th className="p-4">{t('status')}</th>
                  <th className="p-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-leaf/10">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-brand-surface/40 transition-colors">
                    
                    {/* Order ID & Date */}
                    <td className="p-4">
                      <span className="font-mono font-bold text-brand-forest block">
                        #{ord.orderId}
                      </span>
                      <span className="text-[10px] text-brand-muted block mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-brand-surface text-[9px] font-bold uppercase rounded border border-brand-leaf/20">
                        {ord.channel === 'pos' ? 'POS Counter' : 'Online Store'}
                      </span>
                    </td>

                    {/* Customer & Phone */}
                    <td className="p-4">
                      <span className="font-bold text-brand-charcoal block">
                        {ord.customerName}
                      </span>
                      <a 
                        href={`https://wa.me/${(ord.phoneNumber || '').replace(/[^0-9]/g, '')}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[11px] text-brand-leaf hover:underline flex items-center space-x-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{ord.phoneNumber}</span>
                      </a>
                    </td>

                    {/* Location */}
                    <td className="p-4">
                      <div className="flex items-center space-x-1 font-semibold text-brand-charcoal">
                        <MapPin className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                        <span>{ord.city}, {ord.country}</span>
                      </div>
                      <span className="text-[10px] text-brand-muted block truncate max-w-xs mt-0.5">
                        {ord.address}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        {(ord.items || []).map((it, idx) => (
                          <div key={idx} className="text-brand-charcoal">
                            <strong>{it.quantity}x</strong> {it.name}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Total & Payment */}
                    <td className="p-4">
                      <div className="font-black text-brand-forest text-sm">
                        {formatPrice(ord.totalTZS, ord.currency)}
                      </div>
                      <div className="text-[10px] text-brand-muted mt-0.5">
                        {ord.paymentMethod}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-4">
                      <select
                        value={ord.status || 'Pending'}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${getStatusColor(ord.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>

                    {/* Actions: Print Slip & Owner Delete */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPackingSlipOrder(ord)}
                          className="p-2 rounded-xl bg-brand-surface hover:bg-brand-forest hover:text-white text-brand-forest border border-brand-leaf/30 transition-colors"
                          title="Print Packing Slip"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="p-2 rounded-xl text-brand-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Order Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Packing Slip Modal */}
      {selectedPackingSlipOrder && (
        <PackingSlipModal
          order={selectedPackingSlipOrder}
          onClose={() => setSelectedPackingSlipOrder(null)}
        />
      )}

    </div>
  );
};

