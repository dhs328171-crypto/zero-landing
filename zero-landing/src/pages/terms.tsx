import { motion } from "framer-motion";
import { Shield, FileText, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useI18n } from "@/contexts/i18n-context";

const sections = [
  {
    title: "القبول بالشروط",
    content: "باستخدامك لموقع ZERO وخدماته، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يرجى عدم استخدام خدماتنا.",
  },
  {
    title: "وصف الخدمات",
    content: "يقدم ZERO خدمات تطوير البرمجيات والمواقع الإلكترونية وتطبيقات الجوال. تشمل الخدمات التصميم، التطوير، الاستضافة، والصيانة. يحق لـ ZERO تعديل أو إيقاف أي خدمة في أي وقت.",
  },
  {
    title: "الملكية الفكرية",
    content: "جميع المحتويات والكود المصدري المنجزة لصالح العميل تنتقل ملكيتها الكاملة للعميل بعد الدفع الكامل. يحتفظ ZERO بحق عرض العمل في معرض الأعمال كمرجع.",
  },
  {
    title: "سياسة الدفع والاسترداد",
    content: "يتم الدفع على مرحلتين: 50% مقدماً لبدء العمل، و50% عند التسليم. في حالة عدم الرضا المُثبَت، يُعاد 100% من المبلغ. لا يُقبل الاسترداد بعد 30 يوماً من التسليم.",
  },
  {
    title: "السرية وحماية البيانات",
    content: "يلتزم ZERO بالحفاظ على سرية جميع المعلومات التجارية والتقنية للعملاء. لن تُشارك أي معلومات مع طرف ثالث دون موافقة صريحة من العميل.",
  },
  {
    title: "حدود المسؤولية",
    content: "لا يتحمل ZERO المسؤولية عن الأضرار غير المباشرة الناتجة عن استخدام المنتجات المسلّمة. الحد الأقصى للمسؤولية هو المبلغ المدفوع للمشروع.",
  },
  {
    title: "إنهاء الخدمة",
    content: "يمكن لأي طرف إنهاء العقد بإشعار كتابي مسبق. في حالة الإنهاء من العميل، يُحتسب المنجز حتى تاريخ الإنهاء ويُحدد المبلغ المستحق بناءً على ذلك.",
  },
  {
    title: "القانون الحاكم",
    content: "تخضع هذه الشروط لقوانين المملكة العربية السعودية. أي نزاعات تُحسم بالطرق الودية أولاً، ثم بالتحكيم وفقاً للأنظمة السعودية.",
  },
];

export default function Terms() {
  const { dir } = useI18n();
  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-3xl px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-3">
              <span>الرئيسية</span>
              <ChevronRight size={12} />
              <span className="text-primary">الشروط والأحكام</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">الشروط والأحكام</h1>
                <p className="text-xs text-muted-foreground font-mono">آخر تحديث: مايو 2026</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
              <Shield size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                يرجى قراءة هذه الشروط بعناية قبل استخدام خدمات ZERO. باستخدامك لأي من خدماتنا، فإنك تقر بقراءة وفهم والموافقة على هذه الشروط.
              </p>
            </div>
          </motion.div>

          <div className="space-y-6">
            {sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="font-semibold text-foreground">{s.title}</h2>
                </div>
                <p className="text-muted-foreground text-sm leading-loose">{s.content}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-8 text-center text-xs text-muted-foreground font-mono"
          >
            <p>للاستفسار عن أي بند: <a href="mailto:zero@dev.com" className="text-primary hover:underline">zero@dev.com</a></p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
