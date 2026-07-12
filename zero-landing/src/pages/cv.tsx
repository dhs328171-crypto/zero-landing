import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Counter } from "@/components/ui/counter";
import { Download, Mail, Phone, MapPin, Globe, Github, Linkedin, Calendar, Award, Briefcase, Code2, GraduationCap, Star, Cpu, CheckCircle } from "lucide-react";
import { SiReact, SiNextdotjs, SiTypescript, SiNodedotjs, SiTailwindcss, SiMongodb, SiPostgresql, SiGit, SiFirebase, SiDocker, SiPython, SiFigma, SiGraphql, SiRedis } from "react-icons/si";

const skills = [
  { name: "React / Next.js", level: 97, color: "bg-cyan-400" },
  { name: "TypeScript", level: 93, color: "bg-blue-400" },
  { name: "Node.js / Express", level: 90, color: "bg-green-400" },
  { name: "UI/UX Design", level: 88, color: "bg-purple-400" },
  { name: "PostgreSQL / MongoDB", level: 85, color: "bg-yellow-400" },
  { name: "Docker / DevOps", level: 78, color: "bg-orange-400" },
  { name: "Python", level: 72, color: "bg-blue-300" },
  { name: "GraphQL", level: 75, color: "bg-pink-400" },
];

const experience = [
  {
    role: "مطور Full Stack مستقل",
    company: "ZERO — Software Architect Solutions",
    period: "2022 — الحاضر",
    location: "المملكة العربية السعودية (عن بعد)",
    desc: "بناء تطبيقات ويب وموبايل احترافية للعملاء في السعودية والخليج. تصميم وتطوير أنظمة SaaS، متاجر إلكترونية، ولوحات تحكم متقدمة.",
    highlights: ["52+ مشروع مكتمل", "30+ عميل سعيد", "تقييم 4.9/5 متوسط", "دول: SA, AE, KW, JO"],
    color: "border-primary/40",
    dot: "bg-primary",
  },
  {
    role: "مطور React أول",
    company: "شركة تقنية خليجية",
    period: "2021 — 2022",
    location: "عن بعد",
    desc: "قيادة فريق تطوير فرونت إند لمنصة SaaS تخدم 10,000+ مستخدم. تحسين الأداء بنسبة 60% وتقليل وقت التحميل من 5 ثوانٍ إلى أقل من ثانيتين.",
    highlights: ["React + TypeScript", "تحسين أداء 60%", "قيادة فريق 4 مطورين"],
    color: "border-green-400/40",
    dot: "bg-green-400",
  },
  {
    role: "مطور ويب",
    company: "وكالة رقمية",
    period: "2020 — 2021",
    location: "الرياض",
    desc: "تطوير مواقع وتطبيقات ويب لعملاء متنوعين. العمل مع فرق تصميم وتسليم مشاريع ضمن جداول محددة.",
    highlights: ["15+ موقع", "WordPress + React", "SEO متقدم"],
    color: "border-yellow-400/40",
    dot: "bg-yellow-400",
  },
  {
    role: "مطور مستقل (Freelancer)",
    company: "المستقل / Fiverr",
    period: "2019 — 2020",
    location: "عن بعد",
    desc: "بداية المسيرة المهنية. بناء مواقع شخصية وتجارية. تعلم ذاتي مستمر وبناء قاعدة عملاء متينة.",
    highlights: ["أول 20 مشروع", "تقييم 5 نجوم", "بناء المهارات"],
    color: "border-purple-400/40",
    dot: "bg-purple-400",
  },
];

const education = [
  {
    degree: "بكالوريوس تقنية المعلومات",
    school: "جامعة سعودية",
    period: "2017 — 2021",
    gpa: "4.2/5",
  },
  {
    degree: "Certified React Developer",
    school: "Meta (Coursera)",
    period: "2021",
    gpa: "مع مرتبة الشرف",
  },
  {
    degree: "AWS Cloud Practitioner",
    school: "Amazon Web Services",
    period: "2022",
    gpa: "اجتياز بامتياز",
  },
];

