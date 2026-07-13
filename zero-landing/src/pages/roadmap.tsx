import { motion } from "framer-motion";
import { CheckCircle, Clock, Zap, Lock, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useI18n, useT } from "@/contexts/i18n-context";

const quarters = [
  {
    label: "Q1 2025",
    status: "done",
    title: "الأساسيات",
    titleKey: "roadmap.q1",
    items: [
      { text: "إطلاق موقع ZERO الجديد", done: true },
      { text: "بناء نظام إدارة المشاريع", done: true },
      { text: "تطوير لوحة التحكم الكاملة", done: true },
      { text: "نظام المدونة التقنية", done: true },
      { text: "معرض الأعمال التفاعلي", done: true },
    ],
  },
  {
    label: "Q2 2025",
    status: "done",
    title: "التوسع",
    titleKey: "roadmap.q2",
    items: [
      { text: "إضافة نظام التقييمات والمراجعات", done: true },
      { text: "منصة إدارة العملاء CRM", done: true },
      { text: "نظام المهام Kanban", done: true },
      { text: "لوحة التحليلات المتقدمة", done: true },
      { text: "إضافة صفحة الأسعار التفاعلية", done: true },
    ],
  },
  {
    label: "Q3 2025",
    status: "done",
    title: "النضج",
    titleKey: "roadmap.q3",
    items: [
      { text: "تكامل نظام الدفع الإلكتروني", done: true },
      { text: "نظام الإشعارات الآنية", done: true },
      { text: "محرك SEO متقدم", done: true },
      { text: "إضافة دعم اللغة الإنجليزية", done: true },
      { text: "API عام للمطورين", done: false },
    ],
  },
  {
    label: "Q4 2025",
    status: "done",
    title: "الابتكار",
    titleKey: "roadmap.q4",
    items: [
      { text: "نظام تسجيل المستخدمين", done: true },
      { text: "صفحات متعددة ومتكاملة", done: true },
      { text: "منظومة الشركاء", done: true },
      { text: "مكتبة الموارد المجانية", done: true },
      { text: "مجتمع المطورين التفاعلي", done: true },
    ],
  },
  {
    label: "Q1 2026",
    status: "done",
    title: "المنصة",
    titleKey: null,
    items: [
      { text: "لوحة تحكم متكاملة للمشاريع", done: true },
      { text: "نظام تحليلات متقدم", done: true },
      { text: "مدير SEO مدمج", done: true },
      { text: "إدارة الوسائط والصور", done: true },
      { text: "سجل الأنشطة والإشعارات", done: true },
    ],
  },
  {
    label: "Q2 2026",
    status: "current",
    title: "المستقبل",
    titleKey: null,
    items: [
      { text: "AI مساعد للاستشارات التقنية", done: false },
      { text: "ZERO Academy للتعليم التقني", done: false },
      { text: "سوق القوالب والإضافات", done: false },
      { text: "برنامج الشراكة للمطورين", done: false },
      { text: "تكامل مع منصات العمل الحر", done: false },
    ],
  },
  {
    label: "Q3 2026",
    status: "upcoming",
    title: "التوسع",
    titleKey: "roadmap.q2",
    items: [
      { text: "تطبيق جوال ZERO للعملاء", done: false },
      { text: "خدمة الاستضافة المُدارة", done: false },
      { text: "برنامج الولاء والمكافآت", done: false },
      { text: "توسع خليجي وعربي", done: false },
      { text: "API عام للمطورين", done: false },
    ],
  },
];

const statusConfig = {
  done: { labelKey: "roadmap.completed", icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30" },
  current: { labelKey: "roadmap.current", icon: Zap, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  upcoming: { labelKey: "roadmap.planned", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30" },
  future: { labelKey: "roadmap.future", icon: Lock, color: "text-muted-foreground", bg: "bg-card", border: "border-border" },
};

export default function Roadmap() {
  const { dir } = useI18n();
  const t = useT();
  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-10" />
          <div className="container mx-auto max-w-3xl relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-mono text-xs text-primary mb-3">()ROADMAP.FUTURE //</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("roadmap.titlePrefix")} <span className="text-primary">{t("roadmap.title")}</span>
              </h1>
              <p className="text-muted-foreground text-lg">{t("roadmap.subtitle")}</p>
            </motion.div>
          </div>
        </section>

        {/* Legend */}
        <section className="py-4 px-4">
          <div className="container mx-auto max-w-4xl flex flex-wrap gap-3 justify-center">
            {Object.entries(statusConfig).map(([key, s]) => (
              <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${s.border} ${s.bg}`}>
                <s.icon size={12} className={s.color} />
                <span className={`text-xs font-mono ${s.color}`}>{t(s.labelKey as any)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute right-6 top-0 bottom-0 w-px bg-border hidden md:block" />

              <div className="space-y-6">
                {quarters.map((q, i) => {
                  const s = statusConfig[q.status as keyof typeof statusConfig];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="md:pr-16 relative"
                    >
                      {/* Dot */}
                      <div className={`absolute right-3.5 top-5 w-5 h-5 rounded-full border-2 ${s.border} ${s.bg} flex items-center justify-center hidden md:flex`}>
                        <s.icon size={10} className={s.color} />
                      </div>

                      <div className={`bg-card border ${s.border} rounded-xl p-5`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-bold text-foreground">{q.label}</span>
                            <span className={`text-xs font-mono ${s.color} ${s.bg} px-2 py-0.5 rounded-full border ${s.border}`}>
                              {t(s.labelKey as any)}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground">{q.titleKey ? t(q.titleKey as any) : q.title}</h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {q.items.map((item, j) => (
                            <div key={j} className="flex items-center gap-2.5 text-sm">
                              {item.done ? (
                                <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                              ) : (
                                <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${q.status === "current" ? "border-primary" : "border-muted-foreground/30"}`} />
                              )}
                              <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="bg-card border border-primary/20 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-2">{t("roadmap.suggestTitle")}</h3>
              <p className="text-muted-foreground text-sm mb-5">{t("roadmap.suggestDesc")}</p>
              <a
                href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-mono text-sm hover:bg-primary/90 glow-cyan transition-all"
              >
                <ArrowRight size={14} />
                {t("roadmap.suggestBtn")}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}