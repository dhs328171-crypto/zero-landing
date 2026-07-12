import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useT } from "@/contexts/i18n-context";
import { useProjects } from "@/lib/queries";

export function FeaturedProjectsSection() {
  const t = useT();
  const projectsQ = useProjects({ limit: 3 });
  const projects = projectsQ.data?.items ?? [];

  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-14">
          <div>
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-3 block">// portfolio.featured()</span>
            <h2 className="text-4xl font-bold">{t("home.latestWork")}</h2>
          </div>
          <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground hidden md:flex" asChild>
            <Link href="/portfolio">{t("home.latestWorkCta")} ←</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.id ?? i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/40 transition-all"
            >
              <div className="overflow-hidden h-48">
                {p.image ? (
                  <img src={p.image} alt={p.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-background flex items-center justify-center text-muted-foreground/30 text-4xl">{"</>"}</div>
                )}
              </div>
              <div className="p-5">
                <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{p.category}</span>
                <h3 className="text-lg font-bold mt-3 mb-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                <span className="font-mono text-xs text-muted-foreground/60">{p.tech}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}