import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Search, Edit2, Trash2, Star, X, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete, qs, type Paginated } from "@/lib/api";
import { Pager } from "@/components/ui/pager";
import { toast } from "sonner";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string | null;
  rating: number;
  text: string;
  avatar: string | null;
  approved: boolean;
  featured: boolean;
  createdAt: string;
}

function fmtDate(s: string) {
  try { return new Date(s).toISOString().slice(0, 10); } catch { return s; }
}

const emptyForm = {
  name: "", role: "", company: "", text: "", rating: 5, approved: true, featured: false, avatar: "",
};

const colors = [
  "bg-primary/20 text-primary border-primary/30",
  "bg-purple-400/20 text-purple-400 border-purple-400/30",
  "bg-green-400/20 text-green-400 border-green-400/30",
  "bg-orange-400/20 text-orange-400 border-orange-400/30",
  "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
];

export default function TestimonialsAdmin() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = qs({ page, limit: 12, q: search, all: true });
      const res = await apiGet<Paginated<Testimonial>>(`/testimonials${query}`);
      setItems(res.items);
      setTotal(res.total);
      setPages(res.pages);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };
  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      name: t.name, role: t.role, company: t.company || "", text: t.text,
      rating: t.rating, approved: t.approved, featured: t.featured, avatar: t.avatar || "",
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name || !form.text) {
      toast.error("الاسم والنص مطلوبان");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, avatar: form.avatar || form.name.charAt(0) };
      if (editing) {
        await apiPut(`/testimonials/${editing.id}`, payload);
        toast.success("تم تحديث التقييم");
      } else {
        await apiPost(`/testimonials`, payload);
        toast.success("تم إضافة التقييم");
      }
      setShowModal(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleApproved = async (t: Testimonial) => {
    try {
      await apiPut(`/testimonials/${t.id}`, { approved: !t.approved });
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  const toggleFeatured = async (t: Testimonial) => {
    try {
      await apiPut(`/testimonials/${t.id}`, { featured: !t.featured });
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  const remove = async (id: string) => {
    try {
      await apiDelete(`/testimonials/${id}`);
      toast.success("تم حذف التقييم");
      setDeleteId(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">إدارة التقييمات</h1>
            <p className="text-sm text-muted-foreground font-mono">// testimonials.manage()</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-mono hover:bg-primary/90 glow-cyan transition-all"
          >
            <Plus size={16} /> إضافة تقييم
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "إجمالي التقييمات", val: total, color: "text-primary" },
            { label: "مرئية", val: items.filter((t) => t.approved).length, color: "text-green-400" },
            { label: "مميزة", val: items.filter((t) => t.featured).length, color: "text-yellow-400" },
            {
              label: "متوسط التقييم",
              val: items.length
                ? (items.reduce((s, t) => s + t.rating, 0) / items.length).toFixed(1) + "★"
                : "—",
              color: "text-orange-400",
            },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.val}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في الاسم/النص/الشركة..."
            className="w-full bg-card border border-border rounded-xl pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 size={20} className="animate-spin mr-2" /> جاري التحميل...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-card border border-dashed border-border rounded-xl">
            لا توجد تقييمات
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {items.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-card border rounded-xl p-5 transition-all ${
                    t.approved ? "border-border" : "border-border/40 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-full border flex items-center justify-center text-base font-bold flex-shrink-0 ${colors[i % colors.length]}`}>
                      {t.avatar || t.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm">{t.name}</span>
                        {t.featured && (
                          <span className="text-[10px] font-mono bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded-full">
                            مميز
                          </span>
                        )}
                        {!t.approved && (
                          <span className="text-[10px] font-mono bg-muted/40 border border-border text-muted-foreground px-1.5 py-0.5 rounded-full">
                            مخفي
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{t.role}{t.company ? ` — ${t.company}` : ""}</p>
                      <div className="flex gap-0.5 mb-2">
                        {[...Array(5)].map((_, ri) => (
                          <Star key={ri} size={11} className={ri < t.rating ? "text-yellow-400 fill-yellow-400" : "text-border"} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{t.text}</p>
                      <p className="text-[10px] text-muted-foreground/50 font-mono mt-2">{fmtDate(t.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border/50">
                    <button
                      onClick={() => toggleFeatured(t)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all font-mono ${
                        t.featured
                          ? "border-yellow-400/40 text-yellow-400 bg-yellow-400/5"
                          : "border-border text-muted-foreground hover:border-yellow-400/30"
                      }`}
                    >
                      {t.featured ? "إزالة تمييز" : "تمييز"}
                    </button>
                    <button
                      onClick={() => toggleApproved(t)}
                      className="text-muted-foreground hover:text-primary border border-border hover:border-primary/40 p-1.5 rounded-lg transition-all"
                    >
                      {t.approved ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      className="text-muted-foreground hover:text-primary border border-border hover:border-primary/40 p-1.5 rounded-lg transition-all"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteId(t.id)}
                      className="text-muted-foreground hover:text-red-400 border border-border hover:border-red-400/40 p-1.5 rounded-lg transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && <Pager page={page} pages={pages} total={total} onChange={setPage} />}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold">{editing ? "تعديل تقييم" : "إضافة تقييم جديد"}</h2>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">الاسم *</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">الدور</label>
                      <input
                        value={form.role}
                        onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">الشركة</label>
                    <input
                      value={form.company}
                      onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">التقييم *</label>
                    <textarea
                      value={form.text}
                      onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                      rows={3}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">عدد النجوم: {form.rating}</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setForm((p) => ({ ...p, rating: n }))} className="text-xl">
                          <Star size={20} className={n <= form.rating ? "text-yellow-400 fill-yellow-400" : "text-border"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.approved}
                        onChange={(e) => setForm((p) => ({ ...p, approved: e.target.checked }))}
                        className="accent-primary"
                      />
                      مرئي (موافق عليه)
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                        className="accent-primary"
                      />
                      مميز
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-mono hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} حفظ
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="border border-border text-muted-foreground px-5 py-2.5 rounded-xl text-sm font-mono hover:border-primary/40 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete confirm */}
        <AnimatePresence>
          {deleteId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-background/70 backdrop-blur flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-card border border-red-400/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
              >
                <Trash2 size={28} className="text-red-400 mx-auto mb-3" />
                <h3 className="font-bold mb-2">حذف التقييم؟</h3>
                <p className="text-sm text-muted-foreground mb-5">لا يمكن التراجع عن هذا الإجراء.</p>
                <div className="flex gap-3">
                  <button onClick={() => remove(deleteId)} className="flex-1 bg-red-400 text-background py-2 rounded-xl text-sm font-mono hover:bg-red-500 transition-all">حذف</button>
                  <button onClick={() => setDeleteId(null)} className="flex-1 border border-border text-muted-foreground py-2 rounded-xl text-sm font-mono hover:border-primary/40 transition-all">إلغاء</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
