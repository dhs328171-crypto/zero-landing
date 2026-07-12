import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export function PageLoader() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [location] = useLocation();

  useEffect(() => {
    // Only show on root path and only once per session
    if (location !== "/") return;
    const alreadyLoaded = sessionStorage.getItem("zero_loaded");
    if (alreadyLoaded) return;

    setVisible(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) { clearInterval(interval); return 95; }
        return p + Math.random() * 20;
      });
    }, 80);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("zero_loaded", "1");
      }, 200);
    }, 1200);

    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [location]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center"
        >
          <div className="absolute inset-0 cyber-grid opacity-20" />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.img
              src="/zero-logo.png"
              alt="ZERO"
              className="h-16 w-auto drop-shadow-[0_0_20px_rgba(0,217,255,0.6)]"
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <div className="w-48 h-1 bg-card rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
            <motion.p
              className="font-mono text-xs text-primary/60"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              // جاري التحميل...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
