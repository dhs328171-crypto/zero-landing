import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { Clock, Eye, Tag, ArrowRight, Share2, Check, Copy, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { useT } from "@/contexts/i18n-context";
import { useBlogPost, useBlog } from "@/lib/queries";

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const t = useT();
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-background border border-border rounded-xl overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400/60" />
          <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
          <span className="w-3 h-3 rounded-full bg-green-400/60" />
        </div>
        <button onClick={copy} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors font-mono">
          {copied ? <><Check size={12} className="text-green-400" /> {t("common.confirm")}</> : <><Copy size={12} /> {t("common.copy")}</>}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-primary font-mono leading-relaxed" dir="ltr">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function fmtDate(s: string) {
  try { return new Date(s).toISOString().slice(0, 10); } catch { return s; }
}

export default function BlogPost() {
  const t = useT();
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const postQ = useBlogPost(slug);
  const post = postQ.data;

  // Related posts — fetch latest 3 from same tag (or any tag if no match)
  const relatedQ = useBlog({ limit: 4, tag: post?.tag });
  const related = (relatedQ.data?.items ?? []).filter((p) => p.id !== post?.id).slice(0, 3);

  if (postQ.isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-muted-foreground">
          <Loader2 size={20} className="animate-spin mr-2" /> {t("common.loading")}
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="text-center py-32">
          <p className="text-muted-foreground">{t("blog.noPosts")}</p>
          <Link href="/blog">
            <span className="text-primary hover:underline cursor-pointer mt-4 inline-block">
              {t("blog.backToBlog")}
            </span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Split content into paragraphs
  const paragraphs = post.content.split(/\n\n+/).filter(Boolean);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero image */}
      <section className="pt-20 relative">
        <div className="h-72 md:h-96 relative overflow-hidden">
          {post.image ? (
            <img src={post.image} alt={post.title} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl mx-auto -mt-20 relative z-10">
            {/* Main content */}
            <div className="lg:col-span-3">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-6">
                <Link href="/"><span className="hover:text-primary cursor-pointer">{t("nav.home")}</span></Link>
                <ChevronRight size={12} />
                <Link href="/blog"><span className="hover:text-primary cursor-pointer">{t("blog.title")}</span></Link>
                <ChevronRight size={12} />
                <span className="text-primary truncate">{post.title}</span>
              </div>

              <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-8">
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Tag size={10} />{post.tag}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <Clock size={11} />{fmtDate(post.createdAt)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <Eye size={11} />{(post.views || 0).toLocaleString()} {t("blog.views")}
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold mb-6 leading-tight">{post.title}</h1>

                  {/* Author */}
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                    <img src="/zero-logo.png" alt="ZERO" className="w-10 h-10 rounded-full border border-primary/30" />
                    <div>
                      <p className="text-sm font-semibold">ZERO</p>
                      <p className="text-xs text-muted-foreground">{t("about.subtitle")}</p>
                    </div>
                    <div className="mr-auto">
                      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary border border-border hover:border-primary/40 px-3 py-1.5 rounded-lg transition-all font-mono">
                        <Share2 size={12} /> {t("blog.sharePost")}
                      </button>
                    </div>
                  </div>

                  {/* Excerpt (intro) */}
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8 border-r-2 border-primary pr-4">
                    {post.excerpt}
                  </p>

                  {/* Content paragraphs */}
                  <div className="space-y-6">
                    {paragraphs.map((p, i) => {
                      // Detect code blocks (lines starting with #, $, or containing {} or =>)
                      const isCode = /^[#$]/.test(p.trim()) || /^(import|const|function|class|export|{\|})/.test(p.trim());
                      if (isCode) return <CodeBlock key={i} code={p} />;
                      return (
                        <p key={i} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {p}
                        </p>
                      );
                    })}
                  </div>

                  {/* Tags + Share */}
                  <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{t("portfolio.tech")}:</span>
                      <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{post.tag}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(window.location.href)}
                        className="text-xs font-mono text-muted-foreground border border-border hover:border-primary/40 hover:text-primary px-2.5 py-1 rounded-lg transition-all"
                      >
                        {t("blog.sharePost")}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>

              {/* Related */}
              {related.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <BookOpen size={16} className="text-primary" /> {t("blog.relatedPosts")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {related.map((r) => (
                      <Link key={r.id} href={`/blog/${r.slug}`}>
                        <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all cursor-pointer group">
                          <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">{r.tag}</span>
                          <h4 className="text-sm font-medium mt-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">{r.title}</h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* TOC */}
              <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
                <h3 className="text-sm font-bold mb-4 font-mono text-primary">// {t("blog.title")}</h3>
                <ul className="space-y-2">
                  {paragraphs.slice(0, 6).map((_, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                      <span className="font-mono text-primary/40">{String(i + 1).padStart(2, "0")}</span>
                      {t("blog.title")} {i + 1}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 pt-5 border-t border-border">
                  <Link href="/blog">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer font-mono">
                      <ArrowRight size={12} /> {t("blog.backToBlog")}
                    </div>
                  </Link>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-card border border-primary/20 rounded-xl p-5">
                <p className="text-xs font-mono text-primary mb-2">// project.start()</p>
                <h3 className="text-sm font-bold mb-2">{t("home.ctaTitle")}</h3>
                <p className="text-xs text-muted-foreground mb-4">{t("home.ctaSubtitle")}</p>
                <Link href="/contact">
                  <span className="block w-full bg-primary text-primary-foreground text-center py-2 rounded-lg font-mono text-xs hover:bg-primary/90 glow-cyan transition-all cursor-pointer">
                    {t("home.ctaButton")} ←
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
