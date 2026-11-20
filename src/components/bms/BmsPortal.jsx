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
  X,
  Globe,
  Heart
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
import { BmsTestimonials } from './BmsTestimonials';

export const BmsPortal = ({ onBackToStore }) => {
  const { t, language, setLanguage } = useLanguage();
  const { currentUser, userProfile, isOwner, isWorker, isAccountActive, logout, loading } = useAuth();
  
  // Default tab based on role: workers default to POS or Orders; owners default to Dashboard
  const [activeTab, setActiveTab] = useState('orders');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center p-4">
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
        <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-lg border border-red-200 text-center space-y-4">
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
  const tabs = [
    ...(isOwner ? [{ id: 'dashboard', label: t('bms.tabs.dashboard'), icon: LayoutDashboard }] : []),
    { id: 'pos', label: t('bms.tabs.pos'), icon: ShoppingCart },
    { id: 'orders', label: t('bms.tabs.orders'), icon: Clock },
    { id: 'products', label: t('bms.tabs.products'), icon: Package },
    ...(isOwner ? [
      { id: 'testimonials', label: language === 'sw' ? 'Ushuhuda wa Wateja' : 'Testimonials', icon: Heart },
      { id: 'expenses', label: t('bms.tabs.expenses'), icon: Receipt },
      { id: 'staff', label: t('bms.tabs.staff'), icon: Users },
      { id: 'settings', label: t('bms.tabs.settings'), icon: Settings }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-brand-leaf/20 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        
        {/* Left Side: Hamburger Menu + Logo + Brand Title */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-brand-forest hover:bg-brand-surface rounded-xl bg-brand-surface/70 border border-brand-leaf/25 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Back to Store Button */}
          <button
            type="button"
            onClick={onBackToStore}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-brand-forest hover:text-brand-leaf transition-colors bg-brand-surface px-3 py-1.5 rounded-xl border border-brand-leaf/20"
            title="Return to customer storefront"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Store</span>
          </button>

          <div className="flex items-center space-x-2 sm:pl-2 sm:border-l sm:border-brand-leaf/20">
            <img 
              src="/logo.jpg" 
              alt="SLIMFAST Logo" 
              className="w-8 h-8 rounded-lg object-cover border border-brand-leaf/30 shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://i.postimg.cc/T3Pmj5Rf/Gemini-Generated-Image-omoe51omoe51omoe.jpg';
              }}
            />
            <span className="text-sm sm:text-base font-black font-serif text-brand-forest tracking-wide">
              SLIMFAST BMS
            </span>
          </div>
        </div>

        {/* Right Side: Role Badge + Language + Sign Out */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Role Pill */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-surface border border-brand-leaf/30 text-brand-forest">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-leaf shrink-0" />
            <span>{isOwner ? 'Admin' : 'Worker'}</span>
          </div>

          {/* Desktop Bilingual Switcher */}
          <div className="hidden sm:flex items-center bg-brand-surface p-0.5 rounded-lg border border-brand-leaf/30 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-brand-forest text-white' : 'text-brand-charcoal'}`}
            >
              EN
            </button>
            <button
              type="button"
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
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-3 sm:p-6 gap-6 relative">
        
        {/* Mobile Backdrop for Sidebar Drawer */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fadeIn"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation Drawer */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white p-5 border-r border-brand-leaf/20 transform transition-transform duration-300 ease-in-out lg:static lg:transform-none lg:w-64 lg:rounded-3xl lg:border lg:shadow-sm lg:shrink-0 flex flex-col justify-between
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="space-y-4">
            
            {/* Drawer Header (Mobile Only) */}
            <div className="flex items-center justify-between pb-3 border-b border-brand-leaf/20 lg:hidden">
              <div className="flex items-center space-x-2.5">
                <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                <div>
                  <h3 className="font-serif font-black text-brand-forest text-sm">SLIMFAST BMS</h3>
                  <span className="text-[10px] text-brand-muted block">{isOwner ? 'Master Administrator' : 'Staff Worker'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-brand-charcoal hover:bg-brand-surface rounded-xl"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action: Back to Storefront */}
            <button
              type="button"
              onClick={() => {
                setSidebarOpen(false);
                onBackToStore();
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-brand-surface border border-brand-leaf/30 text-brand-forest text-xs font-bold flex items-center justify-center space-x-2 hover:bg-brand-leaf/20 transition-colors lg:hidden"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>

            {/* Mobile Language Switcher inside Drawer */}
            <div className="p-3 bg-brand-surface/60 rounded-2xl border border-brand-leaf/20 flex items-center justify-between lg:hidden text-xs">
              <span className="font-bold text-brand-charcoal flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-brand-leaf" />
                <span>Language:</span>
              </span>
              <div className="flex items-center bg-white p-0.5 rounded-xl border border-brand-leaf/30 font-bold">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${language === 'en' ? 'bg-brand-forest text-white' : 'text-brand-charcoal'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('sw')}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${language === 'sw' ? 'bg-brand-forest text-white' : 'text-brand-charcoal'}`}
                >
                  Kiswahili
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted px-2 block">
                Management Modules
              </span>
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
                    className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all min-h-[46px] ${
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
          </div>

          {/* Bottom user profile & Sign out */}
          <div className="pt-4 border-t border-brand-leaf/20 space-y-3">
            <div className="text-xs px-2">
              <p className="font-bold text-brand-charcoal truncate">{userProfile?.name || 'Administrator'}</p>
              <p className="text-[10px] text-brand-muted truncate">{userProfile?.email || currentUser?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 px-3 rounded-2xl bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('bms.signOutBtn')}</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && isOwner && <BmsDashboard onNavigate={setActiveTab} />}
          {activeTab === 'pos' && <BmsPOS />}
          {activeTab === 'orders' && <BmsOrders />}
          {activeTab === 'products' && <BmsProducts isReadOnly={!isOwner} />}
          {activeTab === 'testimonials' && isOwner && <BmsTestimonials />}
          {activeTab === 'expenses' && isOwner && <BmsExpenses />}
          {activeTab === 'staff' && isOwner && <BmsStaff />}
          {activeTab === 'settings' && isOwner && <BmsSettings />}
        </main>

      </div>
    </div>
  );
};
