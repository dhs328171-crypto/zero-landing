import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useT } from "@/contexts/i18n-context";

interface LightboxProps {
  images: { src: string; title: string; desc?: string; url?: string }[];
  index: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Lightbox({ images, index, onClose, onNext, onPrev }: LightboxProps) {
  const t = useT();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onPrev();
      if (e.key === "ArrowLeft") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    if (index !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [index]);

  const current = index !== null ? images[index] : null;

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <X size={18} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-16 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          <motion.div
            key={index}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl w-full mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
              <img src={current.src} alt={current.title} className="w-full max-h-[60vh] object-cover" />
            </div>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">{current.title}</h3>
                {current.desc && <p className="text-sm text-muted-foreground mt-1">{current.desc}</p>}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                <span>{(index ?? 0) + 1} / {images.length}</span>
                {current.url && (
                  <a href={current.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                    <ExternalLink size={12} /> {t("portfolio.viewProject")}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
