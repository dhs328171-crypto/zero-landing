import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useT } from "@/contexts/i18n-context";
import { useBlog } from "@/lib/queries";

export function BlogSection() {
  const t = useT();
  const blogQ = useBlog({ limit: 3 });
  const posts = blogQ.data?.items ?? [];

  if (posts.length === 0) return null;

  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-14">
          <div>
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-3 block">// blog.latest()</span>
            <h2 className="text-4xl font-bold">{t("home.blogTitle")}</h2>
          </div>
          <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground hidden md:flex" asChild>
            <Link href="/blog">{t("home.blogCta")} ←</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/blog/${p.slug}`}>
                <div className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all h-full">
                  {p.image && (
                    <div className="overflow-hidden h-40">
                      <img src={p.image} alt={p.title} loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{p.tag}</span>
                    <h3 className="text-lg font-bold mt-3 mb-2 line-clamp-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}