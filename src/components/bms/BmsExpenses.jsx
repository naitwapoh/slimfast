import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Receipt, Calendar, DollarSign, X, AlertCircle } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';

export const BmsExpenses = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { isOwner, userProfile, currentUser } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    category: 'Packaging',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    receiptRef: ''
  });

  const categories = [
    { id: 'Packaging', label: t('bms.expenses.categoryPackaging') },
    { id: 'Shipping', label: t('bms.expenses.categoryShipping') },
    { id: 'Marketing', label: t('bms.expenses.categoryMarketing') },
    { id: 'Restocking', label: t('bms.expenses.categoryRestocking') },
    { id: 'RentUtilities', label: t('bms.expenses.categoryRentUtilities') },
    { id: 'Salaries', label: t('bms.expenses.categorySalaries') },
    { id: 'Other', label: t('bms.expenses.categoryOther') },
  ];

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(collection(db, 'expenses'), (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      setExpenses(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!isOwner || !formData.amount || !db) return;
    try {
      await addDoc(collection(db, 'expenses'), {
        category: formData.category,
        amount: Number(formData.amount),
        date: formData.date,
        notes: formData.notes,
        receiptRef: formData.receiptRef,
        loggedBy: userProfile?.name || currentUser?.email || 'Owner',
        createdAt: new Date().toISOString()
      });

      // Audit log
      await addDoc(collection(db, 'audit_logs'), {
        action: `Logged expense: ${formData.category} - ${formatPrice(formData.amount)}`,
        performedBy: userProfile?.name || currentUser?.email || 'Owner',
        timestamp: new Date().toISOString()
      });

      setFormData({
        category: 'Packaging',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        receiptRef: ''
      });
      setModalOpen(false);
    } catch (err) {
      alert('Error saving expense: ' + err.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!isOwner || !db) return;
    if (!window.confirm(t('bms.expenses.confirmDelete'))) return;
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (err) {
      alert('Could not delete expense: ' + err.message);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-serif text-brand-forest">
            {t('bms.expenses.title')}
          </h2>
          <p className="text-xs text-brand-charcoal/70 mt-1">
            {t('bms.expenses.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('bms.expenses.logExpense')}</span>
        </button>
      </div>

      {/* Expense Summary Card */}
      <div className="bg-white p-5 rounded-2xl border border-brand-leaf/25 shadow-sm max-w-sm flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-bold text-brand-muted">Cumulative Overheads:</span>
          <div className="text-2xl font-black font-serif text-rose-600 mt-1">
            {formatPrice(totalExpenses)}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <Receipt className="w-5 h-5" />
        </div>
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-brand-leaf/30 border-t-brand-forest rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-brand-muted mt-2">{t('loading')}</p>
        </div>
      ) : expenses.length === 0 ? (
        
        /* Clean Empty Expenses State */
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-brand-leaf/30 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-surface flex items-center justify-center text-brand-muted">
            <Receipt className="w-8 h-8 text-brand-leaf" />
          </div>
          <h3 className="text-lg font-bold font-serif text-brand-forest">
            {t('bms.expenses.emptyExpenses')}
          </h3>
          <p className="text-xs text-brand-charcoal/70 max-w-sm mx-auto">
            Log marketing, packaging, shipping courier fees, and restocking costs to see accurate net profit calculations.
          </p>
        </div>

      ) : (

        <div className="bg-white rounded-3xl border border-brand-leaf/25 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-surface font-bold text-brand-forest border-b border-brand-leaf/20">
                <tr>
                  <th className="p-4">{t('bms.expenses.date')}</th>
                  <th className="p-4">{t('bms.expenses.category')}</th>
                  <th className="p-4">{t('bms.expenses.notes')}</th>
                  <th className="p-4">{t('bms.expenses.receiptRef')}</th>
                  <th className="p-4">{t('bms.expenses.amount')}</th>
                  <th className="p-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-leaf/10">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-brand-surface/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-charcoal">
                      {exp.date}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-brand-surface border border-brand-leaf/20 text-brand-forest font-bold text-[11px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-brand-charcoal max-w-xs">
                      {exp.notes || '—'}
                    </td>
                    <td className="p-4 font-mono text-brand-muted">
                      {exp.receiptRef || '—'}
                    </td>
                    <td className="p-4 font-black text-rose-600 text-sm">
                      {formatPrice(exp.amount)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 rounded-lg text-brand-muted hover:text-red-600 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      )}

      {/* Log Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-brand-leaf/30 p-6 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-brand-surface text-brand-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-serif text-brand-forest">
              {t('bms.expenses.logExpense')}
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.expenses.category')} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs font-bold bg-brand-surface/40"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.expenses.amount')} *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs font-bold bg-brand-surface/40 text-brand-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.expenses.date')} *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.expenses.notes')}
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Courier dispatch fee for Arusha and Nairobi parcel delivery"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.expenses.receiptRef')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. RCPT-2024-99"
                  value={formData.receiptRef}
                  onChange={(e) => setFormData({ ...formData, receiptRef: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-brand-charcoal"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white text-xs font-bold shadow-md"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

