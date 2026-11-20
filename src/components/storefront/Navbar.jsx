import React, { useState } from 'react';
import { ShoppingBag, Menu, X, ArrowRight, Globe, Phone, ExternalLink } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Name */}
          <a href="#" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
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
              <span className="text-xl sm:text-2xl font-black tracking-wider text-brand-forest font-serif block leading-none">
                SLIMFAST
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-brand-muted block mt-0.5">
                Herbal Detox & Slimming
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            <a href="#products" className="text-brand-charcoal hover:text-brand-forest font-semibold text-sm transition-colors">
              {t('nav.products')}
            </a>
            <a href="#benefits" className="text-brand-charcoal hover:text-brand-forest font-semibold text-sm transition-colors">
              {t('nav.benefits')}
            </a>
            <a href="#how-it-works" className="text-brand-charcoal hover:text-brand-forest font-semibold text-sm transition-colors">
              {t('nav.howItWorks')}
            </a>
            <a href="#testimonials" className="text-brand-charcoal hover:text-brand-forest font-semibold text-sm transition-colors">
              {language === 'sw' ? 'Ushuhuda' : 'Reviews'}
            </a>
            <a href="#contact" className="text-brand-charcoal hover:text-brand-forest font-semibold text-sm transition-colors">
              {t('nav.contact')}
            </a>
          </nav>

          {/* Controls Area */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Desktop Currency Selector */}
            <div className="hidden sm:inline-block relative text-left">
              <select
                aria-label="Select Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-brand-surface border border-brand-leaf/30 text-brand-charcoal text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-forest cursor-pointer shadow-sm hover:border-brand-leaf"
              >
                {Object.keys(currencies).map((currKey) => (
                  <option key={currKey} value={currKey}>
                    {currencies[currKey].flag} {currKey}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Bilingual Switcher */}
            <div className="hidden sm:flex items-center bg-brand-surface p-1 rounded-xl border border-brand-leaf/30 shadow-sm">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
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
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
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
              className="relative p-2.5 bg-brand-surface text-brand-forest rounded-xl border border-brand-leaf/30 hover:bg-brand-forest hover:text-white transition-all duration-200 shadow-sm"
              title={t('nav.cart')}
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-leaf text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-brand-charcoal hover:text-brand-forest rounded-xl bg-brand-surface/60 border border-brand-leaf/20 hover:bg-brand-surface transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-brand-forest" /> : <Menu className="w-6 h-6 text-brand-forest" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-brand-leaf/20 space-y-4 bg-white px-3 rounded-b-3xl shadow-2xl animate-fadeIn">
            
            {/* Mobile Language Switcher & Currency Control Panel */}
            <div className="bg-brand-surface/70 p-3.5 rounded-2xl border border-brand-leaf/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-charcoal flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-brand-leaf" />
                  <span>Language / Lugha:</span>
                </span>
                
                <div className="flex items-center bg-white p-1 rounded-xl border border-brand-leaf/30 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      language === 'en'
                        ? 'bg-brand-forest text-white shadow-sm'
                        : 'text-brand-charcoal hover:text-brand-forest'
                    }`}
                  >
                    English (EN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('sw')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      language === 'sw'
                        ? 'bg-brand-forest text-white shadow-sm'
                        : 'text-brand-charcoal hover:text-brand-forest'
                    }`}
                  >
                    Kiswahili (SW)
                  </button>
                </div>
              </div>

              {/* Currency Selector inside Mobile Menu */}
              <div className="flex items-center justify-between pt-2 border-t border-brand-leaf/20">
                <span className="text-xs font-bold text-brand-charcoal">
                  Currency / Sarafu:
                </span>
                <select
                  aria-label="Select Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-white border border-brand-leaf/30 text-brand-charcoal text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-forest cursor-pointer shadow-sm"
                >
                  {Object.keys(currencies).map((currKey) => (
                    <option key={currKey} value={currKey}>
                      {currencies[currKey].flag} {currKey} ({currencies[currKey].name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              <a 
                href="#products" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-sm font-bold text-brand-charcoal hover:bg-brand-surface hover:text-brand-forest rounded-2xl transition-colors"
              >
                <span>{t('nav.products')}</span>
                <ArrowRight className="w-4 h-4 text-brand-muted" />
              </a>
              <a 
                href="#benefits" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-sm font-bold text-brand-charcoal hover:bg-brand-surface hover:text-brand-forest rounded-2xl transition-colors"
              >
                <span>{t('nav.benefits')}</span>
                <ArrowRight className="w-4 h-4 text-brand-muted" />
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-sm font-bold text-brand-charcoal hover:bg-brand-surface hover:text-brand-forest rounded-2xl transition-colors"
              >
                <span>{t('nav.howItWorks')}</span>
                <ArrowRight className="w-4 h-4 text-brand-muted" />
              </a>
              <a 
                href="#testimonials" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-sm font-bold text-brand-charcoal hover:bg-brand-surface hover:text-brand-forest rounded-2xl transition-colors"
              >
                <span>{language === 'sw' ? 'Ushuhuda wa Wateja' : 'Customer Reviews'}</span>
                <ArrowRight className="w-4 h-4 text-brand-muted" />
              </a>
              <a 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-sm font-bold text-brand-charcoal hover:bg-brand-surface hover:text-brand-forest rounded-2xl transition-colors"
              >
                <span>{t('nav.contact')}</span>
                <ArrowRight className="w-4 h-4 text-brand-muted" />
              </a>
            </div>

            {/* Fast WhatsApp Support Banner */}
            <div className="pt-2 border-t border-brand-leaf/15">
              <a 
                href="https://wa.me/255752613616" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full py-3 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] rounded-2xl flex items-center justify-between text-xs font-bold transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp: +255 752 613 616</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        )}
      </div>
    </header>
  );
};
