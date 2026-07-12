import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useT } from "@/contexts/i18n-context";

export function CTASection() {
  const t = useT();

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <span className="font-mono text-primary text-xs tracking-widest uppercase mb-5 block">// project.launch()</span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("home.ctaSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-mono px-10 h-14 text-base" asChild>
              <Link href="/contact">{t("home.ctaButton")} ←</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground font-mono px-10 h-14 text-base" asChild>
              <a href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground font-mono">
            {t("home.why3Title")} · {t("contact.responseTimeValue")} · {t("home.statsSatisfaction")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}