import React, { useState } from 'react';
import { Settings, Save, CheckCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency, DEFAULT_CURRENCIES } from '../../context/CurrencyContext';

export const BmsSettings = () => {
  const { t } = useLanguage();
  const { currencies, updateRates } = useCurrency();

  const [ratesForm, setRatesForm] = useState(() => {
    const initial = {};
    Object.keys(currencies).forEach(k => {
      initial[k] = currencies[k].rate;
    });
    return initial;
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const updated = { ...currencies };
      Object.keys(ratesForm).forEach(k => {
        if (updated[k]) {
          updated[k] = {
            ...updated[k],
            rate: Number(ratesForm[k])
          };
        }
      });
      await updateRates(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Error updating rates: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-black font-serif text-brand-forest">
          {t('bms.settings.title')}
        </h2>
        <p className="text-xs text-brand-charcoal/70 mt-1">
          {t('bms.settings.subtitle')}
        </p>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{t('bms.settings.ratesUpdated')}</span>
        </div>
      )}

      {/* Exchange Rates Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-leaf/25 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4 border-brand-leaf/20">
          <div>
            <h3 className="text-sm font-bold font-serif text-brand-forest">
              {t('bms.settings.ratesTitle')}
            </h3>
            <span className="text-[11px] text-brand-muted">
              Base Currency: <strong>Tanzanian Shilling (TZS = 1.0)</strong>
            </span>
          </div>
          <span className="text-xl">🇹🇿</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.keys(currencies).map((currKey) => {
            const config = currencies[currKey];
            if (currKey === 'TZS') return null; // Base currency
            return (
              <div key={currKey} className="p-3 bg-brand-surface rounded-xl border border-brand-leaf/20 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-brand-charcoal">
                  <span>{config.flag} {currKey} ({config.name})</span>
                  <span className="text-brand-muted font-mono">{config.symbol}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-brand-muted font-mono">1 TZS =</span>
                  <input
                    type="number"
                    step="0.00001"
                    required
                    value={ratesForm[currKey] ?? config.rate}
                    onChange={(e) => setRatesForm({ ...ratesForm, [currKey]: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-brand-leaf/30 text-xs font-bold bg-white text-brand-charcoal"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-brand-leaf/20 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? t('loading') : t('bms.settings.saveRates')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

