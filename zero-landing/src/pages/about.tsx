import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Counter } from "@/components/ui/counter";
import { TiltCard } from "@/components/ui/tilt-card";
import { Link } from "wouter";
import { Download, MapPin, Calendar, Coffee, Code2, Zap, Heart } from "lucide-react";
import { useT } from "@/contexts/i18n-context";
import { useStats } from "@/lib/queries";
import { SiReact, SiNextdotjs, SiTypescript, SiNodedotjs, SiTailwindcss, SiMongodb, SiPostgresql, SiGit, SiFirebase, SiDocker, SiPython, SiFigma } from "react-icons/si";

const skills = [
  { name: "React / Next.js", level: 97, color: "bg-cyan-400" },
  { name: "TypeScript", level: 93, color: "bg-blue-400" },
  { name: "Node.js / Express", level: 90, color: "bg-green-400" },
  { name: "UI/UX Design", level: 88, color: "bg-purple-400" },
  { name: "PostgreSQL / MongoDB", level: 85, color: "bg-yellow-400" },
  { name: "Docker / DevOps", level: 78, color: "bg-orange-400" },
];

const techStack = [
  { icon: <SiReact size={28} className="text-cyan-400" />, name: "React" },
  { icon: <SiNextdotjs size={28} className="text-white" />, name: "Next.js" },
  { icon: <SiTypescript size={28} className="text-blue-400" />, name: "TypeScript" },
  { icon: <SiNodedotjs size={28} className="text-green-400" />, name: "Node.js" },
  { icon: <SiTailwindcss size={28} className="text-cyan-300" />, name: "Tailwind" },
  { icon: <SiPostgresql size={28} className="text-blue-300" />, name: "PostgreSQL" },
  { icon: <SiMongodb size={28} className="text-green-500" />, name: "MongoDB" },
  { icon: <SiGit size={28} className="text-orange-400" />, name: "Git" },
  { icon: <SiFirebase size={28} className="text-yellow-400" />, name: "Firebase" },
  { icon: <SiDocker size={28} className="text-blue-500" />, name: "Docker" },
  { icon: <SiPython size={28} className="text-yellow-300" />, name: "Python" },
  { icon: <SiFigma size={28} className="text-purple-400" />, name: "Figma" },
];

export default function About() {
  const t = useT();
  const statsQ = useStats();
  const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

  const timeline = [
    { year: t("about.timeline1Year"), title: t("about.timeline1Title"), desc: t("about.timeline1Desc"), icon: "🚀" },
    { year: t("about.timeline2Year"), title: t("about.timeline2Title"), desc: t("about.timeline2Desc"), icon: "💡" },
    { year: t("about.timeline3Year"), title: t("about.timeline3Title"), desc: t("about.timeline3Desc"), icon: "⚡" },
    { year: t("about.timeline4Year"), title: t("about.timeline4Title"), desc: t("about.timeline4Desc"), icon: "🎯" },
    { year: t("about.timeline5Year"), title: t("about.timeline5Title"), desc: t("about.timeline5Desc"), icon: "🏆" },
  ];

  const values = [
    { icon: <Code2 size={20} className="text-primary" />, title: t("about.val1Title"), desc: t("about.val1Desc") },
    { icon: <Zap size={20} className="text-yellow-400" />, title: t("about.val2Title"), desc: t("about.val2Desc") },
    { icon: <Heart size={20} className="text-red-400" />, title: t("about.val3Title"), desc: t("about.val3Desc") },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-15" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Photo placeholder */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
              <TiltCard>
                <div className="relative rounded-2xl overflow-hidden border border-primary/30 glow-border bg-card aspect-square max-w-sm mx-auto">
                  <img
                    src="/zero-logo.png"
                    alt="ZERO"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="font-mono text-xs text-primary mb-1">// identity.load()</div>
                    <div className="text-lg font-bold">ZERO</div>
                    <div className="text-sm text-muted-foreground">Software Architect Solutions</div>
                  </div>
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className="bg-card/80 border border-border rounded-lg px-2 py-1 flex items-center gap-1.5 text-xs font-mono backdrop-blur-sm">
                      <MapPin size={10} className="text-primary" /> {t("contact.locationValue")}
                    </div>
                    <div className="bg-card/80 border border-green-400/30 rounded-lg px-2 py-1 flex items-center gap-1.5 text-xs font-mono backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> {t("home.heroBadge")}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <span className="font-mono text-primary text-xs tracking-widest uppercase mb-4 block">// developer.profile()</span>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {t("about.intro")} <span className="text-primary glow-cyan-text">ZERO</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {t("about.bio")}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {t("about.missionDesc")}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={14} className="text-primary" /> {t("home.statsYears")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Coffee size={14} className="text-primary" /> 1000+ كوب قهوة
                </div>
              </div>

              <Link href="/cv">
                <span className="inline-flex items-center gap-2 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground px-6 py-2.5 rounded-lg font-mono text-sm transition-all cursor-pointer">
                  <Download size={15} /> {t("nav.cv")}
                </span>
              </Link>
            </motion.div>
          </div>
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
            {[
              { value: statsQ.data?.projects ?? 52, suffix: "+", label: t("home.statsProjects"), color: "text-primary" },
              { value: statsQ.data?.users ?? 30, suffix: "+", label: t("home.statsClients"), color: "text-green-400" },
              { value: 5, suffix: "+", label: t("home.statsYears"), color: "text-yellow-400" },
              { value: 100, suffix: "%", label: t("home.statsSatisfaction"), color: "text-purple-400" },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="p-4">
                <div className={`text-4xl font-bold font-mono mb-1 ${s.color}`}>
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <p className="text-muted-foreground text-sm">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-14">
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-3 block">// skills.proficiency()</span>
            <h2 className="text-3xl font-bold">{t("about.skillsTitle").split(" ").slice(0, -1).join(" ")} <span className="text-primary glow-cyan-text">{t("about.skillsTitle").split(" ").slice(-1)}</span></h2>
          </div>
          <div className="space-y-5">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{skill.name}</span>
                  <span className="font-mono text-primary">{skill.level}%</span>
                </div>
                <div className="h-2 bg-card border border-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: i * 0.08, ease: "easeOut" }}
                    className={`h-full ${skill.color} rounded-full relative`}
                  >
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-lg" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech icons */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">التقنيات التي <span className="text-primary glow-cyan-text">أتقنها</span></h2>
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-3xl mx-auto"
          >
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                variants={fadeUp}
                className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:-translate-y-1 transition-all group"
              >
                <div className="group-hover:scale-110 transition-transform">{tech.icon}</div>
                <span className="font-mono text-xs text-muted-foreground">{tech.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-14">
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-3 block">// core.values()</span>
            <h2 className="text-3xl font-bold">{t("about.values")} <span className="text-primary glow-cyan-text">{t("about.valuesSub")}</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary/40 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0">{v.icon}</div>
                <div>
                  <h3 className="font-bold mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14">
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-3 block">// career.timeline()</span>
            <h2 className="text-3xl font-bold">{t("about.experience")} <span className="text-primary glow-cyan-text">ZERO</span></h2>
          </div>
          <div className="relative">
            <div className="absolute right-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 items-start pr-14 relative"
                >
                  <div className="absolute right-2 top-2 w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center text-sm z-10">
                    {item.icon}
                  </div>
                  <div className="flex-1 bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{item.year}</span>
                      <h3 className="font-bold">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("about.contactTitle")}</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">{t("about.contactSubtitle")}</p>
          <a href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-mono text-sm hover:bg-primary/90 glow-cyan transition-all">
            {t("about.contactButton")} ←
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}