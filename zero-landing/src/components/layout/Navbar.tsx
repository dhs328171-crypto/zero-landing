import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, MessageCircle, User, LogOut, ChevronDown, Shield, Calculator, Wrench, FileText, HelpCircle, BookOpen, Users, MapPin, Zap, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchModal } from "@/components/ui/search-modal";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { CurrencySwitcher } from "@/components/ui/currency-switcher";
import { useAuth } from "@/contexts/auth-context";
import { useT } from "@/contexts/i18n-context";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const t = useT();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handler = () => { setUserMenuOpen(false); setMoreMenuOpen(false); };
    if (userMenuOpen || moreMenuOpen) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [userMenuOpen, moreMenuOpen]);

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.portfolio"), path: "/portfolio" },
    { name: t("nav.services"), path: "/services" },
    { name: t("nav.pricing"), path: "/pricing" },
    { name: t("nav.blog"), path: "/blog" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  const moreLinks = [
    { name: t("nav.clients"), path: "/clients", icon: <Users size={13} /> },
    { name: t("nav.testimonials"), path: "/testimonials", icon: <Zap size={13} /> },
    { name: t("nav.partners"), path: "/partners", icon: <Package size={13} /> },
    { name: t("nav.cv"), path: "/cv", icon: <FileText size={13} /> },
    { name: t("nav.tools"), path: "/tools", icon: <Wrench size={13} /> },
    { name: t("nav.calculator"), path: "/calculator", icon: <Calculator size={13} /> },
    { name: t("nav.resources"), path: "/resources", icon: <BookOpen size={13} /> },
    { name: t("nav.faq"), path: "/faq", icon: <HelpCircle size={13} /> },
    { name: t("nav.support"), path: "/support", icon: <MessageCircle size={13} /> },
    { name: t("nav.community"), path: "/community", icon: <Users size={13} /> },
    { name: t("nav.roadmap"), path: "/roadmap", icon: <MapPin size={13} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setUserMenuOpen(false);
  };

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-card/80 backdrop-blur-md border-b border-border shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <img
                src="/zero-logo.png"
                alt="ZERO Logo"
                className="h-10 w-auto group-hover:drop-shadow-[0_0_12px_rgba(0,217,255,0.7)] transition-all duration-300 rounded-sm"
              />
              <span className="font-mono text-xl font-bold tracking-wider text-foreground group-hover:text-primary transition-colors">
                ZERO
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            <ul className="flex items-center gap-4">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link href={link.path}>
                    <div
                      className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer relative ${
                        location === link.path ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {link.name}
                      {location === link.path && (
                        <motion.div layoutId="nav-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                      )}
                    </div>
                  </Link>
                </li>
              ))}
              {/* More Dropdown */}
              <li>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary cursor-pointer ${moreMenuOpen ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {t("nav.more")}
                    <ChevronDown size={13} className={`transition-transform duration-200 ${moreMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {moreMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-10 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-1.5 grid grid-cols-1">
                          {moreLinks.map((link) => (
                            <Link key={link.path} href={link.path}>
                              <div
                                onClick={() => setMoreMenuOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                                  location === link.path
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                }`}
                              >
                                <span className={location === link.path ? "text-primary" : "text-muted-foreground/60"}>{link.icon}</span>
                                {link.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </li>
            </ul>

            <div className="flex items-center gap-2">
              {/* Language + Currency switchers */}
              <LanguageSwitcher />
              <CurrencySwitcher />

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary border border-border hover:border-primary/40 px-3 py-1.5 rounded-lg text-xs font-mono transition-all bg-card/30"
              >
                <Search size={13} />
                <span>{t("nav.search")}</span>
                <kbd className="text-[9px] bg-background border border-border px-1 py-0.5 rounded font-mono opacity-60">⌘K</kbd>
              </button>

              {/* Auth State */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {isAdmin && (
                    <Link href="/admin">
                      <Button
                        size="sm"
                        className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 font-mono text-xs"
                      >
                        <Shield size={12} className="ml-1" />
                        {t("nav.admin")}
                      </Button>
                    </Link>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 bg-card border border-border hover:border-primary/40 rounded-lg px-3 py-1.5 transition-all"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-foreground max-w-[80px] truncate">{user.name}</span>
                      {isAdmin && <Shield size={11} className="text-primary" />}
                      <ChevronDown size={12} className={`text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-12 w-52 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-border bg-background/50">
                          <p className="text-sm font-semibold text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate">{user.email}</p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          <Link href="/profile">
                            <div onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all cursor-pointer">
                              <User size={14} />
                              {t("nav.profile")}
                            </div>
                          </Link>
                          {isAdmin && (
                            <Link href="/admin">
                              <div onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-primary hover:bg-primary/10 transition-all cursor-pointer">
                                <Shield size={14} />
                                {t("nav.adminPanel")}
                              </div>
                            </Link>
                          )}
                          <div className="border-t border-border/50 pt-1 mt-1">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-all"
                            >
                              <LogOut size={14} />
                              {t("nav.logout")}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-muted-foreground hover:border-primary/50 hover:text-primary font-mono text-xs"
                    asChild
                  >
                    <Link href="/login">{t("nav.login")}</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-mono text-xs"
                    asChild
                  >
                    <Link href="/register">
                      <MessageCircle size={12} className="ml-1" />
                      {t("nav.register")}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher compact />
            <button onClick={() => setSearchOpen(true)} className="text-muted-foreground hover:text-primary p-2">
              <Search size={20} />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-foreground hover:text-primary transition-colors p-1">
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-card border-b border-border overflow-hidden"
            >
              <div className="container mx-auto px-4 py-5 flex flex-col gap-4">
                {isAuthenticated && user && (
                  <div className="flex items-center gap-3 bg-background/50 rounded-xl p-3 border border-border">
                    <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{user.role === "admin" ? "🛡️ Admin" : "Member"}</p>
                    </div>
                  </div>
                )}

                {/* Mobile currency switcher */}
                <div className="flex items-center justify-between gap-2 bg-background/30 rounded-xl p-2.5 border border-border">
                  <CurrencySwitcher />
                </div>

                <ul className="flex flex-col gap-1">
                  {[...navLinks, ...moreLinks].map((link) => (
                    <li key={link.path}>
                      <Link href={link.path}>
                        <div
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                            location === link.path
                              ? "text-primary bg-primary/10 border border-primary/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.name}
                          {location === link.path && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-2 pt-3 border-t border-border">
                  {isAuthenticated ? (
                    <>
                      {isAdmin && (
                        <Link href="/admin">
                          <Button className="w-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20" onClick={() => setMobileMenuOpen(false)}>
                            <Shield size={14} className="ml-2" />
                            {t("nav.adminPanel")}
                          </Button>
                        </Link>
                      )}
                      <Link href="/profile">
                        <Button variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                          <User size={14} className="ml-2" />
                          {t("nav.profile")}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full border-red-400/30 text-red-400 hover:bg-red-400/10"
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      >
                        <LogOut size={14} className="ml-2" />
                        {t("nav.logout")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full font-mono" asChild>
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>{t("nav.login")}</Link>
                      </Button>
                      <Button className="w-full bg-primary text-primary-foreground glow-cyan font-mono" asChild>
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)}>{t("nav.register")}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
