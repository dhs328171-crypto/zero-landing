import { useState } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, Globe, Search, Eye, Share2, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface PageSeo {
  id: string; label: string; path: string;
  title: string; description: string; keywords: string; ogImage: string; canonical: string; index: boolean;
}

const initialPages: PageSeo[] = [
  { id: "home", label: "الرئيسية", path: "/", title: "ZERO — مطور ويب احترافي | Software Architect Solutions", description: "أبني مواقع وتطبيقات رقمية تتفوق على التوقعات. خبرة 5+ سنوات في React، Next.js، Node.js.", keywords: "مطور ويب، برمجة مواقع، تطوير تطبيقات، React، Next.js، السعودية", ogImage: "/zero-logo.png", canonical: "https://zero.dev/", index: true },
  { id: "portfolio", label: "الأعمال", path: "/portfolio", title: "أعمال ZERO — مشاريع ويب احترافية", description: "معرض أعمال يضم 9+ مشاريع حقيقية في التجارة الإلكترونية، لوحات التحكم، وتطبيقات الويب.", keywords: "معرض أعمال، مشاريع ويب، تطوير متاجر إلكترونية", ogImage: "/zero-logo.png", canonical: "https://zero.dev/portfolio", index: true },
  { id: "about", label: "من أنا", path: "/about", title: "من أنا — ZERO | مطور Full Stack", description: "تعرف على رحلة ZERO في تطوير الويب. خبرة، مهارات، وقيم مهنية.", keywords: "مطور سعودي، Full Stack، React Developer", ogImage: "/zero-logo.png", canonical: "https://zero.dev/about", index: true },
  { id: "services", label: "الخدمات", path: "/services", title: "خدمات ZERO — تطوير مواقع ومتاجر وتطبيقات", description: "خدمات تطوير شاملة: مواقع ويب، متاجر إلكترونية، تطبيقات موبايل، لوحات تحكم.", keywords: "خدمات برمجة، تطوير موقع، متجر إلكتروني", ogImage: "/zero-logo.png", canonical: "https://zero.dev/services", index: true },
  { id: "pricing", label: "الأسعار", path: "/pricing", title: "أسعار ZERO — باقات شفافة بدون رسوم مخفية", description: "3 باقات واضحة تناسب كل ميزانية. اعرف ما ستحصل عليه بالضبط قبل البداية.", keywords: "أسعار تطوير مواقع، تكلفة موقع ويب، أسعار برمجة", ogImage: "/zero-logo.png", canonical: "https://zero.dev/pricing", index: true },
  { id: "blog", label: "المدونة", path: "/blog", title: "مدونة ZERO — مقالات تقنية أسبوعية", description: "مقالات تقنية متميزة في React، Next.js، TypeScript، وأحدث تقنيات الويب.", keywords: "مدونة تقنية، مقالات برمجة، React، TypeScript", ogImage: "/zero-logo.png", canonical: "https://zero.dev/blog", index: true },
  { id: "contact", label: "التواصل", path: "/contact", title: "تواصل مع ZERO — استشارة مجانية", description: "تواصل معي لمناقشة مشروعك. استشارة مجانية وعرض سعر خلال 24 ساعة.", keywords: "تواصل مطور ويب، استشارة مجانية، طلب مشروع", ogImage: "/zero-logo.png", canonical: "https://zero.dev/contact", index: true },
];

const scoreItems = [
  { label: "العنوان (Title)", check: (p: PageSeo) => p.title.length >= 40 && p.title.length <= 70, tip: "40-70 حرف" },
  { label: "الوصف (Description)", check: (p: PageSeo) => p.description.length >= 120 && p.description.length <= 160, tip: "120-160 حرف" },
  { label: "الكلمات المفتاحية", check: (p: PageSeo) => p.keywords.split(",").length >= 3, tip: "3+ كلمات" },
  { label: "OG Image", check: (p: PageSeo) => !!p.ogImage, tip: "صورة مشاركة" },
  { label: "Canonical URL", check: (p: PageSeo) => !!p.canonical, tip: "رابط أساسي" },
  { label: "قابل للفهرسة", check: (p: PageSeo) => p.index, tip: "index = true" },
];

