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
import { isFirebaseConfigured } from './firebase';
import { AlertCircle, X } from 'lucide-react';

function AppContent() {
  const [isPortalOpen, setIsPortalOpen] = useState(() => {
    return window.location.hash === '#portal';
  });

  const [dismissEnvBanner, setDismissEnvBanner] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setIsPortalOpen(window.location.hash === '#portal');
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
      
      {/* Firebase Configuration Notice Banner (if using placeholders) */}
      {!isFirebaseConfigured && !dismissEnvBanner && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-600/30">
          <div className="flex items-center space-x-2 max-w-5xl mx-auto">
            <AlertCircle className="w-4 h-4 text-amber-900 shrink-0" />
            <span>
              <strong>Firebase Setup Ready:</strong> Paste your real Firebase web configuration in <code className="bg-amber-600/20 px-1 py-0.5 rounded font-mono font-bold">.env</code> to connect live authentication, Firestore database, and Cloud Storage.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDismissEnvBanner(true)}
            className="p-1 hover:bg-amber-600/20 rounded"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Conditional View: BMS Portal vs Storefront */}
      {isPortalOpen ? (
        <BmsPortal onBackToStore={closePortal} />
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

