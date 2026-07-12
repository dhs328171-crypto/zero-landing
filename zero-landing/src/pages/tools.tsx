import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ExternalLink, Search, Star, Code2, Palette, Database, Terminal, Cpu, Smartphone, Zap, Globe, Shield, BarChart3, GitBranch, Package, Layers } from "lucide-react";

type Tool = {
  name: string;
  desc: string;
  url: string;
  category: string;
  rating: number;
  free: boolean;
  tags: string[];
  color: string;
  icon: React.ReactNode;
  hot?: boolean;
};

const tools: Tool[] = [
  // Development
  { name: "VS Code", desc: "محرر الكود الأكثر انتشاراً. ملحقات لا حصر لها وأداء استثنائي.", url: "https://code.visualstudio.com", category: "تطوير", rating: 5, free: true, tags: ["IDE", "Editor"], color: "text-blue-400", icon: <Code2 size={22} className="text-blue-400" />, hot: true },
  { name: "GitHub", desc: "منصة استضافة الكود والتعاون بين المطورين. لا غنى عنها.", url: "https://github.com", category: "تطوير", rating: 5, free: true, tags: ["Git", "Hosting"], color: "text-white", icon: <GitBranch size={22} className="text-white" /> },
  { name: "Postman", desc: "اختبار وتوثيق APIs بسهولة. الأفضل في اختبار الـ REST APIs.", url: "https://postman.com", category: "تطوير", rating: 4.8, free: true, tags: ["API", "Testing"], color: "text-orange-400", icon: <Terminal size={22} className="text-orange-400" /> },
  { name: "Vercel", desc: "النشر الأسرع لمشاريع Next.js وReact. تجربة سلسة من اللحظة الأولى.", url: "https://vercel.com", category: "تطوير", rating: 4.9, free: true, tags: ["Hosting", "Deploy"], color: "text-white", icon: <Zap size={22} className="text-white" />, hot: true },
  { name: "Supabase", desc: "البديل المفتوح المصدر لـ Firebase. PostgreSQL + Auth + Storage.", url: "https://supabase.com", category: "تطوير", rating: 4.8, free: true, tags: ["Database", "Backend"], color: "text-green-400", icon: <Database size={22} className="text-green-400" /> },
  { name: "Railway", desc: "نشر سحابي بسيط للـ Backends والـ Databases بضغطة واحدة.", url: "https://railway.app", category: "تطوير", rating: 4.7, free: true, tags: ["Deploy", "Cloud"], color: "text-purple-400", icon: <Globe size={22} className="text-purple-400" /> },
  { name: "Drizzle ORM", desc: "ORM من الجيل الجديد لـ TypeScript. أسرع وأبسط من Prisma.", url: "https://orm.drizzle.team", category: "تطوير", rating: 4.7, free: true, tags: ["ORM", "Database", "TypeScript"], color: "text-yellow-400", icon: <Database size={22} className="text-yellow-400" /> },
  { name: "Bun", desc: "Runtime جديد يُنافس Node.js بسرعة خيالية. الجيل القادم من JavaScript.", url: "https://bun.sh", category: "تطوير", rating: 4.6, free: true, tags: ["Runtime", "JS"], color: "text-orange-300", icon: <Package size={22} className="text-orange-300" /> },
  // Design
  { name: "Figma", desc: "الأداة الذهبية لتصميم الواجهات والـ Prototypes. المعيار الصناعي.", url: "https://figma.com", category: "تصميم", rating: 5, free: true, tags: ["UI/UX", "Prototype"], color: "text-purple-400", icon: <Palette size={22} className="text-purple-400" />, hot: true },
  { name: "shadcn/ui", desc: "مكونات React جاهزة وقابلة للتخصيص الكامل. بالكود لا بـ CDN.", url: "https://ui.shadcn.com", category: "تصميم", rating: 5, free: true, tags: ["Components", "React"], color: "text-foreground", icon: <Layers size={22} />, hot: true },
  { name: "Tailwind CSS", desc: "Utility-first CSS framework. لبناء تصاميم سريعة وجميلة.", url: "https://tailwindcss.com", category: "تصميم", rating: 5, free: true, tags: ["CSS", "Styling"], color: "text-cyan-400", icon: <Palette size={22} className="text-cyan-400" /> },
  { name: "Framer Motion", desc: "مكتبة انيميشن لـ React. تحويل المواقع إلى تجارب بصرية مذهلة.", url: "https://www.framer.com/motion", category: "تصميم", rating: 4.9, free: true, tags: ["Animation", "React"], color: "text-pink-400", icon: <Zap size={22} className="text-pink-400" /> },
  { name: "Coolors", desc: "مولد بالوان احترافي. لإيجاد تناسق ألوان مثالي في ثوانٍ.", url: "https://coolors.co", category: "تصميم", rating: 4.7, free: true, tags: ["Colors", "Palette"], color: "text-yellow-400", icon: <Palette size={22} className="text-yellow-400" /> },
  { name: "Lucide Icons", desc: "مكتبة أيقونات SVG نظيفة وجميلة. 1000+ أيقونة مجانية.", url: "https://lucide.dev", category: "تصميم", rating: 4.8, free: true, tags: ["Icons", "SVG"], color: "text-green-400", icon: <Star size={22} className="text-green-400" /> },
  // AI Tools
  { name: "Claude (Anthropic)", desc: "أذكى نموذج AI للبرمجة والكتابة. نتائج أفضل من ChatGPT في كثير من الحالات.", url: "https://claude.ai", category: "ذكاء اصطناعي", rating: 5, free: true, tags: ["AI", "Code", "Writing"], color: "text-orange-400", icon: <Cpu size={22} className="text-orange-400" />, hot: true },
  { name: "GitHub Copilot", desc: "مساعد AI للكتابة الكود مباشرة في VS Code. يُضاعف الإنتاجية.", url: "https://github.com/features/copilot", category: "ذكاء اصطناعي", rating: 4.8, free: false, tags: ["AI", "Code"], color: "text-primary", icon: <Code2 size={22} className="text-primary" /> },
  { name: "v0 by Vercel", desc: "توليد مكونات React من وصف نصي. مذهل للبدء السريع.", url: "https://v0.dev", category: "ذكاء اصطناعي", rating: 4.6, free: true, tags: ["AI", "UI", "React"], color: "text-white", icon: <Layers size={22} className="text-white" /> },
  { name: "Cursor", desc: "محرر كود بالذكاء الاصطناعي. VS Code + AI في واحد.", url: "https://cursor.sh", category: "ذكاء اصطناعي", rating: 4.9, free: true, tags: ["AI", "IDE", "Editor"], color: "text-blue-400", icon: <Terminal size={22} className="text-blue-400" />, hot: true },
  // Testing & Performance
  { name: "Lighthouse", desc: "أداة Google لقياس أداء المواقع. مدمجة في Chrome مجاناً.", url: "https://developer.chrome.com/docs/lighthouse", category: "الأداء", rating: 4.9, free: true, tags: ["Performance", "SEO", "Audit"], color: "text-yellow-400", icon: <BarChart3 size={22} className="text-yellow-400" /> },
  { name: "Playwright", desc: "اختبار end-to-end قوي ومعتمد. يدعم كل المتصفحات.", url: "https://playwright.dev", category: "الأداء", rating: 4.7, free: true, tags: ["Testing", "E2E"], color: "text-green-400", icon: <Shield size={22} className="text-green-400" /> },
  { name: "Sentry", desc: "تتبع الأخطاء في الإنتاج. تنبيهات فورية عند حدوث مشاكل.", url: "https://sentry.io", category: "الأداء", rating: 4.8, free: true, tags: ["Monitoring", "Errors"], color: "text-purple-400", icon: <Shield size={22} className="text-purple-400" /> },
  // Mobile
  { name: "Expo", desc: "إطار React Native المُبسَّط. بناء تطبيقات iOS وAndroid بكود واحد.", url: "https://expo.dev", category: "موبايل", rating: 4.8, free: true, tags: ["Mobile", "React Native"], color: "text-white", icon: <Smartphone size={22} className="text-white" /> },
  { name: "React Native", desc: "المعيار الذهبي لبناء تطبيقات جوال بـ JavaScript.", url: "https://reactnative.dev", category: "موبايل", rating: 4.7, free: true, tags: ["Mobile", "Cross-platform"], color: "text-cyan-400", icon: <Smartphone size={22} className="text-cyan-400" /> },
];

