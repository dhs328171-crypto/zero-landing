import { useRef } from "react";
import { motion } from "framer-motion";
import { Counter } from "@/components/ui/counter";
import { useT } from "@/contexts/i18n-context";
import { useStats } from "@/lib/queries";

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };

export function StatsSection() {
  const t = useT();
  const statsRef = useRef(null);
  const statsQ = useStats();

  const statsData = [
    { value: statsQ.data?.projects ?? 52, suffix: "+", label: t("home.statsProjects"), color: "text-primary" },
    { value: statsQ.data?.users ?? 30, suffix: "+", label: t("home.statsClients"), color: "text-green-400" },
    { value: 5, suffix: "+", label: t("home.statsYears"), color: "text-yellow-400" },
    { value: 100, suffix: "%", label: t("home.statsSatisfaction"), color: "text-purple-400" },
  ];

  return (
    <section className="py-16 bg-card/40 border-y border-border relative overflow-hidden" ref={statsRef}>
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {statsData.map((s, i) => (
            <motion.div key={i} variants={fadeUp} className="p-6">
              <div className={`text-4xl md:text-5xl font-bold font-mono mb-2 ${s.color}`}>
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <p className="text-muted-foreground text-sm uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}