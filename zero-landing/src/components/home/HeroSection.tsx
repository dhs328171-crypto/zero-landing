import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TypingEffect } from "@/components/ui/typing-effect";
import { AnimatedTerminal } from "@/components/ui/animated-terminal";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/contexts/i18n-context";

export function HeroSection() {
  const t = useT();

  return (
    <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-24 overflow-hidden min-h-screen flex items-center">
      <div
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: "url('https://d2xsxph8kpxj0f.cloudfront.net/310519663613290691/ZS6d79YnR9czMoXmq4DMfq/hero_background-KVfoYCFz32oXwkSWfdws22.webp')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-primary font-mono text-sm tracking-wider">{t("home.heroBadge")}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 leading-tight"
            >
              {t("home.heroTitle1")}{" "}
              <span className="text-primary glow-cyan-text">{t("home.heroTitleHighlight")}</span>
              <br />
              <TypingEffect
                words={
                  t("home.heroTitle1") === "أحوّل أفكارك إلى"
                    ? ["احترافي", "مبدع", "موثوق", "مميز", "متكامل"]
                    : ["professional", "creative", "trusted", "premium", "complete"]
                }
                className="text-primary glow-cyan-text"
              />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed"
            >
              {t("home.heroSubtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan text-base px-8 h-12" asChild>
                <Link href="/portfolio">{t("home.heroCtaSecondary")} <ArrowLeft size={16} className="mr-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-border hover:border-primary/50 text-base px-8 h-12" asChild>
                <Link href="/pricing">{t("nav.pricing")}</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4 text-sm text-muted-foreground"
            >
              {["✓ " + t("home.why2Title"), "✓ " + t("home.why3Title"), "✓ " + t("home.statsSatisfaction"), "✓ " + t("home.why4Title")].map((x) => (
                <span key={x} className="text-xs font-mono text-primary/70">{x}</span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatedTerminal />
          </motion.div>
        </div>
      </div>
    </section>
  );
}