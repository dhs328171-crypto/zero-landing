import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { apiGet } from "@/lib/api";
import { Loader2, ExternalLink, Lock, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface RedirectInfo {
  targetUrl: string;
  title: string | null;
  slug: string;
}

interface RedirectError {
  error: string;
  requiresPassword?: boolean;
}

/**
 * Public redirect page — visited at /r/:slug
 *
 * Behavior:
 *   • If the slug doesn't exist or is inactive → 404 message
 *   • If link is password-protected and no pw given → password form
 *   • Otherwise → show a brief "redirecting…" interstitial, then auto-redirect
 *     to the real target. The interstitial exists so the user sees our brand
 *     (and so the click is tracked server-side) before leaving.
 */
export default function LinkRedirect() {
  const [match, params] = useRoute("/r/:slug");
  const [_location] = useLocation();
  const slug = match ? (params as any).slug : "";
  const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialPw = urlParams.get("pw") || "";

  const [info, setInfo] = useState<RedirectInfo | null>(null);
  const [error, setError] = useState<RedirectError | null>(null);
  const [loading, setLoading] = useState(true);
  const [pw, setPw] = useState(initialPw);
  const [pwSubmitted, setPwSubmitted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    const url = `/link-mask/r/${slug}${pw ? `?pw=${encodeURIComponent(pw)}` : ""}`;
    apiGet<RedirectInfo>(url)
      .then((data) => {
        setInfo(data);
        setLoading(false);
        // Auto-redirect after a brief interstitial (1.5s)
        setTimeout(() => {
          if (data.targetUrl) {
            window.location.href = data.targetUrl;
          }
        }, 1500);
      })
      .catch((e) => {
        try {
          // Try to parse the structured error
          const msg = e.message || "";
          if (msg.includes("محمي بكلمة مرور") || msg.includes("password protected") || msg.includes("password_protected")) {
            setError({ error: msg, requiresPassword: true });
          } else {
            setError({ error: msg });
          }
        } catch {
          setError({ error: "تعذّر تحميل الرابط" });
        }
        setLoading(false);
      });
  }, [slug, pwSubmitted]);

  if (!match) return null;

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm font-mono text-muted-foreground">جارٍ التحويل…</p>
        </div>
      </div>
    );
  }

  // ---- Password required ----
  if (error?.requiresPassword) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-yellow-400" />
            <h1 className="font-bold text-lg">رابط محمي</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            هذا الرابط يتطلب كلمة مرور للمتابعة.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); setPwSubmitted(true); }}
            className="space-y-3"
          >
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="كلمة المرور"
              autoFocus
              dir="ltr"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-mono hover:bg-primary/90"
            >
              متابعة
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---- Error state ----
  if (error && !info) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle size={40} className="text-yellow-400 mx-auto mb-3" />
          <h1 className="font-bold text-xl mb-2">تعذّر فتح الرابط</h1>
          <p className="text-sm text-muted-foreground mb-4">{error.error}</p>
          <Link href="/">
            <span className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:underline cursor-pointer">
              <ArrowLeft size={14} /> العودة للرئيسية
            </span>
          </Link>
        </div>
      </div>
    );
  }

  // ---- Success — show interstitial ----
  if (info) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <img src="/zero-logo.png" alt="ZERO" className="h-12 w-12 mx-auto mb-4 drop-shadow-[0_0_8px_rgba(0,217,255,0.5)] rounded" />
          <h1 className="font-bold text-lg mb-2">
            {info.title || "جارٍ التحويل…"}
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            سيتم تحويلك تلقائياً خلال لحظات…
          </p>
          <div className="bg-card border border-border rounded-lg p-3 mb-4">
            <p className="text-xs text-muted-foreground mb-1">الوجهة:</p>
            <p className="text-xs font-mono text-primary truncate" dir="ltr">{info.targetUrl}</p>
          </div>
          <a
            href={info.targetUrl}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-mono hover:bg-primary/90"
          >
            <ExternalLink size={14} /> متابعة فوراً
          </a>
          <div className="mt-6">
            <Link href="/">
              <span className="text-xs text-muted-foreground hover:text-primary font-mono cursor-pointer">
                العودة للرئيسية
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
