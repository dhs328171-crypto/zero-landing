import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowLeft, FileText, Briefcase, MessageCircle, Tag } from "lucide-react";
import { useLocation } from "wouter";

interface SearchResult {
  title: string;
  desc: string;
  path: string;
  type: "page" | "blog" | "project" | "service";
}

const allResults: SearchResult[] = [
  { title: "الصفحة الرئيسية", desc: "ZERO — مطور Full Stack احترافي", path: "/", type: "page" },
  { title: "معرض الأعمال", desc: "9 مشاريع حقيقية بتقنيات متنوعة", path: "/portfolio", type: "page" },
  { title: "العملاء والتقييمات", desc: "آراء عملاء ZERO وشهاداتهم", path: "/clients", type: "page" },
  { title: "الأسعار والباقات", desc: "ثلاث باقات شفافة بلا رسوم مخفية", path: "/pricing", type: "page" },
  { title: "من أنا", desc: "رحلة ZERO ومهاراته وخبراته", path: "/about", type: "page" },
  { title: "الدعم والمساعدة", desc: "أسئلة شائعة وطرق التواصل", path: "/support", type: "page" },
  { title: "تواصل معي", desc: "أرسل رسالتك واحصل على استشارة مجانية", path: "/contact", type: "page" },
  { title: "الخدمات", desc: "كل خدماتي الرقمية بالتفاصيل", path: "/services", type: "page" },
  { title: "المدونة", desc: "مقالات تقنية أسبوعية", path: "/blog", type: "blog" },
  { title: "تطوير المواقع", desc: "مواقع ويب سريعة وآمنة", path: "/services", type: "service" },
  { title: "متاجر إلكترونية", desc: "حلول تجارة إلكترونية متكاملة", path: "/services", type: "service" },
  { title: "تطبيقات الموبايل", desc: "iOS و Android بـ React Native", path: "/services", type: "service" },
  { title: "Next.js 15: كل ما تحتاج معرفته", desc: "مقال تقني — Next.js", path: "/blog/nextjs-15-features", type: "blog" },
  { title: "10 أدوات AI للمطورين", desc: "مقال تقني — أدوات", path: "/blog/ai-tools-developer", type: "blog" },
  { title: "متجر الرياض الإلكتروني", desc: "مشروع — Next.js + Stripe", path: "/portfolio", type: "project" },
  { title: "منصة SaaS للأعمال", desc: "مشروع — React + Node.js", path: "/portfolio", type: "project" },
];

const typeConfig = {
  page: { icon: <FileText size={13} />, label: "صفحة", color: "text-primary" },
  blog: { icon: <Tag size={13} />, label: "مقال", color: "text-purple-400" },
  project: { icon: <Briefcase size={13} />, label: "مشروع", color: "text-green-400" },
  service: { icon: <MessageCircle size={13} />, label: "خدمة", color: "text-yellow-400" },
};

interface Props { open: boolean; onClose: () => void; }

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  const results = query.length > 0
    ? allResults.filter((r) => r.title.includes(query) || r.desc.includes(query)).slice(0, 8)
    : allResults.slice(0, 6);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 100); setQuery(""); setSelected(0); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setSelected((s) => Math.min(s + 1, results.length - 1));
      if (e.key === "ArrowUp") setSelected((s) => Math.max(s - 1, 0));
      if (e.key === "Enter" && results[selected]) {
        navigate(results[selected].path);
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, selected, navigate, onClose]);

  const go = (path: string) => { navigate(path); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-start justify-center pt-20 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search size={18} className="text-primary flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                placeholder="ابحث في الموقع..."
                className="flex-1 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground"
              />
              {query && <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>}
              <kbd className="text-[10px] font-mono bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Search size={28} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">لا نتائج لـ "{query}"</p>
                </div>
              ) : (
                <div className="py-2">
                  {query === "" && <p className="px-4 py-2 text-xs font-mono text-muted-foreground/60">// الصفحات الرئيسية</p>}
                  {results.map((r, i) => {
                    const cfg = typeConfig[r.type];
                    return (
                      <button key={i} onClick={() => go(r.path)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-background/50 transition-colors ${i === selected ? "bg-primary/10" : ""}`}>
                        <div className={`w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0 ${cfg.color}`}>{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{r.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono ${cfg.color}`}>{cfg.label}</span>
                          <ArrowLeft size={12} className="text-muted-foreground/40" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
              <span>↑↓ للتنقل</span>
              <span>↵ للفتح</span>
              <span>ESC للإغلاق</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
