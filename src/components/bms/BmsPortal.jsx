import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Receipt, 
  Users, 
  Settings, 
  LogOut, 
  ArrowLeft, 
  Leaf, 
  ShieldCheck, 
  Clock,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BmsAuth } from './BmsAuth';
import { BmsDashboard } from './BmsDashboard';
import { BmsPOS } from './BmsPOS';
import { BmsOrders } from './BmsOrders';
import { BmsProducts } from './BmsProducts';
import { BmsExpenses } from './BmsExpenses';
import { BmsStaff } from './BmsStaff';
import { BmsSettings } from './BmsSettings';

export const BmsPortal = ({ onBackToStore }) => {
  const { t, language, setLanguage } = useLanguage();
  const { currentUser, userProfile, isOwner, isWorker, isAccountActive, logout, loading } = useAuth();
  
  // Default tab based on role: workers default to POS or Orders; owners default to Dashboard
  const [activeTab, setActiveTab] = useState('orders');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-leaf/30 border-t-brand-forest rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-brand-forest">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // If not logged in, show Auth component
  if (!currentUser) {
    return <BmsAuth onBackToStore={onBackToStore} />;
  }

  // If user profile is marked inactive
  if (!isAccountActive) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-lg border border-red-200 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center text-2xl font-bold">
            !
          </div>
          <h3 className="text-lg font-bold text-brand-charcoal">Account Inactive</h3>
          <p className="text-xs text-brand-charcoal/70 leading-relaxed">
            {t('bms.accountInactive')}
          </p>
          <button
            type="button"
            onClick={logout}
            className="px-5 py-2.5 bg-brand-forest text-white rounded-xl text-xs font-bold"
          >
            {t('bms.signOutBtn')}
          </button>
        </div>
      </div>
    );
  }

  // Navigation tabs defined by role permissions
  // Workers have: POS, Orders, Products (read-only stock)
  // Owners have: Dashboard, POS, Orders, Products (full edit), Expenses, Staff, Settings
  const tabs = [
    ...(isOwner ? [{ id: 'dashboard', label: t('bms.tabs.dashboard'), icon: LayoutDashboard }] : []),
    { id: 'pos', label: t('bms.tabs.pos'), icon: ShoppingCart },
    { id: 'orders', label: t('bms.tabs.orders'), icon: Clock },
    { id: 'products', label: t('bms.tabs.products'), icon: Package },
    ...(isOwner ? [
      { id: 'expenses', label: t('bms.tabs.expenses'), icon: Receipt },
      { id: 'staff', label: t('bms.tabs.staff'), icon: Users },
      { id: 'settings', label: t('bms.tabs.settings'), icon: Settings }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-brand-leaf/20 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-brand-charcoal hover:bg-brand-surface rounded-xl"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={onBackToStore}
            className="flex items-center space-x-1.5 text-xs font-bold text-brand-forest hover:text-brand-leaf transition-colors bg-brand-surface px-3 py-1.5 rounded-lg border border-brand-leaf/20"
            title="Scroll back to top of website"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Store</span>
          </button>

          <div className="flex items-center space-x-2 pl-2 border-l border-brand-leaf/20">
            <img 
              src="/logo.jpg" 
              alt="SLIMFAST Logo" 
              className="w-8 h-8 rounded-lg object-cover border border-brand-leaf/30"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://i.postimg.cc/T3Pmj5Rf/Gemini-Generated-Image-omoe51omoe51omoe.jpg';
              }}
            />
            <span className="text-base font-black font-serif text-brand-forest tracking-wide hidden md:inline">
              SLIMFAST BMS
            </span>
          </div>
        </div>

        {/* User Badge & Language Toggle */}
        <div className="flex items-center space-x-3">
          
          {/* Role Pill */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-surface border border-brand-leaf/30 text-brand-forest">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-leaf" />
            <span>{isOwner ? t('bms.roleOwner') : t('bms.roleWorker')}</span>
            <span className="text-[10px] text-brand-muted hidden sm:inline">({userProfile?.name || userProfile?.email})</span>
          </div>

          {/* Bilingual Switcher */}
          <div className="flex items-center bg-brand-surface p-0.5 rounded-lg border border-brand-leaf/30 text-xs font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-brand-forest text-white' : 'text-brand-charcoal'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('sw')}
              className={`px-2 py-0.5 rounded ${language === 'sw' ? 'bg-brand-forest text-white' : 'text-brand-charcoal'}`}
            >
              SW
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={logout}
            className="p-2 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            title={t('bms.signOutBtn')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        
        {/* Left Sidebar (Desktop + Mobile drawer) */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white p-5 border-r border-brand-leaf/20 transform transition-transform duration-200 ease-in-out lg:static lg:transform-none lg:w-60 lg:rounded-3xl lg:border lg:shadow-sm lg:shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-forest text-white shadow-md'
                      : 'text-brand-charcoal hover:bg-brand-surface hover:text-brand-forest'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-leaf' : 'text-brand-muted'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && isOwner && <BmsDashboard onNavigate={setActiveTab} />}
          {activeTab === 'pos' && <BmsPOS />}
          {activeTab === 'orders' && <BmsOrders />}
          {activeTab === 'products' && <BmsProducts isReadOnly={!isOwner} />}
          {activeTab === 'expenses' && isOwner && <BmsExpenses />}
          {activeTab === 'staff' && isOwner && <BmsStaff />}
          {activeTab === 'settings' && isOwner && <BmsSettings />}
        </main>

      </div>
    </div>
  );
};