const categories = ["الكل", "تطوير", "تصميم", "ذكاء اصطناعي", "الأداء", "موبايل"];

export default function Tools() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");

  const filtered = tools.filter((t) => {
    const matchCat = activeCategory === "الكل" || t.category === activeCategory;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.includes(search) || t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const hotTools = tools.filter((t) => t.hot);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-15" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-4 block">// tools.curated()</span>
            <h1 className="text-5xl font-bold mb-4">أدوات <span className="text-primary glow-cyan-text">المطور</span></h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">{tools.length}+ أداة مختارة بعناية من قِبَل ZERO — ترافقني في كل مشروع</p>
          </motion.div>
        </div>
      </section>

      {/* Hot Tools */}
      <div className="container mx-auto px-4 mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-orange-400" />
          <span className="font-mono text-sm text-orange-400">الأدوات الأكثر استخداماً</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {hotTools.map((t, i) => (
            <a key={i} href={t.url} target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2.5 bg-card border border-orange-400/20 hover:border-orange-400/50 rounded-xl px-4 py-2.5 transition-all hover:scale-[1.02]">
              {t.icon}
              <span className="text-sm font-medium whitespace-nowrap">{t.name}</span>
              <span className="text-[10px] font-mono bg-orange-400/10 text-orange-400 px-1.5 py-0.5 rounded">🔥</span>
            </a>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="container mx-auto px-4 mb-10">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن أداة..."
              className="w-full bg-card border border-border rounded-xl pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-mono transition-all border ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary glow-cyan"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <p className="text-xs text-muted-foreground font-mono mb-6">// عرض {filtered.length} أداة</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((tool, i) => (
              <motion.a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.02 }}
                className="bg-card border border-border hover:border-primary/40 rounded-2xl p-5 group transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                    {tool.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    {tool.hot && (
                      <span className="text-[10px] font-mono bg-orange-400/10 text-orange-400 border border-orange-400/20 px-1.5 py-0.5 rounded">🔥</span>
                    )}
                    {tool.free ? (
                      <span className="text-[10px] font-mono bg-green-400/10 text-green-400 border border-green-400/20 px-1.5 py-0.5 rounded">مجاني</span>
                    ) : (
                      <span className="text-[10px] font-mono bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-1.5 py-0.5 rounded">مدفوع</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{tool.name}</h3>
                  <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{tool.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {tool.tags.slice(0, 2).map((tag, j) => (
                      <span key={j} className="text-[10px] font-mono bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={10} className="fill-yellow-400" />
                    <span className="text-xs font-mono">{tool.rating}</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-mono">// لا توجد أدوات تطابق البحث</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
