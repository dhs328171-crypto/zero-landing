import { useState, useRef, useEffect } from "react";
import { DollarSign, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency, type CurrencyCode } from "@/contexts/currency-context";
import { useI18n } from "@/contexts/i18n-context";

interface Props {
  className?: string;
  /** Show the currency's full name instead of just the code (more space). */
  showName?: boolean;
}

export function CurrencySwitcher({ className = "", showName = false }: Props) {
  const { currency, setCurrency, list } = useCurrency();
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary border border-border hover:border-primary/40 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all bg-card/30"
        aria-label="Switch currency"
        title="Currency"
      >
        <DollarSign size={13} />
        <span className="uppercase">{currency}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-10 w-52 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-3 py-2 border-b border-border bg-background/50">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {lang === "ar" ? "العملة" : "Currency"}
              </p>
            </div>
            <div className="p-1.5 max-h-72 overflow-y-auto">
              {list.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c.code as CurrencyCode); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    currency === c.code
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <span className="font-mono text-base w-8 text-center">{c.symbol}</span>
                  <div className="flex-1 text-right">
                    <p className="text-xs font-medium">{lang === "ar" ? c.nameAr : c.name}</p>
                    <p className="text-[9px] font-mono opacity-60">{c.code}</p>
                  </div>
                  {currency === c.code && <Check size={13} className="text-primary" />}
                </button>
              ))}
            </div>
            <div className="px-3 py-2 border-t border-border bg-background/30">
              <p className="text-[9px] text-muted-foreground/70 font-mono">
                {lang === "ar"
                  ? "الأسعار بالدولار الأمريكي كأساس"
                  : "Prices are based on USD"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
