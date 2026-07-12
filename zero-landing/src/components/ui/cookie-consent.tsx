import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, CheckCircle, Settings } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false, functional: true });

  useEffect(() => {
    const consent = localStorage.getItem("zero_cookie_consent");
    if (!consent) setTimeout(() => setVisible(true), 2000);
  }, []);

  const acceptAll = () => {
    localStorage.setItem("zero_cookie_consent", JSON.stringify({ analytics: true, marketing: true, functional: true }));
    setVisible(false);
  };

  const savePrefs = () => {
    localStorage.setItem("zero_cookie_consent", JSON.stringify(prefs));
    setVisible(false);
  };

  const rejectAll = () => {
    localStorage.setItem("zero_cookie_consent", JSON.stringify({ analytics: false, marketing: false, functional: true }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[90] bg-card border border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cookie size={18} className="text-primary" />
                <h3 className="font-bold text-sm">سياسة الكوكيز</h3>
              </div>
              <button onClick={rejectAll} className="text-muted-foreground hover:text-foreground p-0.5"><X size={16} /></button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل أداء الموقع. يمكنك تخصيص تفضيلاتك أو قبولها جميعاً.
            </p>

            <AnimatePresence>
              {showCustomize && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                  <div className="space-y-2 py-2">
                    {[
                      { key: "functional", label: "الوظيفية", desc: "ضرورية لعمل الموقع", locked: true },
                      { key: "analytics", label: "التحليلات", desc: "فهم سلوك الزوار" },
                      { key: "marketing", label: "التسويق", desc: "إعلانات مخصصة" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-1.5">
                        <div>
                          <p className="text-xs font-medium">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                        </div>
                        <button
                          disabled={item.locked}
                          onClick={() => !item.locked && setPrefs((p) => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                          className={`w-9 h-5 rounded-full transition-all relative ${
                            (item.locked ? true : prefs[item.key as keyof typeof prefs]) ? "bg-primary" : "bg-border"
                          } ${item.locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                            (item.locked ? true : prefs[item.key as keyof typeof prefs]) ? "left-4" : "left-0.5"
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <button onClick={acceptAll} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-xs font-mono hover:bg-primary/90 transition-all flex items-center justify-center gap-1">
                <CheckCircle size={12} /> قبول الكل
              </button>
              {showCustomize ? (
                <button onClick={savePrefs} className="flex-1 border border-border text-muted-foreground py-2 rounded-lg text-xs font-mono hover:border-primary/40 transition-all">
                  حفظ التفضيلات
                </button>
              ) : (
                <button onClick={() => setShowCustomize(true)} className="flex-1 border border-border text-muted-foreground py-2 rounded-lg text-xs font-mono hover:border-primary/40 transition-all flex items-center justify-center gap-1">
                  <Settings size={12} /> تخصيص
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
