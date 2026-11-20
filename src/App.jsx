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
  // BMS is strictly hidden for normal visitors
  // Only opens when staff clicks the discrete portal link in footer or navigates to #portal
  const [isPortalOpen, setIsPortalOpen] = useState(() => {
    return window.location.hash === '#portal' || window.location.hash === '#bms';
  });

  useEffect(() => {
    const handleHashChange = () => {
      setIsPortalOpen(window.location.hash === '#portal' || window.location.hash === '#bms');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openPortal = () => {
    window.location.hash = '#portal';
    setIsPortalOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closePortal = () => {
    window.location.hash = '';
    setIsPortalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-charcoal">
      
      {/* If Staff / Owner Portal is open, display BMS; otherwise normal users see pure Storefront */}
      {isPortalOpen ? (
        <div className="min-h-screen bg-brand-surface">
          <BmsPortal onBackToStore={closePortal} />
        </div>
      ) : (
        <>
          <Navbar onOpenPortal={openPortal} />
          <main className="flex-1">
            <Hero />
            <TrustBadges />
            <ProductCatalog />
            <BenefitsSection />
            <HowItWorksSection />
          </main>
          <Footer onOpenPortal={openPortal} />
          <CartDrawer />
        </>
      )}

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
