import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle, Mail, Clock, Search, CheckCircle, Shield, Zap, BookOpen } from "lucide-react";
import { useT } from "@/contexts/i18n-context";

const categoryKeys = ["الكل", "الأسعار", "التطوير", "الدعم", "التسليم", "الضمانات"];

const faqs = [
  { cat: "الأسعار", q: "كيف تحدد سعر المشروع؟", a: "أحدد السعر بناءً على: تعقيد المشروع، عدد الصفحات والميزات، مدة التنفيذ، والتقنيات المستخدمة. أرسل لي وصف مشروعك وسأرسل عرضاً مفصلاً." },
  { cat: "الأسعار", q: "ما طرق الدفع المتاحة؟", a: "حوالة بنكية، PayPal، أو Stripe. الدفع على مرحلتين: 50% مقدم عند البدء، 50% عند التسليم النهائي." },
  { cat: "التطوير", q: "كم تستغرق مدة تنفيذ المشروع؟", a: "المواقع البسيطة: 5-10 أيام. المتاجر والتطبيقات: 2-4 أسابيع. المشاريع المعقدة: 4-8 أسابيع. أحدد الموعد بدقة في بداية كل مشروع." },
  { cat: "التطوير", q: "ما التقنيات التي تستخدمها؟", a: "React, Next.js, TypeScript, Node.js, PostgreSQL, MongoDB, Firebase. أختار التقنية المناسبة لكل مشروع — لا حل واحد للجميع." },
  { cat: "التطوير", q: "هل يمكنني متابعة سير العمل؟", a: "نعم، أرسل تحديثات يومية عبر واتساب وأشاركك preview مباشر للمشروع على مدار التطوير." },
  { cat: "الدعم", q: "ما ساعات التواصل؟", a: "متاح من 9 صباحاً حتى 11 مساءً يومياً. الردود الطارئة متاحة على مدار الساعة للعملاء بالباقات المتقدمة." },
  { cat: "الدعم", q: "كيف أطلب تعديلاً بعد التسليم؟", a: "عبر واتساب مباشرة. التعديلات البسيطة خلال 24 ساعة. التعديلات الكبيرة تُقدَّر بعرض سعر منفصل." },
  { cat: "التسليم", q: "ماذا أتسلّم عند انتهاء المشروع؟", a: "الموقع كاملاً على الاستضافة، الكود كاملاً على GitHub، توثيقاً للمشروع، وفيديو تعليمي لاستخدام لوحة التحكم." },
  { cat: "الضمانات", q: "ما ضمانات الجودة التي تقدمها؟", a: "ضمان أداء: سرعة التحميل أقل من 2 ثانية. ضمان أمان: حماية من الثغرات الشائعة. ضمان استجابة: يعمل بشكل مثالي على كل الأجهزة." },
  { cat: "الضمانات", q: "ماذا لو لم أكن راضياً؟", a: "أعمل معك حتى تكون راضياً 100%. لم أُسلّم مشروعاً واحداً ولم يكن عميله سعيداً. الرضا التام ليس وعداً — هو ضمان." },
];

export default function Support() {
  const t = useT();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("الكل");

  const catLabels: Record<string, string> = {
    "الكل": t("support.categories"),
    "الأسعار": t("support.catBilling"),
    "التطوير": t("support.catTechnical"),
    "الدعم": t("support.catAccount"),
    "التسليم": "التسليم",
    "الضمانات": "الضمانات",
  };

  const guarantees = [
    { icon: <CheckCircle size={18} className="text-green-400" />, text: t("support.g1") },
    { icon: <Zap size={18} className="text-primary" />, text: t("support.g2") },
    { icon: <Shield size={18} className="text-blue-400" />, text: t("support.g3") },
    { icon: <Clock size={18} className="text-yellow-400" />, text: t("support.g4") },
    { icon: <BookOpen size={18} className="text-purple-400" />, text: t("support.g5") },
  ];

  const contactMethods = [
    { icon: <MessageCircle size={22} className="text-green-400" />, title: t("support.whatsappMethod"), desc: t("support.whatsappDesc"), link: "https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9", cta: "تواصل عبر واتساب", style: "border-green-400/30 hover:bg-green-400/5 text-green-400" },
    { icon: <MessageCircle size={22} className="text-primary" />, title: t("support.formMethod"), desc: t("support.formDesc"), link: "https://whatsapp.com/channel/0029Vaxa4398V0tmGkGYkp2y", cta: "تابع القناة", style: "border-primary/30 hover:bg-primary/5 text-primary" },
    { icon: <Mail size={22} className="text-blue-400" />, title: t("support.emailMethod"), desc: t("support.emailDesc"), link: "mailto:zero@dev.com", cta: "أرسل إيميل", style: "border-blue-400/30 hover:bg-blue-400/5 text-blue-400" },
  ];

  const filtered = faqs.filter((f) => {
    const matchCat = activeCat === "الكل" || f.cat === activeCat;
    const matchSearch = !search || f.q.includes(search) || f.a.includes(search);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-4 block">// support.center()</span>
            <h1 className="text-5xl font-bold mb-4">{t("support.title").split(" ").slice(0, -1).join(" ")} <span className="text-primary glow-cyan-text">{t("support.title").split(" ").slice(-1)}</span></h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">{t("support.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-10 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {guarantees.map((g, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {g.icon}
                <span className="text-muted-foreground">{g.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-8">{t("support.faqTitle").split(" ").slice(0, -1).join(" ")} <span className="text-primary glow-cyan-text">{t("support.faqTitle").split(" ").slice(-1)}</span></h2>

            {/* Search */}
            <div className="relative mb-6">
              <Search size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("support.faqSubtitle")}
                className="w-full bg-card border border-border rounded-xl pr-11 pl-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap justify-center gap-2">
              {categoryKeys.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${
                    activeCat === cat ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {catLabels[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((faq, i) => (
                <motion.div
                  key={faq.q}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-right hover:bg-background/30 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 flex-shrink-0">{catLabels[faq.cat] || faq.cat}</span>
                      <span className="font-medium text-sm text-right">{faq.q}</span>
                    </div>
                    <ChevronDown size={16} className={`flex-shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180 text-primary" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{faq.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search size={32} className="mx-auto mb-3 opacity-30" />
                <p>لا توجد نتائج لـ &quot;{search}&quot;</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact methods */}
      <section className="py-20 bg-card/30 border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">{t("support.contactTitle")}</h2>
            <p className="text-muted-foreground">{t("support.contactSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {contactMethods.map((m, i) => (
              <motion.a
                key={i}
                href={m.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col items-center text-center p-6 bg-card border rounded-xl transition-all hover:scale-[1.02] ${m.style}`}
              >
                <div className="mb-3">{m.icon}</div>
                <h3 className="font-semibold mb-1 text-foreground">{m.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{m.desc}</p>
                <span className="text-xs font-mono">{m.cta} →</span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}