export default function SeoManager() {
  const [pages, setPages] = useState<PageSeo[]>(initialPages);
  const [activePage, setActivePage] = useState("home");
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState<"google" | "social">("google");
  const [expanded, setExpanded] = useState<string | null>(null);

  const current = pages.find((p) => p.id === activePage)!;
  const update = (field: keyof PageSeo, value: string | boolean) => {
    setPages((prev) => prev.map((p) => p.id === activePage ? { ...p, [field]: value } : p));
  };

  const saveAll = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const score = (page: PageSeo) => {
    const passed = scoreItems.filter((item) => item.check(page)).length;
    return Math.round((passed / scoreItems.length) * 100);
  };

  const scoreColor = (s: number) => s >= 80 ? "text-green-400" : s >= 50 ? "text-yellow-400" : "text-red-400";
  const scoreBg = (s: number) => s >= 80 ? "bg-green-400" : s >= 50 ? "bg-yellow-400" : "bg-red-400";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">إعدادات SEO</h1>
            <p className="text-sm text-muted-foreground font-mono">// seo.optimize()</p>
          </div>
          <div className="flex gap-3">
            {saved && <span className="flex items-center gap-1.5 text-sm text-green-400 font-mono"><CheckCircle size={14} />تم الحفظ!</span>}
            <button onClick={saveAll} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-mono hover:bg-primary/90 glow-cyan transition-all">
              <Save size={16} /> حفظ التغييرات
            </button>
          </div>
        </div>

        {/* Overview scores */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2"><Globe size={14} className="text-primary" />نظرة عامة على جميع الصفحات</h2>
          <div className="space-y-2">
            {pages.map((page) => {
              const s = score(page);
              return (
                <div key={page.id}>
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === page.id ? null : page.id)}>
                    <button onClick={(e) => { e.stopPropagation(); setActivePage(page.id); }} className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition-all ${activePage === page.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                      {page.label}
                    </button>
                    <code className="text-[10px] text-muted-foreground flex-1">{page.path}</code>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-background rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${scoreBg(s)}`} style={{ width: `${s}%` }} />
                      </div>
                      <span className={`text-xs font-bold font-mono ${scoreColor(s)}`}>{s}%</span>
                    </div>
                    {expanded === page.id ? <ChevronUp size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
                  </div>
                  {expanded === page.id && (
                    <div className="ml-4 mt-2 pl-3 border-r border-border space-y-1">
                      {scoreItems.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-[10px]">
                          {item.check(page) ? <CheckCircle size={10} className="text-green-400" /> : <AlertCircle size={10} className="text-red-400" />}
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="text-muted-foreground/50">({item.tip})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-5">
            {/* Page selector */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">الصفحة</label>
              <div className="flex flex-wrap gap-2">
                {pages.map((p) => (
                  <button key={p.id} onClick={() => setActivePage(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${activePage === p.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Search size={14} className="text-primary" />
                إعدادات {current.label}
              </h3>
              {[
                { label: "عنوان الصفحة (Title)", field: "title" as keyof PageSeo, type: "input", max: 70, tip: `${current.title.length}/70 حرف` },
                { label: "الوصف (Description)", field: "description" as keyof PageSeo, type: "textarea", max: 160, tip: `${current.description.length}/160 حرف` },
                { label: "الكلمات المفتاحية (Keywords)", field: "keywords" as keyof PageSeo, type: "input", tip: "افصل بفاصلة" },
                { label: "OG Image URL", field: "ogImage" as keyof PageSeo, type: "input", tip: "للمشاركة على السوشيال" },
                { label: "Canonical URL", field: "canonical" as keyof PageSeo, type: "input" },
              ].map((f) => (
                <div key={f.field}>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-muted-foreground">{f.label}</label>
                    {f.tip && <span className={`text-[10px] font-mono ${f.field === "title" && (current.title.length < 40 || current.title.length > 70) ? "text-red-400" : f.field === "description" && (current.description.length < 120 || current.description.length > 160) ? "text-yellow-400" : "text-muted-foreground/50"}`}>{f.tip}</span>}
                  </div>
                  {f.type === "textarea" ? (
                    <textarea value={current[f.field] as string} onChange={(e) => update(f.field, e.target.value)} rows={2} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
                  ) : (
                    <input value={current[f.field] as string} onChange={(e) => update(f.field, e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" dir={f.field === "canonical" || f.field === "ogImage" ? "ltr" : undefined} />
                  )}
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={current.index} onChange={(e) => update("index", e.target.checked)} className="accent-primary" />
                السماح لمحركات البحث بالفهرسة (index)
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setPreviewMode("google")} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all font-mono ${previewMode === "google" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                  <Search size={11} /> Google
                </button>
                <button onClick={() => setPreviewMode("social")} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all font-mono ${previewMode === "social" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                  <Share2 size={11} /> Social
                </button>
                <span className="text-xs text-muted-foreground font-mono ms-auto">// preview</span>
              </div>

              {previewMode === "google" ? (
                <div className="bg-white rounded-xl p-5 text-left" dir="ltr">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      <img src="/zero-logo.png" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600">zero.dev › {current.path}</p>
                    </div>
                  </div>
                  <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer font-normal leading-snug mb-1 truncate">{current.title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{current.description}</p>
                </div>
              ) : (
                <div className="bg-[#1c1c1c] rounded-xl overflow-hidden">
                  <div className="h-36 bg-gradient-to-br from-card to-background flex items-center justify-center border-b border-white/10">
                    <img src={current.ogImage || "/zero-logo.png"} alt="" className="h-16 object-contain drop-shadow-lg" />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-gray-400 uppercase">ZERO.DEV</p>
                    <p className="text-white text-sm font-semibold leading-snug line-clamp-2">{current.title}</p>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-1">{current.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Score card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold">SEO Score</h3>
                <span className={`text-2xl font-bold font-mono ${scoreColor(score(current))}`}>{score(current)}%</span>
              </div>
              <div className="space-y-2.5">
                {scoreItems.map((item) => {
                  const pass = item.check(current);
                  return (
                    <div key={item.label} className="flex items-center gap-2">
                      {pass ? <CheckCircle size={13} className="text-green-400 flex-shrink-0" /> : <AlertCircle size={13} className="text-red-400 flex-shrink-0" />}
                      <span className="text-xs flex-1">{item.label}</span>
                      <span className={`text-[10px] font-mono ${pass ? "text-green-400" : "text-red-400"}`}>{pass ? "✓" : "✗"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Robots */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-bold text-primary font-mono mb-2">robots.txt Preview</h3>
              <pre className="text-[10px] font-mono text-muted-foreground bg-background rounded-lg p-3" dir="ltr">{`User-agent: *
Allow: /
Disallow: /admin
${pages.filter((p) => !p.index).map((p) => `Disallow: ${p.path}`).join("\n")}
Sitemap: https://zero.dev/sitemap.xml`}</pre>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
