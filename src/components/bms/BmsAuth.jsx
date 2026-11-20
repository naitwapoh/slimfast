import React, { useState } from 'react';
import { Lock, ShieldCheck, Mail, Key, UserCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const BmsAuth = ({ onBackToStore }) => {
  const { t } = useLanguage();
  const { isFirstTimeSetup, login, registerFirstOwner } = useAuth();

  const [isRegisteringOwner, setIsRegisteringOwner] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isFirstTimeSetup || isRegisteringOwner) {
        await registerFirstOwner(email, password, fullName || 'Business Owner');
      } else {
        await login(email, password);
      }
    } catch (err) {
      console.error('BMS Auth error:', err);
      let msg = err.message;
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-herbal-lg border border-brand-leaf/30 overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-brand-forest p-6 sm:p-8 text-white relative">
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center space-x-1.5 text-xs text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('backToStore')}</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-brand-leaf border border-white/20">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">{t('bms.loginTitle')}</h2>
              <p className="text-xs text-white/70">{t('bms.portalSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* First-Time Setup Guard Notice */}
        {isFirstTimeSetup && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs space-y-1">
            <div className="flex items-center space-x-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('bms.firstTimeNotice')}</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              {t('bms.firstTimeDesc')}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {(isFirstTimeSetup || isRegisteringOwner) && (
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">
                {t('bms.staff.workerName')} *
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3 top-3 text-brand-muted" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe (Owner)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-leaf/30 text-xs focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">
              {t('bms.email')} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-brand-muted" />
              <input
                type="email"
                required
                placeholder="staff@slimfast.co.tz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-leaf/30 text-xs focus:ring-2 focus:ring-brand-forest focus:outline-none bg-brand-surface/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">
              {t('bms.password')} *
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
            {loading ? t('loading') : (isFirstTimeSetup || isRegisteringOwner) ? t('bms.claimOwnerBtn') : t('bms.signInBtn')}
          </button>

          {!isFirstTimeSetup && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsRegisteringOwner(!isRegisteringOwner)}
                className="text-[11px] text-brand-muted hover:text-brand-forest underline"
              >
                {isRegisteringOwner ? "Already have an account? Sign In" : "First-time owner? Register here"}
              </button>
            </div>
          )}
        </form>

      </div>
    </div>
  );
};

