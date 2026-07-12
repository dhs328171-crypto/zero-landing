import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n, type Lang } from "@/contexts/i18n-context";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

interface Props {
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({ compact = false, className = "" }: Props) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === lang)!;

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
        className={`flex items-center gap-1.5 text-muted-foreground hover:text-primary border border-border hover:border-primary/40 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all bg-card/30 ${
          compact ? "min-w-0" : "min-w-[64px]"
        }`}
        aria-label="Switch language"
        title="Language"
      >
        <Globe size={13} />
        <span className="uppercase">{current.code}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-10 w-44 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-3 py-2 border-b border-border bg-background/50">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Language / اللغة
              </p>
            </div>
            <div className="p-1.5">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    lang === l.code
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span className="flex-1 text-right">{l.label}</span>
                  {lang === l.code && <Check size={13} className="text-primary" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
