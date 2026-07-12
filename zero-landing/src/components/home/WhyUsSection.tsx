import { motion } from "framer-motion";
import { Trophy, Shield, Clock, MessageCircle, Cpu, Lock } from "lucide-react";
import { useT } from "@/contexts/i18n-context";

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export function WhyUsSection() {
  const t = useT();

  const whyMe = [
    { icon: <Trophy size={22} className="text-yellow-400" />, title: t("home.why1Title"), desc: t("home.why1Desc") },
    { icon: <Clock size={22} className="text-primary" />, title: t("home.why2Title"), desc: t("home.why2Desc") },
    { icon: <Shield size={22} className="text-green-400" />, title: t("home.why3Title"), desc: t("home.why3Desc") },
    { icon: <MessageCircle size={22} className="text-purple-400" />, title: t("home.why4Title"), desc: t("home.why4Desc") },
    { icon: <Cpu size={22} className="text-orange-400" />, title: t("home.why5Title"), desc: t("home.why5Desc") },
    { icon: <Lock size={22} className="text-red-400" />, title: t("home.why6Title"), desc: t("home.why6Desc") },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="font-mono text-primary text-xs tracking-widest uppercase mb-3 block">// why.chooseZero()</span>
          <h2 className="text-4xl font-bold mb-4">{t("home.whyTitle")}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("home.whySubtitle")}</p>
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {whyMe.map((w, i) => (
            <motion.div key={i} variants={fadeUp} className="flex items-start gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary/40 transition-all">
              <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0">
                {w.icon}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{w.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}