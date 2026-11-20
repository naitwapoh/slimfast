import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle, 
  Receipt, 
  MapPin, 
  ArrowUpRight, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';

export const BmsDashboard = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      // 1. Orders listener
      const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setOrders(list);
      });

      // 2. Expenses listener
      const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setExpenses(list);
      });

      // 3. Products listener
      const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setProducts(list);
        setLoading(false);
      });

      return () => {
        unsubOrders();
        unsubExpenses();
        unsubProducts();
      };
    } catch (err) {
      console.error('Dashboard listener error:', err);
      setLoading(false);
    }
  }, []);

  // Strict computations from real Firestore data (No mock or fake figures)
  const totalGrossRevenue = orders.reduce((sum, ord) => sum + (Number(ord.totalTZS) || 0), 0);
  const totalExpensesAmount = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const netProfit = totalGrossRevenue - totalExpensesAmount;
  const lowStockCount = products.filter(p => (p.stock ?? 0) <= (p.lowStockThreshold || 10)).length;

  // Breakdown by Region / Country
  const regionBreakdown = orders.reduce((acc, ord) => {
    const loc = ord.country || 'Unknown';
    acc[loc] = (acc[loc] || 0) + (Number(ord.totalTZS) || 0);
    return acc;
  }, {});

  // Breakdown by Channel: Online Storefront vs POS Walk-in
  const onlineOrders = orders.filter(o => o.channel !== 'pos');
  const posOrders = orders.filter(o => o.channel === 'pos');

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black font-serif text-brand-forest">
          {t('bms.dashboard.title')}
        </h2>
        <p className="text-xs text-brand-charcoal/70 mt-1">
          {t('bms.dashboard.subtitle')}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-brand-leaf/25 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-bold uppercase tracking-wider">{t('bms.dashboard.totalRevenue')}</span>
            <div className="w-8 h-8 rounded-lg bg-brand-surface text-brand-forest flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-serif text-brand-forest">
              {formatPrice(totalGrossRevenue)}
            </div>
            <div className="text-[11px] text-brand-muted mt-1">
              From {orders.length} verified order(s)
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-brand-leaf/25 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-bold uppercase tracking-wider">{t('bms.dashboard.totalOrders')}</span>
            <div className="w-8 h-8 rounded-lg bg-brand-surface text-brand-forest flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-serif text-brand-charcoal">
              {orders.length}
            </div>
            <div className="text-[11px] text-brand-leaf font-bold mt-1">
              {onlineOrders.length} Online • {posOrders.length} Walk-in POS
            </div>
          </div>
        </div>

        {/* Net Profit (True Ledger) */}
        <div className="bg-white p-5 rounded-2xl border border-brand-leaf/25 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-bold uppercase tracking-wider">{t('bms.dashboard.netProfit')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-black font-serif ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatPrice(netProfit)}
            </div>
            <div className="text-[11px] text-brand-muted mt-1">
              Gross less {formatPrice(totalExpensesAmount)} expenses
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-brand-leaf/25 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-bold uppercase tracking-wider">{t('bms.dashboard.lowStockAlerts')}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-black font-serif ${lowStockCount > 0 ? 'text-amber-600' : 'text-brand-forest'}`}>
              {lowStockCount}
            </div>
            <div className="text-[11px] text-brand-muted mt-1">
              Items at or below restock threshold
            </div>
          </div>
        </div>

      </div>

      {/* Analytics Breakdown & Recent Activity */}
      {orders.length === 0 ? (
        
        /* Clean Empty Analytics State */
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-brand-leaf/30 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-surface flex items-center justify-center text-brand-muted">
            <Calendar className="w-8 h-8 text-brand-leaf" />
          </div>
          <h3 className="text-lg font-bold font-serif text-brand-forest">
            No Transactions Recorded Yet
          </h3>
          <p className="text-xs text-brand-charcoal/70 max-w-sm mx-auto leading-relaxed">
            {t('bms.dashboard.emptyAnalytics')}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('pos')}
              className="px-4 py-2 bg-brand-forest hover:bg-brand-leaf text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Record First Walk-in POS Sale
            </button>
          </div>
        </div>

      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sales by Region */}
          <div className="bg-white p-6 rounded-2xl border border-brand-leaf/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-serif text-brand-forest">
                {t('bms.dashboard.salesByRegion')}
              </h3>
              <MapPin className="w-4 h-4 text-brand-leaf" />
            </div>

            <div className="space-y-3">
              {Object.keys(regionBreakdown).map((reg) => {
                const amount = regionBreakdown[reg];
                const pct = totalGrossRevenue > 0 ? Math.round((amount / totalGrossRevenue) * 100) : 0;
                return (
                  <div key={reg} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-brand-charcoal">{reg}</span>
                      <span className="text-brand-forest">{formatPrice(amount)} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-brand-surface rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-brand-forest h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white p-6 rounded-2xl border border-brand-leaf/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-serif text-brand-forest">
                {t('bms.dashboard.recentActivity')}
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('orders')}
                className="text-xs font-bold text-brand-leaf hover:text-brand-forest flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-brand-leaf/10 space-y-2">
              {orders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-brand-forest">#{ord.orderId}</span>
                    <span className="text-brand-muted ml-2">{ord.customerName}</span>
                    <div className="text-[10px] text-brand-muted">
                      {new Date(ord.createdAt).toLocaleDateString()} • {ord.channel === 'pos' ? 'Walk-in' : 'Online'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-brand-charcoal">{formatPrice(ord.totalTZS)}</span>
                    <div className="text-[10px] uppercase font-bold text-brand-leaf">
                      {ord.status || 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      )}

    </div>
  );
};
