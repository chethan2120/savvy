'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Course, CurrencyCode } from '@/lib/types';

export type { CurrencyCode };

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  label: string;
  locale: string;
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    label: 'EUR (€)',
    locale: 'de-DE',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    label: 'INR (₹)',
    locale: 'en-IN',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    label: 'GBP (£)',
    locale: 'en-GB',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    label: 'USD ($)',
    locale: 'en-US',
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    label: 'AED (د.إ)',
    locale: 'en-AE',
  },
};

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['GBP'];

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amount: number | null | undefined, currencyCode?: CurrencyCode) => string;
  getCoursePriceDisplay: (course: Partial<Course>, currencyCode?: CurrencyCode) => {
    amount: number | null;
    formatted: string;
    isAvailable: boolean;
    currencyCode: CurrencyCode;
    symbol: string;
  };
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function formatPriceAmount(amount: number | null | undefined, currencyCode: CurrencyCode = 'GBP'): string {
  if (amount == null || isNaN(amount) || amount <= 0) {
    return 'Fee on Request';
  }
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `£${amount.toLocaleString('en-GB')}`;
  }
}

/**
 * Extracts and formats the price for a course according to the fixed GBP currency.
 * Fallbacks to Fee on Request if no price is configured.
 */
export function getCoursePriceDisplay(course: Partial<Course>, targetCurrency: CurrencyCode = 'GBP') {
  const config = CURRENCY_CONFIGS.GBP;

  // Check currency_prices map for GBP first
  const pricesMap = (course as any).currency_prices || (course as any).prices;
  let amount: number | null = null;

  if (pricesMap && typeof pricesMap === 'object') {
    if (pricesMap.GBP != null && !isNaN(Number(pricesMap.GBP)) && Number(pricesMap.GBP) > 0) {
      amount = Number(pricesMap.GBP);
    }
  }

  if (amount == null && course.fee && typeof course.fee === 'string' && course.fee.includes('£')) {
    const parsed = Number(course.fee.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed > 0) amount = parsed;
  }

  if (amount != null && amount > 0) {
    return {
      amount,
      formatted: formatPriceAmount(amount, 'GBP'),
      isAvailable: true,
      currencyCode: 'GBP' as CurrencyCode,
      symbol: '£',
    };
  }

  return {
    amount: null,
    formatted: 'Fee on Request',
    isAvailable: false,
    currencyCode: 'GBP' as CurrencyCode,
    symbol: '£',
  };
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('GBP');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savvy_currency') as CurrencyCode | null;
      if (stored && SUPPORTED_CURRENCIES.includes(stored)) {
        setCurrencyState(stored);
      }
    } catch {
      // localStorage unavailable or private browsing
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (SUPPORTED_CURRENCIES.includes(code)) {
      setCurrencyState(code);
      try {
        localStorage.setItem('savvy_currency', code);
      } catch {
        // ignore
      }
    }
  };

  const formatPrice = (amount: number | null | undefined, code?: CurrencyCode) => {
    return formatPriceAmount(amount, code || currency);
  };

  const getPriceDisplay = (course: Partial<Course>, code?: CurrencyCode) => {
    return getCoursePriceDisplay(course, code || currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        getCoursePriceDisplay: getPriceDisplay,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currency: 'GBP' as CurrencyCode,
      setCurrency: () => {},
      formatPrice: (amount: number | null | undefined, code?: CurrencyCode) => formatPriceAmount(amount, code || 'GBP'),
      getCoursePriceDisplay: (course: Partial<Course>, code?: CurrencyCode) => getCoursePriceDisplay(course, code || 'GBP'),
    };
  }
  return ctx;
}
