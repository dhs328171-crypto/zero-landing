import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, ArrowRight, Mail, Lock, Terminal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useT, useI18n } from "@/contexts/i18n-context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const t = useT();
  const { dir } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      setLoading(false);
      if (result.success) {
        const adminEmails = ["zeru50549@gmail.com", "zero_admin"];
        if (adminEmails.includes(email.trim())) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError(result.error || t("auth.loginError"));
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || t("auth.loginError"));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden" dir={dir}>
      {/* Background */}
      <div className="absolute inset-0 cyber-grid opacity-10" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />

      {/* Top-right: language switcher */}
      <div className="absolute top-6 left-6 z-20">
        <LanguageSwitcher compact />
      </div>

      {/* Back to home */}
      <Link href="/">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 right-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
        >
          <span className="text-sm font-mono">{t("nav.home")}</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </motion.div>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.img
            src="/zero-logo.png"
            alt="ZERO"
            className="h-16 w-auto mx-auto mb-4 drop-shadow-[0_0_20px_rgba(0,217,255,0.5)]"
            animate={{ filter: ["drop-shadow(0 0 15px rgba(0,217,255,0.4))", "drop-shadow(0 0 30px rgba(0,217,255,0.7))", "drop-shadow(0 0 15px rgba(0,217,255,0.4))"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p className="font-mono text-xs text-muted-foreground">// ZERO.AUTH.LOGIN</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">{t("auth.loginTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("auth.loginSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail size={13} className="text-primary" />
                {t("common.email")}
              </label>
              <Input
                type="text"
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border focus:border-primary font-mono"
                required
                dir="ltr"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock size={13} className="text-primary" />
                {t("common.password")}
              </label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-border focus:border-primary pr-4 pl-10 font-mono"
                  required
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
              >
                <Terminal size={13} />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-mono"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full inline-block"
                  />
                  {t("auth.verifying")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={15} />
                  {t("nav.login")}
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-mono">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link href="/register">
              <span className="text-primary hover:underline cursor-pointer font-medium">
                {t("auth.createAccount")}
              </span>
            </Link>
          </p>

          {/* Features hint */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[t("auth.feat1"), t("auth.feat2"), t("auth.feat3")].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1 bg-background/50 rounded-lg p-2">
                <Zap size={12} className="text-primary" />
                <span className="text-[10px] text-muted-foreground text-center font-mono">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-muted-foreground mt-4 font-mono opacity-50">
          // {t("auth.securedNote")}
        </p>
      </motion.div>
    </div>
  );
}
