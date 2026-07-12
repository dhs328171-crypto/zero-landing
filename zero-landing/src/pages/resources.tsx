import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileCode, FileText, Layout, Terminal, Search, Star, Eye } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/i18n-context";

const resources = [
  {
    title: "قالب Next.js Starter احترافي",
    desc: "قالب جاهز مع Auth، Dark Mode، i18n، Tailwind، وهيكل مشروع مثالي",
    type: "template",
    icon: Layout,
    category: "قوالب",
    downloads: 1240,
    rating: 4.9,
    tags: ["Next.js", "TypeScript", "Tailwind"],
    free: true,
    color: "from-blue-500/10 to-cyan-500/10",
  },
  {
    title: "دليل Best Practices للـ React",
    desc: "مرجع شامل لأفضل ممارسات React من المشاريع الحقيقية",
    type: "guide",
    icon: FileText,
    category: "أدلة",
    downloads: 890,
    rating: 4.8,
    tags: ["React", "Performance", "Patterns"],
    free: true,
    color: "from-green-500/10 to-emerald-500/10",
  },
  {
    title: "مكونات UI بالعربي RTL",
    desc: "مجموعة مكونات shadcn/ui مخصصة للغة العربية وRTL",
    type: "components",
    icon: Layout,
    category: "مكونات",
    downloads: 2100,
    rating: 5.0,
    tags: ["RTL", "Arabic", "shadcn"],
    free: true,
    color: "from-purple-500/10 to-violet-500/10",
  },
  {
    title: "Cheatsheet للـ Git والـ Terminal",
    desc: "مرجع سريع لأهم أوامر Git و Linux Terminal للمطورين",
    type: "cheatsheet",
    icon: Terminal,
    category: "مراجع",
    downloads: 3400,
    rating: 4.9,
    tags: ["Git", "Linux", "CLI"],
    free: true,
    color: "from-orange-500/10 to-amber-500/10",
  },
  {
    title: "API Integration Guide",
    desc: "كيفية التكامل مع APIs شائعة (Stripe, Firebase, AWS) بأمثلة كاملة",
    type: "guide",
    icon: FileCode,
    category: "أدلة",
    downloads: 670,
    rating: 4.7,
    tags: ["API", "Stripe", "Firebase"],
    free: true,
    color: "from-red-500/10 to-rose-500/10",
  },
  {
    title: "Database Schema Templates",
    desc: "قوالب جداول قواعد البيانات لأشهر أنواع التطبيقات (متجر، حجوزات، تعليم)",
    type: "template",
    icon: FileCode,
    category: "قوالب",
    downloads: 780,
    rating: 4.8,
    tags: ["PostgreSQL", "Schema", "Drizzle"],
    free: true,
    color: "from-teal-500/10 to-cyan-500/10",
  },
  {
    title: "قائمة فحص قبل الإطلاق",
    desc: "Checklist شاملة لما يجب التحقق منه قبل إطلاق أي موقع أو تطبيق",
    type: "cheatsheet",
    icon: FileText,
    category: "مراجع",
    downloads: 1890,
    rating: 5.0,
    tags: ["SEO", "Performance", "Security"],
    free: true,
    color: "from-indigo-500/10 to-blue-500/10",
  },
  {
    title: "Tailwind CSS Custom Design System",
    desc: "نظام تصميم متكامل مبني على Tailwind مع ألوان وخطوط وتباعد موحّد",
    type: "template",
    icon: Layout,
    category: "قوالب",
    downloads: 1120,
    rating: 4.9,
    tags: ["Tailwind", "Design", "CSS"],
    free: true,
    color: "from-pink-500/10 to-rose-500/10",
  },
];

const categories = ["الكل", "قوالب", "أدلة", "مكونات", "مراجع"];

export default function Resources() {
  const { dir } = useI18n();
  const [cat, setCat] = useState("الكل");
  const [search, setSearch] = useState("");

  const filtered = resources.filter((r) => {
    const matchCat = cat === "الكل" || r.category === cat;
    const matchSearch = !search || r.title.includes(search) || r.desc.includes(search);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-10" />
          <div className="container mx-auto max-w-3xl relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-mono text-xs text-primary mb-3">()RESOURCES.FREE //</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-primary">موارد</span> مجانية
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                قوالب، أدلة، ومكونات من تجربتي الحقيقية — مجاناً 100%
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                {[["8+", "موارد"], ["11K+", "تنزيل"], ["4.9", "تقييم"]].map(([v, l]) => (
                  <div key={l} className="bg-card border border-border rounded-xl p-3">
                    <div className="text-xl font-bold text-primary font-mono">{v}</div>
                    <div className="text-xs text-muted-foreground">{l}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search + Filter */}
        <section className="py-4 px-4">
          <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث في الموارد..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-card border-border pr-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${cat === c ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/50"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-6 px-4 pb-16">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`bg-gradient-to-br ${r.color} border border-border rounded-xl p-5 hover:border-primary/30 transition-all group`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-background/80 border border-border rounded-xl flex items-center justify-center flex-shrink-0">
                      <r.icon size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-sm">{r.title}</h3>
                        {r.free && (
                          <span className="text-[10px] font-mono text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full flex-shrink-0">
                            مجاني
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{r.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {r.tags.map((tag) => (
                          <span key={tag} className="text-[10px] font-mono text-muted-foreground bg-background/50 border border-border px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Download size={11} />{r.downloads.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><Star size={11} className="fill-yellow-400 text-yellow-400" />{r.rating}</span>
                        </div>
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-7 px-3 font-mono glow-cyan">
                          <Download size={11} className="ml-1" />
                          تنزيل
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
