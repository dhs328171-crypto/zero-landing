import { motion } from "framer-motion";
import { Lock, Eye, Database, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useI18n } from "@/contexts/i18n-context";

const sections = [
  {
    icon: Database,
    title: "البيانات التي نجمعها",
    content: "نجمع فقط البيانات الضرورية لتقديم الخدمة: الاسم، البريد الإلكتروني، رقم الهاتف (اختياري)، وتفاصيل المشروع. لا نجمع أي بيانات حساسة أو مالية.",
  },
  {
    icon: Eye,
    title: "كيف نستخدم بياناتك",
    content: "تُستخدم بياناتك حصرياً لـ: التواصل معك بشأن طلباتك، تقديم العروض والخدمات، إرسال التحديثات عن مشروعك، وتحسين جودة خدماتنا.",
  },
  {
    icon: Lock,
    title: "حماية البيانات",
    content: "نطبق أعلى معايير الأمان لحماية بياناتك: تشفير SSL، قواعد بيانات مؤمنة، وصول محدود للبيانات، ومراجعات أمنية دورية. بياناتك لن تُباع أو تُشارك.",
  },
  {
    icon: Database,
    title: "مشاركة البيانات مع أطراف ثالثة",
    content: "لا نشارك بياناتك مع أي طرف ثالث إلا في الحالات التالية: طلبات قانونية رسمية، خدمات الاستضافة الضرورية (بموافقتك)، أو في حالة نقل الملكية.",
  },
  {
    icon: Lock,
    title: "ملفات تعريف الارتباط (Cookies)",
    content: "نستخدم Cookies ضرورية لتشغيل الموقع وتحليل زيارات مجهولة الهوية. يمكنك التحكم في Cookies من إعدادات متصفحك أو من نافذة إعدادات الخصوصية في موقعنا.",
  },
  {
    icon: Eye,
    title: "حقوقك",
    content: "لديك الحق في: الوصول لبياناتك، تصحيحها، حذفها كلياً، الاعتراض على معالجتها. يمكن ممارسة هذه الحقوق بالتواصل معنا مباشرة.",
  },
  {
    icon: Database,
    title: "الاحتفاظ بالبيانات",
    content: "نحتفظ ببيانات العملاء لمدة 3 سنوات بعد انتهاء المشروع لأغراض الضمان والمتابعة. بعدها تُحذف تلقائياً ما لم تطلب الاحتفاظ بها.",
  },
];

export default function Privacy() {
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
              <span className="text-primary">سياسة الخصوصية</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                <Lock size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">سياسة الخصوصية</h1>
                <p className="text-xs text-muted-foreground font-mono">آخر تحديث: مايو 2026</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
              <Lock size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                خصوصيتك تهمنا. لا نبيع بياناتك ولا نشاركها مع أي جهة إعلانية. هذه السياسة تشرح بوضوح ما نجمعه وكيف نستخدمه.
              </p>
            </div>
          </motion.div>

          <div className="grid gap-5">
            {sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-6 flex gap-4"
              >
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <s.icon size={16} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground mb-2">{s.title}</h2>
                  <p className="text-muted-foreground text-sm leading-loose">{s.content}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-8 text-center text-xs text-muted-foreground font-mono">
            <p>للاستفسار: <a href="mailto:zero@dev.com" className="text-primary hover:underline">zero@dev.com</a></p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
