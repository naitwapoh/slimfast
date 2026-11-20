import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/storefront/Navbar';
import { Hero } from './components/storefront/Hero';
import { TrustBadges } from './components/storefront/TrustBadges';
import { ProductCatalog } from './components/storefront/ProductCatalog';
import { BenefitsSection } from './components/storefront/BenefitsSection';
import { HowItWorksSection } from './components/storefront/HowItWorksSection';
import { Footer } from './components/storefront/Footer';
import { CartDrawer } from './components/storefront/CartDrawer';
import { BmsPortal } from './components/bms/BmsPortal';

function AppContent() {
  const scrollToPortal = () => {
    const el = document.getElementById('bms-portal');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = '#bms-portal';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-charcoal">
      <Navbar onOpenPortal={scrollToPortal} />
      <main className="flex-1">
        <Hero />
        <TrustBadges />
        <ProductCatalog />
        <BenefitsSection />
        <HowItWorksSection />
      </main>
      <Footer onOpenPortal={scrollToPortal} />
      <CartDrawer />

      {/* Business Management System Placed at the Bottom of the Website */}
      <section id="bms-portal" className="border-t-4 border-brand-leaf/30 bg-brand-surface pt-6 scroll-mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex items-center space-x-2 text-brand-muted text-xs font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-leaf animate-pulse" />
            <span>SLIMFAST Business Management System (BMS)</span>
          </div>
        </div>
        <BmsPortal onBackToStore={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      </section>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <CartProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </CartProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}

