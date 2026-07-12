import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { translations, type Lang, type Dictionary } from "@/i18n/translations";

export type { Lang };

const LANG_KEY = "zero_lang";

interface I18nContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  /** Translate a dot-notated key. Returns the key itself if not found. */
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/** Resolve "a.b.c" against a nested dictionary. */
function lookup(dict: Dictionary, key: string): string | undefined {
  const parts = key.split(".");
  let cur: any = dict;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    // Restore from localStorage, default to Arabic
    const stored = (typeof localStorage !== "undefined" &&
      localStorage.getItem(LANG_KEY)) as Lang | null;
    if (stored === "ar" || stored === "en") return stored;
    return "ar";
  });

  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "ar" ? "en" : "ar");
  }, [lang, setLang]);

  // Sync <html lang> and <html dir> whenever lang changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
    }
  }, [lang, dir]);

  const t = useCallback(
    (key: string) => lookup(translations[lang], key) ?? lookup(translations.ar, key) ?? key,
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, dir, setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** Convenience alias: `const t = useT();` */
export const useT = () => useI18n().t;
