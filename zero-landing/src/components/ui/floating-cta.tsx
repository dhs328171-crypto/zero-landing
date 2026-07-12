import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

export function FloatingCTA() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3"
          style={{ direction: "ltr" }}
        >
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="bg-card border border-border rounded-xl p-4 shadow-xl max-w-[220px]"
              >
                <p className="text-sm text-foreground mb-3 text-right font-semibold">تواصل معي الآن</p>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-mono transition-colors"
                  >
                    <MessageCircle size={14} />
                    جروب الواتساب
                  </a>
                  <a
                    href="https://whatsapp.com/channel/0029Vaxa4398V0tmGkGYkp2y"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-primary/20 border border-primary/40 hover:bg-primary/30 text-primary px-3 py-2 rounded-lg text-xs font-mono transition-colors"
                  >
                    <MessageCircle size={14} />
                    القناة الرسمية
                  </a>
                </div>
                <div className="absolute bottom-[-6px] left-6 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded((e) => !e)}
              data-testid="button-floating-cta"
              className="relative w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-500/30 transition-all hover:scale-110"
            >
              <AnimatePresence mode="wait">
                {expanded ? (
                  <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
                    <MessageCircle size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
