import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Star, Quote, Award, Users, TrendingUp, Heart } from "lucide-react";
import { Counter } from "@/components/ui/counter";

const testimonials = [
  { name: "أحمد السعيد", company: "متجر الرياض", role: "صاحب متجر إلكتروني", rating: 5, text: "ZERO غيّر تصوري للتطوير المحترف. الموقع اللي بناه يتحدث عن نفسه — سرعة خارقة وتصميم يبهر الزوار من أول لحظة. المبيعات ارتفعت 60% في أول شهر.", project: "متجر إلكتروني + لوحة تحكم", avatar: "أ", color: "from-cyan-500/20 to-blue-500/20" },
  { name: "سارة القحطاني", company: "أزياء لمياء", role: "مصممة أزياء", rating: 5, text: "تعاملت مع كثير من المطورين، لكن ZERO فئة منفردة. يفهم ما تريده قبل أن تشرحه، ويسلم في وقت أقل مما وعد. متجري الآن يحقق أرقاماً لم أتخيلها.", project: "متجر ملابس + تطبيق موبايل", avatar: "س", color: "from-purple-500/20 to-pink-500/20" },
  { name: "شركة TechPro", company: "TechPro Solutions", role: "شركة تقنية", rating: 5, text: "نظام SaaS المعقد الذي بناه ZERO يعمل بسلاسة مطلقة منذ الإطلاق. لا أعطال، لا شكاوى. فريقنا وفّر 15 ساعة أسبوعياً بفضل الأتمتة التي صممها.", project: "منصة SaaS للأعمال", avatar: "ت", color: "from-green-500/20 to-emerald-500/20" },
  { name: "د. محمد الغامدي", company: "العيادة الخاصة", role: "طبيب متخصص", rating: 5, text: "تطبيق الحجز حوّل عيادتي. الحجوزات ارتفعت 40% في أول شهر، والمرضى يثنون على سهولة الاستخدام. ZERO لا يبني مواقع، يبني تجارب.", project: "تطبيق حجز عيادات", avatar: "م", color: "from-blue-500/20 to-cyan-500/20" },
  { name: "مجموعة الرياض", company: "مجموعة الرياض العقارية", role: "شركة عقارات", rating: 5, text: "موقع عقاراتنا أصبح مرجعاً في المنطقة. كل تفصيلة مصممة باحترافية مذهلة. العملاء يعودون للموقع مراراً وهذا ما يهمنا.", project: "موقع عقارات + لوحة إدارة", avatar: "ر", color: "from-orange-500/20 to-yellow-500/20" },
  { name: "أكاديمية النور", company: "النور للتعليم", role: "منصة تعليمية", rating: 5, text: "المنصة التعليمية تجاوزت توقعاتنا في كل شيء. سهولة الاستخدام للطلاب والمعلمين، سرعة رائعة، وتصميم يشجع على التعلم. شكراً ZERO.", project: "منصة تعليم إلكتروني", avatar: "ن", color: "from-yellow-500/20 to-orange-500/20" },
];

const stats = [
  { value: 30, suffix: "+", label: "عميل سعيد", icon: <Users size={20} />, color: "text-primary" },
  { value: 100, suffix: "%", label: "معدل الرضا", icon: <Heart size={20} />, color: "text-red-400" },
  { value: 52, suffix: "+", label: "مشروع ناجح", icon: <Award size={20} />, color: "text-yellow-400" },
  { value: 4, suffix: ".9★", label: "متوسط التقييم", icon: <TrendingUp size={20} />, color: "text-green-400" },
];

export default function Clients() {
  const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-4 block">// clients.testimonials()</span>
            <h1 className="text-5xl font-bold mb-4">آراء <span className="text-primary glow-cyan-text">العملاء</span></h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">ليس مجرد كلام — نتائج حقيقية، عملاء حقيقيون</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {stats.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="p-4">
                <div className={`flex justify-center mb-2 ${s.color}`}>{s.icon}</div>
                <div className={`text-4xl font-bold font-mono mb-1 ${s.color}`}>
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <p className="text-muted-foreground text-sm">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 transition-all group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10">
                  <Quote size={28} className="text-primary/20 mb-4" />
                  <p className="text-sm text-foreground leading-relaxed mb-6">{t.text}</p>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.company} · {t.role}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-[10px] font-mono text-primary/60 bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full">
                      {t.project}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card/30 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">أنت التالي في قائمة النجاحات</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">انضم لعائلة ZERO وابدأ رحلة مشروعك الرقمي</p>
          <a href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-mono text-sm hover:bg-primary/90 glow-cyan transition-all">
            ابدأ معي اليوم ←
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
