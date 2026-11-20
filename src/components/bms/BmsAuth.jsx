import React, { useState } from 'react';
import { Lock, User, Key, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const BmsAuth = () => {
  const { t } = useLanguage();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 flex items-center justify-center">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-herbal-lg border border-brand-leaf/30 overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-brand-forest p-6 sm:p-8 text-white relative">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-brand-leaf border border-white/20">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Staff & Management Portal</h2>
              <p className="text-xs text-white/70">Point of Sale, Orders, Inventory & Staff Management</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">
              Name / Username / Email *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-brand-muted" />
              <input
                type="text"
                required
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-leaf/30 text-xs focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">
              Password *
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-brand-muted" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-leaf/30 text-xs focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-md transition-all ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-brand-forest hover:bg-brand-leaf text-white hover:shadow-lg'
            }`}
          >
            {loading ? 'Signing In...' : 'Sign In to Management System'}
          </button>

          <div className="pt-2 text-center text-[11px] text-brand-muted">
            <span className="inline-flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-leaf" />
              <span>Authorized personnel only. Workers must be registered by Admin.</span>
            </span>
          </div>
        </form>

      </div>
    </div>
  );
};
