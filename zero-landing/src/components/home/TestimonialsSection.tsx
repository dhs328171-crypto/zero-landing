import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "@/contexts/i18n-context";
import { useTestimonials } from "@/lib/queries";

export function TestimonialsSection() {
  const t = useT();
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const testimonialsQ = useTestimonials({ limit: 10 });
  const testimonials = testimonialsQ.data?.items ?? [];

  const nextTestimonial = () =>
    setTestimonialIdx((i) => (i + 1) % Math.max(testimonials.length, 1));
  const prevTestimonial = () =>
    setTestimonialIdx((i) => (i - 1 + Math.max(testimonials.length, 1)) % Math.max(testimonials.length, 1));

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="font-mono text-primary text-xs tracking-widest uppercase mb-3 block">// clients.testimonials()</span>
          <h2 className="text-4xl font-bold mb-4">{t("home.testimonialsTitle")}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("home.testimonialsSubtitle")}</p>
        </div>
        <div className="max-w-3xl mx-auto">
          {testimonials.length > 0 ? (
            <div className="relative">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="bg-card border border-border rounded-2xl p-8 md:p-10"
              >
                <Quote size={36} className="text-primary/20 mb-6" />
                <p className="text-lg text-foreground leading-relaxed mb-8">
                  {testimonials[testimonialIdx]?.text}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-lg">
                      {testimonials[testimonialIdx]?.avatar || testimonials[testimonialIdx]?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonials[testimonialIdx]?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonials[testimonialIdx]?.role}
                        {testimonials[testimonialIdx]?.company ? ` — ${testimonials[testimonialIdx]?.company}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: testimonials[testimonialIdx]?.rating ?? 5 }).map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </motion.div>

              <div className="flex items-center justify-center gap-4 mt-6">
                <button onClick={prevTestimonial} className="w-9 h-9 rounded-full border border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-all">
                  <ChevronRight size={16} />
                </button>
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialIdx(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === testimonialIdx ? "bg-primary w-6" : "bg-border w-1.5"}`}
                    />
                  ))}
                </div>
                <button onClick={nextTestimonial} className="w-9 h-9 rounded-full border border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-all">
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">{t("common.loading")}</div>
          )}
        </div>
      </div>
    </section>
  );
}