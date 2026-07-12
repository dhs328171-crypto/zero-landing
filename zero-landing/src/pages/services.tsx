import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { TiltCard } from "@/components/ui/tilt-card";
import {
  CheckCircle, ArrowLeft, Zap, Shield, Clock, Star, ChevronDown, MessageCircle,
} from "lucide-react";
import { useT } from "@/contexts/i18n-context";
import { useServices, useFAQs, parseFeatures, iconToEmoji } from "@/lib/queries";

const PROCESS_AR = [
  { n: "01", title: "الاستكشاف", desc: "جلسة مجانية لفهم احتياجاتك وأهداف مشروعك", icon: "🔍" },
  { n: "02", title: "العرض", desc: "عرض سعر مفصل + خطة عمل واضحة خلال 24 ساعة", icon: "📋" },
  { n: "03", title: "التصميم", desc: "نموذج Figma مرئي تفاعلي لتصور النتيجة قبل التطوير", icon: "🎨" },
  { n: "04", title: "التطوير", desc: "كود احترافي مع تحديثات يومية على التقدم", icon: "⚡" },
  { n: "05", title: "الاختبار", desc: "اختبار شامل على كل الأجهزة والمتصفحات", icon: "✅" },
  { n: "06", title: "الإطلاق", desc: "نشر آمن + دعم مجاني 30 يوماً بعد الإطلاق", icon: "🚀" },
];
const PROCESS_EN = [
  { n: "01", title: "Discovery", desc: "Free session to understand your needs and project goals", icon: "🔍" },
  { n: "02", title: "Proposal", desc: "Detailed quote + clear plan within 24 hours", icon: "📋" },
  { n: "03", title: "Design", desc: "Interactive Figma mockup to preview before development", icon: "🎨" },
  { n: "04", title: "Develop", desc: "Professional code with daily progress updates", icon: "⚡" },
  { n: "05", title: "Test", desc: "Comprehensive testing across devices and browsers", icon: "✅" },
  { n: "06", title: "Launch", desc: "Safe deploy + 30 days of free post-launch support", icon: "🚀" },
];

export default function Services() {
  const t = useT();
  const lang = t("nav.home") === "الرئيسية" ? "ar" : "en";
  const [activeService, setActiveService] = useState(0);
  const [openQ, setOpenQ] = useState<number | null>(null);

  const servicesQ = useServices();
  const faqsQ = useFAQs({});
  const services = servicesQ.data ?? [];
  const faqs = faqsQ.data ?? [];
  const active = services[activeService];
  const process = lang === "ar" ? PROCESS_AR : PROCESS_EN;

  const guarantees = [
    { icon: <Shield size={18} className="text-green-400" />, text: t("home.why3Title") },
    { icon: <Zap size={18} className="text-primary" />, text: lang === "ar" ? "أداء عالٍ — سرعة تحميل < 2 ثانية" : "High performance — load time < 2s" },
    { icon: <Clock size={18} className="text-yellow-400" />, text: t("home.why2Title") },
    { icon: <Star size={18} className="text-orange-400" />, text: lang === "ar" ? "دعم 30 يوماً مجاناً بعد الإطلاق" : "30 days free post-launch support" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-4 block">// services.catalog()</span>
            <h1 className="text-5xl font-bold mb-4">
              {t("services.title")} <span className="text-primary glow-cyan-text">{"</>"}</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">{t("services.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      {/* Service tabs + detail */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {services.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">{t("common.loading")}</div>
          ) : (
            <>
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {services.map((s, i) => (
                  <button
                    key={s.id ?? i}
                    onClick={() => setActiveService(i)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      activeService === i
                        ? "bg-card border-primary/50 text-foreground shadow-sm"
                        : "border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <span className="text-xl">{iconToEmoji(s.icon)}</span>
                    {s.title}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {active && (
                  <motion.div
                    key={activeService}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="bg-card border border-primary/30 rounded-2xl p-8 max-w-5xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div>
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 text-3xl">
                            {iconToEmoji(active.icon)}
                          </div>
                          <h2 className="text-3xl font-bold mb-3">{active.title}</h2>
                          <p className="text-muted-foreground leading-relaxed mb-6">{active.description}</p>
                          <div className="flex flex-wrap gap-4 mb-6">
                            {active.price && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-mono text-xs text-muted-foreground">{t("services.startingFrom")}:</span>
                                <span className="font-bold text-foreground">{active.price}</span>
                              </div>
                            )}
                          </div>
                          <a
                            href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-mono text-sm hover:bg-primary/90 glow-cyan transition-all"
                          >
                            <MessageCircle size={16} /> {t("services.orderNow")}
                          </a>
                        </div>
                        <div>
                          <h3 className="text-sm font-mono text-primary mb-4">// {t("services.features")}</h3>
                          <ul className="space-y-3 mb-6">
                            {parseFeatures(active.features).map((f, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm">
                                <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                                <span className="text-foreground">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </section>

      {/* All services grid */}
      <section className="py-20 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("services.title")} <span className="text-primary glow-cyan-text">{"</>"}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <motion.div key={s.id ?? i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <TiltCard>
                  <div
                    className="bg-card border border-border rounded-xl p-6 h-full transition-all cursor-pointer hover:border-primary/40"
                    onClick={() => setActiveService(i)}
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-2xl">
                      {iconToEmoji(s.icon)}
                    </div>
                    <h3 className="font-bold mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">{s.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-mono">{s.price || ""}</span>
                      <span className="text-xs font-mono text-primary flex items-center gap-1">
                        {t("common.learnMore")} <ArrowLeft size={11} />
                      </span>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">{t("services.processTitle")}</h2>
            <p className="text-muted-foreground">{t("home.processSubtitle")}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {process.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/40 transition-all"
              >
                <div className="text-2xl mb-2">{p.icon}</div>
                <span className="font-mono text-xs text-primary/50 mb-1 block">{p.n}</span>
                <h3 className="text-sm font-bold mb-1">{p.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-16 bg-card/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
            {guarantees.map((g, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {g.icon}
                <span className="text-muted-foreground">{g.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-3xl font-bold text-center mb-10">{t("faq.title")}</h2>
            <div className="space-y-3">
              {faqs.slice(0, 6).map((f, i) => (
                <div key={f.id ?? i} className="bg-card border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenQ(openQ === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-right hover:bg-background/30 transition-colors"
                  >
                    <span className="text-sm font-medium">{f.question}</span>
                    <ChevronDown size={16} className={`text-muted-foreground transition-transform ${openQ === i ? "rotate-180 text-primary" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openQ === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{f.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-card/30 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("services.ctaTitle")}</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">{t("services.ctaSubtitle")}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact">
              <span className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-mono text-sm hover:bg-primary/90 glow-cyan transition-all cursor-pointer">
                <MessageCircle size={16} /> {t("services.ctaButton")}
              </span>
            </Link>
            <Link href="/pricing">
              <span className="inline-flex items-center justify-center gap-2 border border-border text-muted-foreground px-8 py-3 rounded-xl font-mono text-sm hover:border-primary/40 hover:text-foreground transition-all cursor-pointer">
                {t("nav.pricing")}
              </span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
