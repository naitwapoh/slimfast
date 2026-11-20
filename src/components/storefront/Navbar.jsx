import React, { useState } from 'react';
import { Leaf, ShoppingBag, Globe, Phone, ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';

export const Navbar = ({ onOpenPortal }) => {
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency, currencies } = useCurrency();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-leaf/20 shadow-sm transition-all">
      {/* Main Navbar Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Name */}
          <a href="#" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm sm:shadow-md border border-brand-leaf/30 group-hover:border-brand-forest transition-colors duration-300 bg-white p-0.5">
              <img 
                src="/logo.jpg" 
                alt="SLIMFAST Logo" 
                className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://i.postimg.cc/T3Pmj5Rf/Gemini-Generated-Image-omoe51omoe51omoe.jpg';
                }}
              />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black tracking-wider text-brand-forest font-serif block leading-none">
                SLIMFAST
              </span>
              <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider text-brand-muted block mt-0.5">
                Herbal Detox & Slimming
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#products" className="text-brand-charcoal hover:text-brand-forest font-semibold text-sm transition-colors">
              {t('nav.products')}
            </a>
            <a href="#benefits" className="text-brand-charcoal hover:text-brand-forest font-semibold text-sm transition-colors">
              {t('nav.benefits')}
            </a>
            <a href="#how-it-works" className="text-brand-charcoal hover:text-brand-forest font-semibold text-sm transition-colors">
              {t('nav.howItWorks')}
            </a>
            <a href="#contact" className="text-brand-charcoal hover:text-brand-forest font-semibold text-sm transition-colors">
              {t('nav.contact')}
            </a>
          </nav>

          {/* Controls: Currency, Language, Cart, Mobile Menu */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            
            {/* Currency Selector (Optimized for small screens) */}
            <div className="relative inline-block text-left">
              <select
                aria-label="Select Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-brand-surface border border-brand-leaf/30 text-brand-charcoal text-[11px] sm:text-xs font-bold rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-forest cursor-pointer shadow-sm hover:border-brand-leaf"
              >
                {Object.keys(currencies).map((currKey) => (
                  <option key={currKey} value={currKey}>
                    {currencies[currKey].flag} {currKey}
                  </option>
                ))}
              </select>
            </div>

            {/* Bilingual Switcher (EN | SW) */}
            <div className="flex items-center bg-brand-surface p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-brand-leaf/30 shadow-sm">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-brand-forest text-white shadow-sm'
                    : 'text-brand-charcoal hover:text-brand-forest'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('sw')}
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-all ${
                  language === 'sw'
                    ? 'bg-brand-forest text-white shadow-sm'
                    : 'text-brand-charcoal hover:text-brand-forest'
                }`}
                title="Badili kwenda Kiswahili"
              >
                SW
              </button>
            </div>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 bg-brand-surface text-brand-forest rounded-lg sm:rounded-xl border border-brand-leaf/30 hover:bg-brand-forest hover:text-white transition-all duration-200 shadow-sm"
              title={t('nav.cart')}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-leaf text-white text-[10px] sm:text-[11px] font-black w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-brand-charcoal hover:text-brand-forest rounded-lg hover:bg-brand-surface transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-brand-leaf/20 space-y-1 bg-white px-2 rounded-b-2xl shadow-xl animate-fadeIn">
            <a 
              href="#products" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm font-bold text-brand-charcoal hover:bg-brand-surface hover:text-brand-forest rounded-xl transition-colors"
            >
              <span>{t('nav.products')}</span>
              <ArrowRight className="w-4 h-4 text-brand-muted" />
            </a>
            <a 
              href="#benefits" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm font-bold text-brand-charcoal hover:bg-brand-surface hover:text-brand-forest rounded-xl transition-colors"
            >
              <span>{t('nav.benefits')}</span>
              <ArrowRight className="w-4 h-4 text-brand-muted" />
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm font-bold text-brand-charcoal hover:bg-brand-surface hover:text-brand-forest rounded-xl transition-colors"
            >
              <span>{t('nav.howItWorks')}</span>
              <ArrowRight className="w-4 h-4 text-brand-muted" />
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 text-sm font-bold text-brand-charcoal hover:bg-brand-surface hover:text-brand-forest rounded-xl transition-colors"
            >
              <span>{t('nav.contact')}</span>
              <ArrowRight className="w-4 h-4 text-brand-muted" />
            </a>

            <div className="pt-2 border-t border-brand-leaf/15 flex items-center justify-between px-3 py-2 text-xs text-brand-muted">
              <span>{language === 'sw' ? 'Msaada wa Haraka WhatsApp:' : 'Fast WhatsApp Support:'}</span>
              <a 
                href="https://wa.me/255752613616" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold text-brand-forest hover:text-brand-leaf flex items-center space-x-1"
              >
                <Phone className="w-3.5 h-3.5 text-brand-leaf" />
                <span>+255 752 613 616</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
