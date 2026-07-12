import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Search, Clock, Eye, ArrowLeft, Tag, Flame, BookOpen, Loader2 } from "lucide-react";
import { useT } from "@/contexts/i18n-context";
import { useBlog } from "@/lib/queries";
import { Pager } from "@/components/ui/pager";

function fmtDate(s: string) {
  try { return new Date(s).toISOString().slice(0, 10); } catch { return s; }
}

export default function Blog() {
  const t = useT();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [page, setPage] = useState(1);

  // Debounced search → reset to page 1
  useEffect(() => {
    const x = setTimeout(() => setPage(1), 350);
    return () => clearTimeout(x);
  }, [search, activeTag]);

  const blogQ = useBlog({ page, limit: 9, q: search, tag: activeTag });
  const posts = blogQ.data?.items ?? [];
  const total = blogQ.data?.total ?? 0;
  const pages = blogQ.data?.pages ?? 1;

  // Featured = first hot post (or first post if no hot)
  const featured = posts.find((p) => p.hot) ?? posts[0];
  const rest = posts.filter((p) => p.id !== featured?.id);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-4 block">// blog.articles()</span>
            <h1 className="text-5xl font-bold mb-4">
              {t("blog.title")} <span className="text-primary glow-cyan-text">ZERO</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">{t("blog.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <div className="container mx-auto px-4 mb-10">
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { icon: <BookOpen size={14} className="text-primary" />, val: `${total}`, label: t("blog.title") },
            { icon: <Eye size={14} className="text-green-400" />, val: posts.reduce((s, p) => s + (p.views || 0), 0).toLocaleString(), label: t("blog.views") },
            { icon: <Flame size={14} className="text-orange-400" />, val: `${posts.filter((p) => p.hot).length}`, label: t("blog.hot") },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm bg-card border border-border px-4 py-2 rounded-full">
              {s.icon}
              <span className="font-bold text-foreground">{s.val}</span>
              <span className="text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search + Tags */}
      <div className="container mx-auto px-4 mb-10">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="relative">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("blog.searchPlaceholder")}
              className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveTag("")}
              className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                activeTag === ""
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {t("blog.allTags")}
            </button>
            {["React", "Next.js", "TypeScript", "Node.js", "Tailwind", "Database", "DevOps"].map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                  activeTag === tag
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Post */}
      {featured && (
        <section className="pb-12">
          <div className="container mx-auto px-4">
            <Link href={`/blog/${featured.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group rounded-2xl overflow-hidden border border-primary/20 bg-card cursor-pointer hover:border-primary/50 transition-all shadow-xl shadow-primary/5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-auto overflow-hidden">
                    {featured.image ? (
                      <img src={featured.image} alt={featured.title} loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-background flex items-center justify-center text-6xl text-muted-foreground/20">{"</>"}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-l from-card to-transparent" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className="bg-primary text-primary-foreground text-xs font-mono px-2.5 py-1 rounded-full">{t("blog.featured")}</span>
                      {featured.hot && (
                        <span className="bg-orange-400 text-background text-xs font-mono px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Flame size={10} />{t("blog.hot")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full w-fit mb-4">
                      {featured.tag}
                    </span>
                    <h2 className="text-2xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{featured.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1"><Clock size={11} />{fmtDate(featured.createdAt)}</span>
                        <span className="flex items-center gap-1"><Eye size={11} />{(featured.views || 0).toLocaleString()}</span>
                      </div>
                      <span className="flex items-center gap-1 text-sm text-primary font-mono hover:gap-2 transition-all">
                        {t("blog.readMore")} <ArrowLeft size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>
      )}

      {/* Posts grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {blogQ.isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 size={20} className="animate-spin mr-2" /> {t("common.loading")}
            </div>
          ) : rest.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-card border border-dashed border-border rounded-xl">
              {t("blog.noPosts")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link href={`/blog/${p.slug}`}>
                    <article className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all h-full cursor-pointer">
                      {p.image && (
                        <div className="overflow-hidden h-44">
                          <img src={p.image} alt={p.title} loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Tag size={9} />{p.tag}
                          </span>
                          {p.hot && (
                            <span className="text-xs font-mono text-orange-400 flex items-center gap-1">
                              <Flame size={10} />{t("blog.hot")}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{p.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-3 border-t border-border">
                          <span className="flex items-center gap-1"><Clock size={10} />{fmtDate(p.createdAt)}</span>
                          <span className="flex items-center gap-1"><Eye size={10} />{(p.views || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!blogQ.isLoading && pages > 1 && (
            <div className="mt-10 flex justify-center">
              <Pager page={page} pages={pages} total={total} onChange={setPage} />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
