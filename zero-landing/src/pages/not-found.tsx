import { motion } from "framer-motion";
import { Link } from "wouter";
import { Home, ArrowLeft, Search, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";

const glitchLines = ["404", "ERR_PAGE_NOT_FOUND", "STATUS: LOST_IN_CYBERSPACE"];

export default function NotFound() {
  const { dir } = useI18n();
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const suggestions = [
    { label: "الرئيسية", path: "/", icon: <Home size={14} /> },
    { label: "أعمالي", path: "/portfolio", icon: <Search size={14} /> },
    { label: "التواصل", path: "/contact", icon: <MessageCircle size={14} /> },
    { label: "الأسعار", path: "/pricing", icon: <ArrowLeft size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden" dir={dir}>
      {/* Animated background */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-primary/10"
            style={{ left: `${(i / 20) * 100}%`, height: "100%" }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Glitch 404 */}
        <motion.div
          animate={{ x: glitch ? [0, -4, 4, -2, 0] : 0, opacity: glitch ? [1, 0.7, 1] : 1 }}
          transition={{ duration: 0.2 }}
          className="mb-8"
        >
          <div className={`font-mono text-[120px] md:text-[180px] font-bold leading-none select-none ${glitch ? "text-red-400" : "text-primary glow-cyan-text"}`}
            style={{ textShadow: glitch ? "4px 0 red, -4px 0 cyan" : undefined }}>
            404
          </div>
        </motion.div>

        {/* Terminal-style messages */}
        <div className="bg-card/60 backdrop-blur border border-primary/20 rounded-xl p-5 mb-8 text-right">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="text-xs font-mono text-muted-foreground mr-2">zero.dev — bash</span>
          </div>
          <div className="space-y-2 font-mono text-sm">
            <p><span className="text-green-400">zero@dev</span><span className="text-muted-foreground">:~$</span> <span className="text-foreground">navigate to current_page</span></p>
            <p className="text-red-400">bash: current_page: command not found</p>
            <p><span className="text-green-400">zero@dev</span><span className="text-muted-foreground">:~$</span> <span className="text-primary animate-pulse">_</span></p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3">هذه الصفحة غير موجودة!</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          يبدو أنك وصلت لصفحة لا وجود لها في هذا الكون الرقمي.<br />
          ربما الرابط تغير أو حُذف. دعني أوجّهك للمكان الصحيح.
        </p>

        {/* Quick navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {suggestions.map((s) => (
            <Link key={s.path} href={s.path}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-card border border-border hover:border-primary/50 rounded-xl p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all cursor-pointer"
              >
                {s.icon}
                {s.label}
              </motion.div>
            </Link>
          ))}
        </div>

        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-mono text-sm hover:bg-primary/90 glow-cyan transition-all flex items-center gap-2 mx-auto"
          >
            <Home size={16} /> العودة للرئيسية
          </motion.button>
        </Link>

        <p className="mt-6 text-xs text-muted-foreground font-mono">
          ERROR_CODE: 404 | STATUS: PAGE_NOT_FOUND | REDIRECT: AVAILABLE
        </p>
      </div>
    </div>
  );
}
