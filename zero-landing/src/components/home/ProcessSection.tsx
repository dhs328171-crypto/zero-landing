import { motion } from "framer-motion";
import { Search, Palette, Settings, Rocket } from "lucide-react";
import { useT } from "@/contexts/i18n-context";

export function ProcessSection() {
  const t = useT();

  const processSteps = [
    { n: "01", icon: <Search size={20} className="text-primary" />, title: t("home.process1Title"), desc: t("home.process1Desc") },
    { n: "02", icon: <Palette size={20} className="text-primary" />, title: t("home.process2Title"), desc: t("home.process2Desc") },
    { n: "03", icon: <Settings size={20} className="text-primary" />, title: t("home.process3Title"), desc: t("home.process3Desc") },
    { n: "04", icon: <Rocket size={20} className="text-primary" />, title: t("home.process4Title"), desc: t("home.process4Desc") },
  ];

  return (
    <section className="py-24 bg-card/30 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-10" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="font-mono text-primary text-xs tracking-widest uppercase mb-3 block">// process.steps()</span>
          <h2 className="text-4xl font-bold mb-4">{t("home.processTitle")}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("home.processSubtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto relative">
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          {processSteps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 group-hover:glow-border transition-all">
                {step.icon}
              </div>
              <span className="font-mono text-xs text-primary/40 mb-2 block">{step.n}</span>
              <h3 className="font-bold mb-2">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}