const projects = [
  { name: "متجر الرياض الإلكتروني", tech: "Next.js + Stripe + PostgreSQL", desc: "متجر متكامل مع بوابة دفع وإدارة مخزون ولوحة تحكم — 500+ عميل شهرياً" },
  { name: "منصة SaaS للأعمال", tech: "React + Node.js + MongoDB", desc: "نظام إدارة الفرق والمشاريع مع تتبع وقت وفواتير تلقائية" },
  { name: "تطبيق حجز العيادات", tech: "React + Firebase + Twilio", desc: "نظام حجز ذكي مع تأكيدات واتساب تلقائية — قلّل المواعيد الفائتة 60%" },
  { name: "لوحة تحكم عقارات", tech: "React + TypeScript + Recharts", desc: "لوحة تفاعلية مع خرائط وإحصائيات لحظية لمجموعة عقارية" },
];

const techStack = [
  { icon: <SiReact size={22} className="text-cyan-400" />, name: "React" },
  { icon: <SiNextdotjs size={22} className="text-white" />, name: "Next.js" },
  { icon: <SiTypescript size={22} className="text-blue-400" />, name: "TypeScript" },
  { icon: <SiNodedotjs size={22} className="text-green-400" />, name: "Node.js" },
  { icon: <SiTailwindcss size={22} className="text-cyan-300" />, name: "Tailwind" },
  { icon: <SiPostgresql size={22} className="text-blue-300" />, name: "PostgreSQL" },
  { icon: <SiMongodb size={22} className="text-green-500" />, name: "MongoDB" },
  { icon: <SiGit size={22} className="text-orange-400" />, name: "Git" },
  { icon: <SiFirebase size={22} className="text-yellow-400" />, name: "Firebase" },
  { icon: <SiDocker size={22} className="text-blue-500" />, name: "Docker" },
  { icon: <SiPython size={22} className="text-yellow-300" />, name: "Python" },
  { icon: <SiFigma size={22} className="text-purple-400" />, name: "Figma" },
  { icon: <SiGraphql size={22} className="text-pink-400" />, name: "GraphQL" },
  { icon: <SiRedis size={22} className="text-red-500" />, name: "Redis" },
];

