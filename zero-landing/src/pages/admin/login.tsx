import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User, Terminal, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(username, password);
      setLoading(false);
      if (result.success) {
        navigate("/admin");
      } else {
        setError("بيانات الدخول غير صحيحة. حاول مرة أخرى.");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "بيانات الدخول غير صحيحة");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden" dir="rtl">
      {/* Animated background grid */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md px-6"
      >
        {/* Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl shadow-primary/10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.img
              src="/zero-logo.png"
              alt="ZERO Logo"
              className="h-16 w-auto mb-4 drop-shadow-[0_0_15px_rgba(0,217,255,0.4)]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
              <p className="text-muted-foreground text-sm mt-1 font-mono">// admin.access()</p>
            </div>
          </div>

          {/* Terminal badge */}
          <div className="flex items-center gap-2 bg-background/50 border border-border/50 rounded-lg px-3 py-2 mb-6">
            <Terminal size={14} className="text-primary" />
            <span className="font-mono text-xs text-muted-foreground">ZERO :: Admin Panel v2.0</span>
            <span className="mr-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">البريد الإلكتروني / اسم المستخدم</label>
              <div className="relative">
                <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="zeru50549@gmail.com"
                  className="w-full bg-background border border-border rounded-lg pr-10 pl-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-mono"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">كلمة المرور</label>
              <div className="relative">
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="w-full bg-background border border-border rounded-lg pr-10 pl-10 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-mono"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-sm"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-all glow-cyan disabled:opacity-60 disabled:cursor-not-allowed font-mono text-sm relative overflow-hidden"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  جارٍ التحقق...
                </span>
              ) : (
                "دخول إلى لوحة التحكم"
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <a href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono">
              ← العودة إلى الموقع
            </a>
          </div>
        </div>

        {/* Bottom hint */}
        <p className="text-center text-xs text-muted-foreground/40 mt-4 font-mono">
          ZERO Admin Dashboard © 2026
        </p>
      </motion.div>
    </div>
  );
}
