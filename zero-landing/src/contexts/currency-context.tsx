import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

/**
 * ZERO — Multi-currency support.
 *
 * USD is the PRIMARY/base currency. All prices are stored in USD; other
 * currencies are derived via static conversion rates (good enough for
 * estimate display — for actual payments use a live FX API).
 *
 * Usage:
 *   const { currency, setCurrency, format, convert } = useCurrency();
 *   <span>{format(1500)}</span>  // "$1,500" or "5,625 SAR"
 */

export type CurrencyCode = "USD" | "EUR" | "GBP" | "SAR" | "AED" | "EGP" | "KWD" | "QAR";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  nameAr: string;
  /** How many units of this currency equal 1 USD. */
  rateFromUSD: number;
  /** Symbol position relative to the number. */
  position: "before" | "after";
  /** Number of decimals to show. */
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$",   name: "US Dollar",       nameAr: "دولار أمريكي",     rateFromUSD: 1,      position: "before", decimals: 0 },
  EUR: { code: "EUR", symbol: "€",   name: "Euro",            nameAr: "يورو",            rateFromUSD: 0.92,   position: "before", decimals: 0 },
  GBP: { code: "GBP", symbol: "£",   name: "British Pound",   nameAr: "جنيه إسترليني",   rateFromUSD: 0.79,   position: "before", decimals: 0 },
  SAR: { code: "SAR", symbol: "ر.س", name: "Saudi Riyal",     nameAr: "ريال سعودي",      rateFromUSD: 3.75,   position: "after",  decimals: 0 },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham",      nameAr: "درهم إماراتي",    rateFromUSD: 3.67,   position: "after",  decimals: 0 },
  EGP: { code: "EGP", symbol: "ج.م", name: "Egyptian Pound",  nameAr: "جنيه مصري",       rateFromUSD: 48.5,   position: "after",  decimals: 0 },
  KWD: { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar",   nameAr: "دينار كويتي",     rateFromUSD: 0.31,   position: "after",  decimals: 2 },
  QAR: { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal",    nameAr: "ريال قطري",       rateFromUSD: 3.64,   position: "after",  decimals: 0 },
};

export const CURRENCY_ORDER: CurrencyCode[] = ["USD", "EUR", "GBP", "SAR", "AED", "EGP", "KWD", "QAR"];

const CURRENCY_KEY = "zero_currency";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  /** Convert a USD amount to the active currency. */
  convert: (usdAmount: number) => number;
  /** Format a USD amount in the active currency with the right symbol. */
  format: (usdAmount: number) => string;
  /** Format in a specific currency (without changing active). */
  formatIn: (usdAmount: number, code: CurrencyCode) => string;
  /** Get currency info object. */
  info: CurrencyInfo;
  /** All available currencies (for dropdowns). */
  list: CurrencyInfo[];
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function roundTo(n: number, decimals: number) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

function formatNumber(n: number, decimals: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const stored = (typeof localStorage !== "undefined" &&
      localStorage.getItem(CURRENCY_KEY)) as CurrencyCode | null;
    if (stored && CURRENCIES[stored]) return stored;
    return "USD";
  });

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try { localStorage.setItem(CURRENCY_KEY, c); } catch { /* ignore */ }
  }, []);

  const info = CURRENCIES[currency];

  const convert = useCallback(
    (usdAmount: number) => roundTo(usdAmount * info.rateFromUSD, info.decimals),
    [info]
  );

  const formatIn = useCallback(
    (usdAmount: number, code: CurrencyCode) => {
      const c = CURRENCIES[code];
      const value = roundTo(usdAmount * c.rateFromUSD, c.decimals);
      const num = formatNumber(value, c.decimals);
      return c.position === "before" ? `${c.symbol}${num}` : `${num} ${c.symbol}`;
    },
    []
  );

  const format = useCallback(
    (usdAmount: number) => formatIn(usdAmount, currency),
    [formatIn, currency]
  );

  const list = CURRENCY_ORDER.map((c) => CURRENCIES[c]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format, formatIn, info, list }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
