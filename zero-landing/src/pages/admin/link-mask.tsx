import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import {
  Link2, Plus, Search, Edit2, Trash2, X, Save, ExternalLink,
  Copy, Eye, EyeOff, Lock, Unlock, RefreshCw, Loader2, BarChart3,
  Calendar, AlertTriangle
} from "lucide-react";

interface LinkMask {
  id: string;
  slug: string;
  targetUrl: string;
  title: string | null;
  description: string | null;
  clicks: number;
  active: boolean;
  expiresAt: string | null;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MaskResp {
  items: LinkMask[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ORIGIN = typeof window !== "undefined" ? window.location.origin : "https://example.com";

export default function AdminLinkMask() {
  const [masks, setMasks] = useState<LinkMask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [editing, setEditing] = useState<LinkMask | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Form state
  const [form, setForm] = useState({
    slug: "",
    targetUrl: "",
    title: "",
    description: "",
    password: "",
    expiresAt: "",
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = search ? `&q=${encodeURIComponent(search)}` : "";
      const data = await apiGet<MaskResp>(`/link-mask?page=${page}&limit=20${q}`);
      setMasks(data.items);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setForm({ slug: "", targetUrl: "", title: "", description: "", password: "", expiresAt: "", active: true });
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (m: LinkMask) => {
    setForm({
      slug: m.slug,
      targetUrl: m.targetUrl,
      title: m.title || "",
      description: m.description || "",
      password: "",
      expiresAt: m.expiresAt ? m.expiresAt.slice(0, 10) : "",
      active: m.active,
    });
    setEditing(m);
    setCreating(false);
  };

  const save = async () => {
    if (!form.targetUrl) { showToast("الرابط الهدف مطلوب", "error"); return; }
    if (!form.slug && !form.title) { showToast("الـ slug أو العنوان مطلوب", "error"); return; }
    setSaving(true);
    try {
      const body: any = {
        slug: form.slug || undefined,
        targetUrl: form.targetUrl,
        title: form.title || undefined,
        description: form.description || undefined,
        expiresAt: form.expiresAt || undefined,
        active: form.active,
      };
      if (form.password) body.password = form.password;
      if (editing) {
        await apiPut(`/link-mask/${editing.id}`, body);
        showToast("تم تحديث الرابط");
      } else {
        await apiPost(`/link-mask`, body);
        showToast("تم إنشاء الرابط");
      }
      setEditing(null);
      setCreating(false);
      load();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m: LinkMask) => {
    if (!confirm(`حذف الرابط ${m.slug}؟`)) return;
    try {
      await apiDelete(`/link-mask/${m.id}`);
      showToast("تم الحذف");
      load();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const resetClicks = async (m: LinkMask) => {
    try {
      await apiPost(`/link-mask/${m.id}/clicks/reset`);
      showToast("تم تصفير العداد");
      load();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const toggleActive = async (m: LinkMask) => {
    try {
      await apiPut(`/link-mask/${m.id}`, { active: !m.active });
      load();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const copyLink = (slug: string) => {
    const url = `${ORIGIN}/r/${slug}`;
    navigator.clipboard.writeText(url);
    showToast("تم نسخ الرابط");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Link2 size={22} className="text-primary" />
              تمويه الروابط
            </h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              // {total} رابط — أخفِ الروابط الأصلية خلف روابط قصيرة بسيطة
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-card border border-border rounded-lg hover:border-primary/40"
            >
              <RefreshCw size={12} /> تحديث
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus size={12} /> رابط جديد
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
          <BarChart3 size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-muted-foreground">
            <p className="text-primary font-semibold mb-1">كيف يعمل التمويه؟</p>
            بدل ما تشارك رابط طويل مثل <code className="text-primary font-mono" dir="ltr">https://wa.me/966500000000?text=...</code>،
            تشارك رابطاً قصيراً من موقعك مثل <code className="text-primary font-mono" dir="ltr">/r/wa</code>.
            الزائر يضغط عليه فيتم توجيهه تلقائياً للرابط الأصلي. يمكنك حماية الرابط بكلمة مرور، وتحديد تاريخ انتهاء، ومتابعة عدد النقرات.
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="ابحث في الروابط..."
            className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1.5fr_2.5fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border text-xs font-mono text-muted-foreground">
            <span>الرابط المختصر</span>
            <span>الرابط الأصلي</span>
            <span>النقرات</span>
            <span>الحالة</span>
            <span className="text-left">إجراءات</span>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : masks.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">لا توجد روابط بعد. اضغط "رابط جديد" لإنشاء أول رابط.</div>
          ) : (
            <AnimatePresence>
              {masks.map((m, i) => {
                const maskedUrl = `${ORIGIN}/r/${m.slug}`;
                const expired = m.expiresAt && new Date(m.expiresAt).getTime() < Date.now();
                return (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-[1.5fr_2.5fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 border-b border-border/50 hover:bg-background/30"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-primary font-bold truncate" dir="ltr">/r/{m.slug}</p>
                        <button onClick={() => copyLink(m.slug)} className="p-0.5 text-muted-foreground hover:text-primary">
                          <Copy size={11} />
                        </button>
                      </div>
                      {m.title && <p className="text-xs text-foreground truncate">{m.title}</p>}
                      {m.hasPassword && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-yellow-400 font-mono mt-0.5">
                          <Lock size={9} /> محمي
                        </span>
                      )}
                      {m.expiresAt && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono ${expired ? "text-red-400" : "text-muted-foreground"}`}>
                          <Calendar size={9} /> {expired ? "منتهي" : new Date(m.expiresAt).toLocaleDateString("ar-EG")}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <a
                        href={m.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-muted-foreground hover:text-primary truncate block"
                        dir="ltr"
                      >
                        {m.targetUrl}
                      </a>
                      {m.description && <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{m.description}</p>}
                    </div>
                    <button
                      onClick={() => resetClicks(m)}
                      title="تصفير العداد"
                      className="text-left"
                    >
                      <p className="text-sm font-mono text-primary font-bold">{m.clicks}</p>
                      <p className="text-[10px] text-muted-foreground">نقرة</p>
                    </button>
                    <div>
                      <button
                        onClick={() => toggleActive(m)}
                        className={`text-xs font-mono px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                          m.active
                            ? "bg-green-400/10 text-green-400 border-green-400/30"
                            : "bg-muted/10 text-muted-foreground border-border"
                        }`}
                      >
                        {m.active ? <Unlock size={9} /> : <Lock size={9} />}
                        {m.active ? "نشط" : "معطّل"}
                      </button>
                      {expired && (
                        <span className="block text-[10px] text-red-400 font-mono mt-0.5">منتهي الصلاحية</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 text-muted-foreground hover:text-primary" title="تعديل">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => remove(m)} className="p-1.5 text-muted-foreground hover:text-red-400" title="حذف">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-mono">صفحة {page} من {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs font-mono bg-card border border-border rounded-lg disabled:opacity-30 hover:border-primary/40">السابق</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-mono bg-card border border-border rounded-lg disabled:opacity-30 hover:border-primary/40">التالي</button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(creating || editing) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setCreating(false); setEditing(null); }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Link2 size={18} className="text-primary" />
                  {editing ? "تعديل الرابط" : "رابط تمويه جديد"}
                </h2>
                <button onClick={() => { setCreating(false); setEditing(null); }}><X size={18} className="text-muted-foreground" /></button>
              </div>

              <div className="space-y-4">
                {/* Preview */}
                {form.slug && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs">
                    <p className="text-muted-foreground mb-1">معاينة الرابط المختصر:</p>
                    <p className="text-primary font-mono font-bold" dir="ltr">{ORIGIN}/r/{form.slug}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">العنوان (اختياري)</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="مثال: واتساب"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الـ slug (اسم الرابط المختصر)</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="مثال: wa, github, pricing"
                    dir="ltr"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">سيتم تحويله لأحرف صغيرة ورموز -. إن تركته فارغاً، سيُشتق من العنوان.</p>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الرابط الهدف (الأصلي)</label>
                  <input
                    value={form.targetUrl}
                    onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                    placeholder="https://..."
                    dir="ltr"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">الوصف (اختياري)</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="ملاحظة داخلية للرابط"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">كلمة مرور (اختياري)</label>
                    <input
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="اتركه فارغاً لإزالة الحماية"
                      dir="ltr"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">انتهاء الصلاحية (اختياري)</label>
                    <input
                      type="date"
                      value={form.expiresAt}
                      onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">الرابط نشط (يوجه الزوار للهدف)</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-mono hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {editing ? "حفظ التعديلات" : "إنشاء الرابط"}
                  </button>
                  <button
                    onClick={() => { setCreating(false); setEditing(null); }}
                    className="px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-mono"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg text-sm font-mono border ${
              toast.type === "success" ? "bg-green-400/10 text-green-400 border-green-400/30"
                : "bg-red-400/10 text-red-400 border-red-400/30"
            }`}
          >{toast.msg}</motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
