import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, HelpCircle, MessageCircle, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT, useI18n } from "@/contexts/i18n-context";
import { useFAQs } from "@/lib/queries";

export default function FAQ() {
  const t = useT();
  const { dir } = useI18n();
  const [open, setOpen] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");

  const faqsQ = useFAQs({ q: search });
  const faqs = faqsQ.data ?? [];

  // Build category list from data
  const categories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => set.add(f.category));
    return Array.from(set);
  }, [faqs]);

  const filtered = useMemo(
    () => (cat ? faqs.filter((f) => f.category === cat) : faqs),
    [faqs, cat]
  );

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-10" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-4 block">// faq.answers()</span>
            <h1 className="text-5xl font-bold mb-4">
              {t("faq.title").split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-primary glow-cyan-text">
                {t("faq.title").split(" ").slice(-1)}
              </span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">{t("faq.subtitle")}</p>

            <div className="relative max-w-md mx-auto">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("faq.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-card border-border pr-10 focus:border-primary"
              />
            </div>
          </motion.div>
        </section>

        {/* Categories */}
        <section className="py-4 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setCat("")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  cat === "" ? "bg-primary text-primary-foreground glow-cyan" : "bg-card border border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {t("faq.allCategories")}
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(cat === c ? "" : c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    cat === c ? "bg-primary text-primary-foreground glow-cyan" : "bg-card border border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-sm text-muted-foreground font-mono mb-4">
              {filtered.length} {t("faq.title").split(" ")[0]}
            </div>
            {faqsQ.isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 size={18} className="animate-spin mr-2" /> {t("common.loading")}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card border border-dashed border-border rounded-xl">
                {t("faq.noResults")}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((faq) => {
                  const isOpen = open === faq.id;
                  return (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
                    >
                      <button
                        onClick={() => setOpen(isOpen ? null : faq.id)}
                        className="w-full flex items-center justify-between px-5 py-4 text-right"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <HelpCircle size={15} className="text-primary flex-shrink-0" />
                          <span className="font-medium text-foreground truncate">{faq.question}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-mono text-muted-foreground bg-background border border-border px-2 py-0.5 rounded-full">
                            {faq.category}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pt-1 border-t border-border/50 text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mt-12 text-center bg-card border border-border rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 cyber-grid opacity-5" />
              <div className="relative z-10">
                <MessageCircle size={32} className="text-primary mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-2">{t("faq.stillHelp")}</h3>
                <p className="text-muted-foreground text-sm mb-5">{t("faq.stillHelpDesc")}</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan" asChild>
                    <a href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9" target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" className="border-primary/50 text-primary" asChild>
                    <a href="/contact">{t("faq.contactButton")}</a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