export default function CV() {
  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-15" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-4 block">// resume.load()</span>
            <h1 className="text-5xl font-bold mb-4">السيرة <span className="text-primary glow-cyan-text">الذاتية</span></h1>
            <p className="text-muted-foreground max-w-lg mx-auto">مطور Full Stack — 5+ سنوات خبرة — 52+ مشروع مكتمل</p>
            <button
              onClick={handlePrint}
              className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-mono text-sm hover:bg-primary/90 glow-cyan transition-all"
            >
              <Download size={16} /> تحميل PDF
            </button>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-primary/20 rounded-2xl p-6 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                <img src="/zero-logo.png" alt="ZERO" className="w-full h-full object-cover" />
              </div>
              <h2 className="font-bold text-xl mb-1">ZERO</h2>
              <p className="text-primary font-mono text-xs mb-4">Full Stack Developer</p>
              <div className="space-y-2 text-right">
                {[
                  { icon: <Mail size={13} className="text-primary" />, val: "zero@dev.com" },
                  { icon: <Phone size={13} className="text-green-400" />, val: "+966 5X XXX XXXX" },
                  { icon: <MapPin size={13} className="text-red-400" />, val: "الرياض، السعودية" },
                  { icon: <Globe size={13} className="text-blue-400" />, val: "zero.dev" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.icon}
                    <span className="font-mono">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3 mt-5 pt-4 border-t border-border">
                <a href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-green-400/10 border border-green-400/30 flex items-center justify-center text-green-400 hover:bg-green-400/20 transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
                <a href="mailto:zero@dev.com"
                  className="w-8 h-8 rounded-lg bg-blue-400/10 border border-blue-400/30 flex items-center justify-center text-blue-400 hover:bg-blue-400/20 transition-all">
                  <Mail size={14} />
                </a>
                <a href="#"
                  className="w-8 h-8 rounded-lg bg-purple-400/10 border border-purple-400/30 flex items-center justify-center text-purple-400 hover:bg-purple-400/20 transition-all">
                  <Linkedin size={14} />
                </a>
                <a href="#"
                  className="w-8 h-8 rounded-lg bg-foreground/5 border border-foreground/20 flex items-center justify-center text-foreground/60 hover:bg-foreground/10 transition-all">
                  <Github size={14} />
                </a>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-mono text-xs text-primary tracking-widest uppercase mb-4">// إحصائيات</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 52, suffix: "+", label: "مشروع", color: "text-primary" },
                  { val: 30, suffix: "+", label: "عميل", color: "text-green-400" },
                  { val: 5, suffix: "+", label: "سنوات", color: "text-yellow-400" },
                  { val: 100, suffix: "%", label: "رضا", color: "text-purple-400" },
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 bg-background/50 rounded-xl border border-border">
                    <div className={`text-2xl font-bold font-mono ${s.color}`}>
                      <Counter to={s.val} suffix={s.suffix} />
                    </div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-mono text-xs text-primary tracking-widest uppercase mb-4">// التقنيات</h3>
              <div className="flex flex-wrap gap-2">
                {techStack.map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2 py-1.5 text-xs">
                    {t.icon}
                    <span className="font-mono text-muted-foreground">{t.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-mono text-xs text-primary tracking-widest uppercase mb-4 flex items-center gap-2">
                <GraduationCap size={14} /> // التعليم والشهادات
              </h3>
              <div className="space-y-4">
                {education.map((e, i) => (
                  <div key={i} className="border-r-2 border-primary/30 pr-3">
                    <p className="text-sm font-semibold">{e.degree}</p>
                    <p className="text-xs text-muted-foreground">{e.school}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-muted-foreground/60">{e.period}</span>
                      <span className="font-mono text-xs text-green-400">{e.gpa}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-mono text-xs text-primary tracking-widest uppercase mb-4">// اللغات</h3>
              <div className="space-y-3">
                {[
                  { lang: "العربية", level: "اللغة الأم", pct: 100, color: "bg-primary" },
                  { lang: "الإنجليزية", level: "متقدم", pct: 85, color: "bg-blue-400" },
                ].map((l, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{l.lang}</span>
                      <span className="text-muted-foreground">{l.level}</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${l.color} rounded-full`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${l.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Code2 size={18} className="text-primary" /> نبذة مختصرة
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                مطور Full Stack شغوف بتحويل الأفكار إلى تجارب رقمية استثنائية. أتخصص في بناء تطبيقات ويب وموبايل عالية الأداء باستخدام React، Next.js، وNode.js. خلال 5+ سنوات من العمل، أنجزت 52+ مشروعاً لعملاء من السعودية والخليج والأردن.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm mt-3">
                أؤمن أن الكود الجيد ليس فقط كوداً يعمل — بل كود يُبهر المستخدم ويصمد أمام الزمن. مبدأي: صفر مساومة في الجودة، صفر تأخير في التسليم.
              </p>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                <Cpu size={18} className="text-primary" /> المهارات التقنية
              </h2>
              <div className="space-y-4">
                {skills.map((skill, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium">{skill.name}</span>
                      <span className="font-mono text-muted-foreground">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${skill.color} rounded-full`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.08 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Experience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Briefcase size={18} className="text-primary" /> الخبرة العملية
              </h2>
              <div className="space-y-6">
                {experience.map((exp, i) => (
                  <div key={i} className={`border-r-2 ${exp.color} pr-4 relative`}>
                    <div className={`absolute -right-[5px] top-1.5 w-2 h-2 rounded-full ${exp.dot}`} />
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-sm">{exp.role}</h3>
                        <p className="text-primary text-xs font-mono">{exp.company}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs text-muted-foreground/70 bg-background border border-border px-2 py-0.5 rounded-full">{exp.period}</span>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                          <MapPin size={9} /> {exp.location}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed mb-3">{exp.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {exp.highlights.map((h, j) => (
                        <span key={j} className="flex items-center gap-1 text-xs bg-background border border-border px-2 py-0.5 rounded-full text-muted-foreground">
                          <CheckCircle size={9} className="text-green-400" /> {h}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                <Award size={18} className="text-primary" /> أبرز المشاريع
              </h2>
              <div className="space-y-4">
                {projects.map((p, i) => (
                  <div key={i} className="bg-background border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{p.name}</h3>
                        <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.tech.split(" + ").map((t, j) => (
                        <span key={j} className="font-mono text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* References */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-card border border-primary/20 rounded-2xl p-6"
            >
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Star size={18} className="text-yellow-400" /> المراجع والتوصيات
              </h2>
              <p className="text-muted-foreground text-sm">المراجع متاحة عند الطلب. يمكنك مراجعة التقييمات المباشرة من عملائي على صفحة <a href="/testimonials" className="text-primary hover:underline">التقييمات</a>.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-xl font-mono text-sm hover:bg-primary/90 glow-cyan transition-all">
                  <Mail size={14} /> تواصل الآن
                </a>
                <a href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-green-400/40 text-green-400 px-5 py-2 rounded-xl font-mono text-sm hover:bg-green-400/10 transition-all">
                  واتساب مباشر
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
