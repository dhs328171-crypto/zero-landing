import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TiltCard } from "@/components/ui/tilt-card";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { useT } from "@/contexts/i18n-context";
import { useServices, parseFeatures, iconToEmoji } from "@/lib/queries";

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export function ServicesSection() {
  const t = useT();
  const servicesQ = useServices();
  const services = servicesQ.data ?? [];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="font-mono text-primary text-xs tracking-widest uppercase mb-3 block">// services.list()</span>
          <h2 className="text-4xl font-bold mb-4">
            {t("home.servicesTitle")} <span className="text-primary glow-cyan-text">{"</>"}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("home.servicesSubtitle")}</p>
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((s, i) => {
            const feats = parseFeatures(s.features);
            return (
              <motion.div key={s.id ?? i} variants={fadeUp}>
                <TiltCard className="h-full">
                  <div className="bg-card border border-border rounded-xl p-7 h-full hover:border-primary/50 transition-colors group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5 border border-primary/20 relative z-10 text-2xl">
                      {iconToEmoji(s.icon)}
                    </div>
                    <h3 className="text-lg font-bold mb-2 relative z-10">{s.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 relative z-10">{s.description}</p>
                    <ul className="space-y-1 relative z-10">
                      {feats.slice(0, 4).map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                          <CheckCircle2 size={11} className="text-primary flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {s.price && (
                      <p className="text-xs text-yellow-400 font-mono mt-3 relative z-10">{s.price}</p>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
        <div className="text-center mt-10">
          <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground" asChild>
            <Link href="/services">{t("home.servicesCta")} <ArrowLeft size={14} className="mr-2" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}