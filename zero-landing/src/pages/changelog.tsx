import { motion } from "framer-motion";
import { Tag, Plus, Zap, Bug, Wrench } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useI18n } from "@/contexts/i18n-context";

const releases = [
  {
    version: "v3.0.0",
    date: "مايو 2026",
    label: "latest",
    changes: [
      { type: "new", text: "نظام تسجيل المستخدمين الجديد مع صفحات Login وRegister" },
      { type: "new", text: "صفحات جديدة: الشركاء، خارطة الطريق، التغييرات، المجتمع، الموارد" },
      { type: "new", text: "صفحات الشروط والأحكام وسياسة الخصوصية" },
      { type: "new", text: "صفحة التقييمات العامة مع فلتر وتصفح" },
      { type: "new", text: "نظام صلاحيات متكامل (Admin/User/Guest)" },
      { type: "improve", text: "Footer محسّن مع روابط شاملة لكل الصفحات" },
      { type: "improve", text: "Navbar محدّث مع زر تسجيل الدخول/الخروج" },
      { type: "fix", text: "إصلاح PageLoader ليظهر على الصفحة الرئيسية فقط" },
    ],
  },
  {
    version: "v2.5.0",
    date: "أبريل 2026",
    label: "stable",
    changes: [
      { type: "new", text: "صفحة تواصل معي مع نموذج ذكي وsidebar" },
      { type: "new", text: "مدونة ZERO مع 9 مقالات وبحث وفلتر" },
      { type: "new", text: "صفحة تفاصيل المقال مع TOC وCode Blocks" },
      { type: "new", text: "صفحة الخدمات مع 6 خدمات وTabs" },
      { type: "new", text: "5 صفحات أدمن: التقييمات، FAQ، المهارات، الوسائط، SEO" },
      { type: "new", text: "SearchModal بـ Cmd+K للبحث السريع" },
      { type: "new", text: "CookieConsent GDPR مع تخصيص التفضيلات" },
      { type: "improve", text: "AdminLayout بـ 4 مجموعات و16 رابط" },
    ],
  },
  {
    version: "v2.0.0",
    date: "مارس 2026",
    label: "stable",
    changes: [
      { type: "new", text: "لوحة التحكم الإدارية الكاملة مع Dashboard" },
      { type: "new", text: "إدارة المشاريع مع Kanban Board" },
      { type: "new", text: "نظام إدارة العملاء CRM" },
      { type: "new", text: "لوحة التحليلات مع Charts تفاعلية" },
      { type: "new", text: "سجل الأنشطة Activity Log" },
      { type: "new", text: "نظام الرسائل والإشعارات" },
      { type: "improve", text: "تحسينات شاملة على الأداء وسرعة التحميل" },
      { type: "fix", text: "إصلاح مشكلة RTL في بعض المكونات" },
    ],
  },
  {
    version: "v1.5.0",
    date: "فبراير 2026",
    label: "legacy",
    changes: [
      { type: "new", text: "صفحة معرض الأعمال مع فلتر متقدم" },
      { type: "new", text: "صفحة العملاء مع إحصائيات وشهادات" },
      { type: "new", text: "صفحة الأسعار التفاعلية مع مقارنة الباقات" },
      { type: "new", text: "صفحة الدعم الفني مع نموذج وFAQ" },
      { type: "new", text: "ScrollProgress و FloatingCTA" },
      { type: "improve", text: "تحسين التصميم العام وإضافة تأثيرات Cyberpunk" },
    ],
  },
  {
    version: "v1.0.0",
    date: "يناير 2026",
    label: "legacy",
    changes: [
      { type: "new", text: "إطلاق موقع ZERO الأول" },
      { type: "new", text: "الصفحة الرئيسية مع Hero وStats وخدمات" },
      { type: "new", text: "صفحة من أنا مع Timeline والمهارات" },
      { type: "new", text: "نظام المصادقة الأساسي للمدير" },
      { type: "new", text: "تصميم Dark Cyberpunk مع نيون سيان" },
    ],
  },
];

const typeConfig = {
  new: { icon: Plus, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", label: "جديد" },
  improve: { icon: Zap, color: "text-primary", bg: "bg-primary/10 border-primary/20", label: "تحسين" },
  fix: { icon: Bug, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", label: "إصلاح" },
  change: { icon: Wrench, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", label: "تغيير" },
};

const labelConfig = {
  latest: "bg-primary/20 text-primary border-primary/30",
  stable: "bg-green-400/10 text-green-400 border-green-400/20",
  legacy: "bg-muted/50 text-muted-foreground border-border",
};

export default function Changelog() {
  const { dir } = useI18n();
  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-10" />
          <div className="container mx-auto max-w-3xl relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-mono text-xs text-primary mb-3">()CHANGELOG.HISTORY //</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                سجل <span className="text-primary">التغييرات</span>
              </h1>
              <p className="text-muted-foreground text-lg">تاريخ كامل لكل تحديث وتطوير في منظومة ZERO</p>
            </motion.div>
          </div>
        </section>

        {/* Releases */}
        <section className="py-8 px-4 pb-16">
          <div className="container mx-auto max-w-3xl space-y-8">
            {releases.map((rel, i) => (
              <motion.div
                key={rel.version}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Tag size={14} className="text-primary" />
                    <span className="font-mono font-bold text-foreground">{rel.version}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border capitalize ${labelConfig[rel.label as keyof typeof labelConfig]}`}>
                      {rel.label === "latest" ? "الأحدث" : rel.label === "stable" ? "مستقر" : "قديم"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{rel.date}</span>
                </div>

                {/* Changes */}
                <div className="p-5 space-y-2">
                  {rel.changes.map((change, j) => {
                    const t = typeConfig[change.type as keyof typeof typeConfig];
                    return (
                      <div key={j} className="flex items-start gap-3">
                        <span className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border flex-shrink-0 mt-0.5 ${t.bg}`}>
                          <t.icon size={9} className={t.color} />
                          <span className={t.color}>{t.label}</span>
                        </span>
                        <span className="text-sm text-muted-foreground">{change.text}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
