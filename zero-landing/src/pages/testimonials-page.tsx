import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useT, useI18n } from "@/contexts/i18n-context";
import { useTestimonials, useStats } from "@/lib/queries";

const colors = [
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-purple-500 to-violet-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-amber-500",
  "from-teal-500 to-cyan-500",
  "from-red-500 to-orange-500",
  "from-indigo-500 to-blue-500",
];

export default function TestimonialsPage() {
  const t = useT();
  const { dir } = useI18n();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState(0);
  const perPage = 6;

  const testimonialsQ = useTestimonials({ limit: 100 });
  const statsQ = useStats();
  const reviews = testimonialsQ.data?.items ?? [];

  const filtered = useMemo(
    () => (filter === 0 ? reviews : reviews.filter((r) => r.rating >= filter)),
    [reviews, filter]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice(page * perPage, (page + 1) * perPage);

  const stats = [
    { label: t("home.statsClients"), value: `${statsQ.data?.users ?? 30}+` },
    { label: t("home.statsProjects"), value: `${statsQ.data?.projects ?? 52}+` },
    { label: t("testimonials.title"), value: "4.9" },
    { label: t("home.statsYears"), value: "5+" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-10" />
          <div className="container mx-auto max-w-4xl relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-mono text-xs text-primary mb-3">()TESTIMONIALS.SOCIAL_PROOF //</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("testimonials.title").split(" ").slice(0, -1).join(" ")}{" "}
                <span className="text-primary glow-cyan-text">
                  {t("testimonials.title").split(" ").slice(-1)}
                </span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8">{t("testimonials.subtitle")}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="text-2xl font-bold text-primary font-mono">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filter */}
        <section className="py-4 px-4">
          <div className="container mx-auto max-w-5xl flex items-center gap-3 flex-wrap">
            <Filter size={14} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t("testimonials.filterBy")}:</span>
            <button
              onClick={() => { setFilter(0); setPage(0); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                filter === 0 ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {t("testimonials.allRatings")}
            </button>
            {[5, 4, 3].map((r) => (
              <button
                key={r}
                onClick={() => { setFilter(r); setPage(0); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                  filter === r ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {r}+ <Star size={11} className="fill-current" />
              </button>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-5xl">
            {testimonialsQ.isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 size={18} className="animate-spin mr-2" /> {t("common.loading")}
              </div>
            ) : visible.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card border border-dashed border-border rounded-xl">
                {t("common.noResults")}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {visible.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <Quote size={20} className="text-primary/20 mb-3" />

                    <div className="flex mb-2">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} size={12} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{r.text}"</p>

                    <div className="border-t border-border/50 pt-3 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {r.avatar || r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.role}
                          {r.company ? ` • ${r.company}` : ""}
                        </p>
                      </div>
                    </div>
                    {r.featured && (
                      <div className="mt-2">
                        <span className="text-[10px] font-mono text-yellow-400/80 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                          {t("blog.featured")}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:border-primary/50 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
                <span className="text-xs text-muted-foreground font-mono">
                  {t("testimonials.page")} {page + 1} {t("testimonials.of")} {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:border-primary/50 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
