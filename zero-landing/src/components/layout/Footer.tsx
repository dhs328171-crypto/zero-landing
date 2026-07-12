import { Link } from "wouter";
import { MessageCircle, Mail, ArrowUp, Zap } from "lucide-react";
import { useT } from "@/contexts/i18n-context";

export function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const t = useT();

  return (
    <footer className="bg-card border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 md:row-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img src="/zero-logo.png" alt="ZERO" className="h-10 w-auto drop-shadow-[0_0_8px_rgba(0,217,255,0.4)]" />
              <span className="font-mono text-xl font-bold text-primary">ZERO</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              {t("footer.brandDesc")}
            </p>
            <div className="flex items-center gap-3">
              <a href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 hover:bg-green-500/20 transition-all">
                <MessageCircle size={16} />
              </a>
              <a href="https://whatsapp.com/channel/0029Vaxa4398V0tmGkGYkp2y" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/20 transition-all">
                <Zap size={16} />
              </a>
              <a href="mailto:zero@dev.com"
                className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Quick links - split into 2 columns */}
          <div className="md:col-span-2 grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-mono text-xs text-primary tracking-widest uppercase mb-5">{t("footer.pagesTitle")}</h3>
              <ul className="space-y-3">
                {[
                  { name: t("nav.home"), path: "/" },
                  { name: t("nav.portfolio"), path: "/portfolio" },
                  { name: t("nav.services"), path: "/services" },
                  { name: t("nav.blog"), path: "/blog" },
                  { name: t("nav.pricing"), path: "/pricing" },
                  { name: t("nav.about"), path: "/about" },
                  { name: t("nav.contact"), path: "/contact" },
                  { name: t("nav.testimonials"), path: "/testimonials" },
                  { name: t("nav.clients"), path: "/clients" },
                  { name: t("nav.partners"), path: "/partners" },
                ].map((l) => (
                  <li key={l.path}>
                    <Link href={l.path}>
                      <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">{l.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-xs text-primary tracking-widest uppercase mb-5">{t("nav.more")}</h3>
              <ul className="space-y-3">
                {[
                  { name: t("nav.cv"), path: "/cv" },
                  { name: t("nav.tools"), path: "/tools" },
                  { name: t("nav.calculator"), path: "/calculator" },
                  { name: t("nav.community"), path: "/community" },
                  { name: t("nav.resources"), path: "/resources" },
                  { name: t("nav.roadmap"), path: "/roadmap" },
                  { name: t("nav.changelog"), path: "/changelog" },
                  { name: t("nav.faq"), path: "/faq" },
                  { name: t("lg.terms"), path: "/terms" },
                  { name: t("lg.privacy"), path: "/privacy" },
                ].map((l) => (
                  <li key={l.path}>
                    <Link href={l.path}>
                      <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">{l.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-mono text-xs text-primary tracking-widest uppercase mb-5">{t("footer.contactTitle")}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground/60 font-mono mb-1">WhatsApp</p>
                <a href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  ZERO Group
                </a>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/60 font-mono mb-1">Channel</p>
                <a href="https://whatsapp.com/channel/0029Vaxa4398V0tmGkGYkp2y" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  ZERO Channel
                </a>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/60 font-mono mb-1">Email</p>
                <a href="mailto:zero@dev.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  zero@dev.com
                </a>
              </div>
              <div className="flex items-center gap-1.5 mt-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-mono">{t("home.heroBadge")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            © {new Date().getFullYear()} ZERO — Software Architect Solutions. {t("footer.rights")}.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <span className="text-xs text-muted-foreground/30 hover:text-muted-foreground transition-colors font-mono cursor-pointer">Admin</span>
            </Link>
            <button
              onClick={scrollTop}
              className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
