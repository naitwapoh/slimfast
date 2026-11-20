import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const CurrencyContext = createContext();

// Default realistic exchange rates relative to 1 TZS (Tanzanian Shilling as Base)
// 1 TZS in foreign currency
export const DEFAULT_CURRENCIES = {
  TZS: { symbol: 'TSh', name: 'Tanzanian Shilling', rate: 1, flag: '🇹🇿' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', rate: 0.051, flag: '🇰🇪' },
  UGX: { symbol: 'USh', name: 'Ugandan Shilling', rate: 1.45, flag: '🇺🇬' },
  RWF: { symbol: 'FRw', name: 'Rwandan Franc', rate: 0.54, flag: '🇷🇼' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', rate: 0.65, flag: '🇳🇬' },
  ZAR: { symbol: 'R', name: 'South African Rand', rate: 0.0071, flag: '🇿🇦' },
  USD: { symbol: '$', name: 'US Dollar', rate: 0.00039, flag: '🇺🇸' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('slimfast_currency') || 'TZS';
  });

  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES);

  // Sync exchange rates from Firestore if available
  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'currency'), (snap) => {
        if (snap.exists() && snap.data().rates) {
          setCurrencies(prev => ({
            ...prev,
            ...snap.data().rates
          }));
        }
      }, (err) => {
        // Silently keep default rates if Firestore rules or offline
        console.debug('Currency settings sync notice:', err.message);
      });
      return () => unsub();
    } catch (e) {
      console.debug('Currency provider catch:', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('slimfast_currency', currency);
  }, [currency]);

  // Convert base TZS amount to selected currency
  const convertPrice = (amountTZS, targetCurrency = currency) => {
    if (!amountTZS || isNaN(amountTZS)) return 0;
    const config = currencies[targetCurrency] || currencies.TZS;
    return Math.round((Number(amountTZS) * config.rate) * 100) / 100;
  };

  // Format price with proper symbol and separators
  const formatPrice = (amountTZS, targetCurrency = currency) => {
    const config = currencies[targetCurrency] || currencies.TZS;
    const converted = convertPrice(amountTZS, targetCurrency);
    
    // Format based on currency type
    if (targetCurrency === 'USD' || targetCurrency === 'ZAR') {
      return `${config.symbol} ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${config.symbol} ${Math.round(converted).toLocaleString()}`;
  };

  // Update rates (Owner function)
  const updateRates = async (newRates) => {
    setCurrencies(newRates);
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'currency'), {
          rates: newRates,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        return true;
      } catch (err) {
        console.error('Error saving exchange rates to Firestore:', err);
        throw err;
      }
    }
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      currencies,
      convertPrice,
      formatPrice,
      updateRates,
      currentCurrencyConfig: currencies[currency] || currencies.TZS
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
