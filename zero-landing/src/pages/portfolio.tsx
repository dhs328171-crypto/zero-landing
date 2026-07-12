import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbox } from "@/components/ui/lightbox";
import { ExternalLink, Eye, Filter, Search, Loader2 } from "lucide-react";
import { useT } from "@/contexts/i18n-context";
import { useProjects } from "@/lib/queries";
import { Pager } from "@/components/ui/pager";

export default function Portfolio() {
  const t = useT();
  const [activeFilter, setActiveFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const x = setTimeout(() => setPage(1), 350);
    return () => clearTimeout(x);
  }, [search, activeFilter]);

  const projectsQ = useProjects({ page, limit: 9, q: search, category: activeFilter });
  const projects = projectsQ.data?.items ?? [];
  const total = projectsQ.data?.total ?? 0;
  const pages = projectsQ.data?.pages ?? 1;

  // Build categories from current page (cheap, decent UX)
  const categories = Array.from(new Set(projects.map((p) => p.category))).filter(Boolean);

  const lightboxImages = projects.map((p) => ({
    src: p.image,
    title: p.title,
    desc: p.description,
    url: p.url || "#",
  }));

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-4 block">// portfolio.showcase()</span>
            <h1 className="text-5xl font-bold mb-4">
              {t("portfolio.title").split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-primary glow-cyan-text">{t("portfolio.title").split(" ").slice(-1)}</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              {total} {t("home.statsProjects")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search + Filters */}
      <section className="sticky top-20 z-30 bg-background/80 backdrop-blur-md border-b border-border py-4">
        <div className="container mx-auto px-4 space-y-3">
          <div className="relative max-w-md">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("portfolio.searchPlaceholder")}
              className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter size={14} className="text-primary flex-shrink-0" />
            <button
              onClick={() => setActiveFilter("")}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-mono transition-all border ${
                activeFilter === ""
                  ? "bg-primary text-primary-foreground border-primary glow-cyan"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {t("portfolio.allCategories")}
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveFilter(activeFilter === c ? "" : c)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-mono transition-all border ${
                  activeFilter === c
                    ? "bg-primary text-primary-foreground border-primary glow-cyan"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {projectsQ.isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 size={20} className="animate-spin mr-2" /> {t("common.loading")}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-card border border-dashed border-border rounded-xl">
              {t("portfolio.noProjects")}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {projects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className={`group relative bg-card border rounded-2xl overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 ${
                      project.featured ? "border-primary/20" : "border-border"
                    }`}
                  >
                    {project.featured && (
                      <div className="absolute top-3 right-3 z-20 bg-primary text-primary-foreground text-[10px] font-mono px-2 py-0.5 rounded-full">
                        {t("blog.featured")}
                      </div>
                    )}
                    <div className="relative h-52 overflow-hidden">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-background flex items-center justify-center text-6xl text-muted-foreground/20">{"</>"}</div>
                      )}
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                        <button
                          onClick={() => setLightboxIdx(i)}
                          className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-primary hover:glow-border transition-all"
                          title={t("portfolio.viewProject")}
                        >
                          <Eye size={18} />
                        </button>
                        {project.url && project.url !== "#" && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all"
                            title={t("portfolio.visitSite")}
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        {project.category}
                      </span>
                      <h3 className="font-bold text-lg mt-3 mb-2">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech.split(/[+,/]/).map((tch, ti) => (
                          <span key={ti} className="text-[10px] font-mono bg-background border border-border rounded px-1.5 py-0.5 text-muted-foreground">
                            {tch.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!projectsQ.isLoading && pages > 1 && (
            <div className="mt-10 flex justify-center">
              <Pager page={page} pages={pages} total={total} onChange={setPage} />
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-card/30 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("home.ctaTitle")}</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">{t("home.ctaSubtitle")}</p>
          <a
            href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-mono text-sm hover:bg-primary/90 glow-cyan transition-all"
          >
            {t("home.ctaButton")} ←
          </a>
        </div>
      </section>

      <Lightbox
        images={lightboxImages}
        index={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onNext={() => setLightboxIdx((i) => (i !== null ? (i + 1) % projects.length : 0))}
        onPrev={() => setLightboxIdx((i) => (i !== null ? (i - 1 + projects.length) % projects.length : 0))}
      />
      <Footer />
    </div>
  );
}
