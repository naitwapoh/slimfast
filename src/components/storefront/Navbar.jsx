import React, { useState } from 'react';
import { Leaf, ShoppingBag, Globe, Phone, ShieldCheck, Menu, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';

export const Navbar = ({ onOpenPortal }) => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const { currency, setCurrency, currencies } = useCurrency();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-leaf/20 shadow-sm transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-brand-forest text-white text-xs py-1.5 px-4 font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-leaf animate-pulse"></span>
            <span>{t('hero.badge')}</span>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="https://wa.me/255752613616" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center hover:text-brand-leaf transition-colors"
            >
              <Phone className="w-3.5 h-3.5 mr-1" />
              <span>WhatsApp: +255 752 613 616</span>
            </a>
            <span className="hidden md:inline text-brand-leaf">•</span>
            <span className="hidden md:inline">Dar es Salaam • Nairobi • Kampala • Kigali</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <a href="#" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-brand-forest flex items-center justify-center text-white shadow-md group-hover:bg-brand-leaf transition-colors duration-300">
              <Leaf className="w-6 h-6 text-brand-leaf group-hover:text-white transition-colors" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-wider text-brand-forest font-serif block leading-none">
                SLIMFAST
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-muted block mt-0.5">
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

          {/* Controls: Currency, Language, Cart, Portal */}
          <div className="flex items-center space-x-3">
            
            {/* Currency Selector */}
            <div className="relative inline-block text-left">
              <select
                aria-label="Select Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-brand-surface border border-brand-leaf/30 text-brand-charcoal text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-forest cursor-pointer shadow-sm hover:border-brand-leaf"
              >
                {Object.keys(currencies).map((currKey) => (
                  <option key={currKey} value={currKey}>
                    {currencies[currKey].flag} {currKey}
                  </option>
                ))}
              </select>
            </div>

            {/* Bilingual Switcher (EN | SW) */}
            <div className="flex items-center bg-brand-surface p-1 rounded-xl border border-brand-leaf/30 shadow-sm">
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
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-leaf text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-brand-charcoal hover:text-brand-forest"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-brand-leaf/20 space-y-3 bg-white px-2 rounded-b-xl shadow-lg">
            <a 
              href="#products" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-brand-charcoal hover:bg-brand-surface rounded-lg"
            >
              {t('nav.products')}
            </a>
            <a 
              href="#benefits" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-brand-charcoal hover:bg-brand-surface rounded-lg"
            >
              {t('nav.benefits')}
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-brand-charcoal hover:bg-brand-surface rounded-lg"
            >
              {t('nav.howItWorks')}
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-brand-charcoal hover:bg-brand-surface rounded-lg"
            >
              {t('nav.contact')}
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

