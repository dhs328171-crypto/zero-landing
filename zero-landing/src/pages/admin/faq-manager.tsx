import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Search, Edit2, Trash2, X, Save, GripVertical, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete, qs, type Paginated } from "@/lib/api";
import { toast } from "sonner";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  visible: boolean;
}

const cats = ["عام", "تقني", "أسعار", "دعم", "مشاريع", "ملكية", "دفع"];

const empty = { question: "", answer: "", category: "عام", order: 0, visible: true };

const catColors: Record<string, string> = {
  "عام": "text-primary bg-primary/10 border-primary/20",
  "تقني": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "أسعار": "text-green-400 bg-green-400/10 border-green-400/20",
  "دفع": "text-green-400 bg-green-400/10 border-green-400/20",
  "دعم": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "مشاريع": "text-purple-400 bg-purple-400/10 border-purple-400/20",
  "ملكية": "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

export default function FaqManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("الكل");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = qs({ page: 1, limit: 100, q: search, all: true });
      const res = await apiGet<Paginated<FAQ>>(`/faq${query}`);
      let list = res.items;
      if (catFilter !== "الكل") list = list.filter((f) => f.category === catFilter);
      setFaqs(list);
      setTotal(res.total);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, catFilter]);

  useEffect(() => {
    const t = setTimeout(() => load(), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, catFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...empty, order: faqs.length + 1 });
    setShowModal(true);
  };
  const openEdit = (f: FAQ) => {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, category: f.category, order: f.order, visible: f.visible });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.question || !form.answer) {
      toast.error("السؤال والإجابة مطلوبان");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await apiPut(`/faq/${editing.id}`, form);
        toast.success("تم تحديث السؤال");
      } else {
        await apiPost(`/faq`, form);
        toast.success("تم إضافة السؤال");
      }
      setShowModal(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (f: FAQ) => {
    try {
      await apiPut(`/faq/${f.id}`, { visible: !f.visible });
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  const remove = async (id: string) => {
    try {
      await apiDelete(`/faq/${id}`);
      toast.success("تم حذف السؤال");
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
            <h1 className="text-2xl font-bold">إدارة الأسئلة الشائعة</h1>
            <p className="text-sm text-muted-foreground font-mono">// faq.manage()</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-mono hover:bg-primary/90 glow-cyan transition-all"
          >
            <Plus size={16} /> إضافة سؤال
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "إجمالي الأسئلة", v: total, c: "text-primary" },
            { l: "مرئية", v: faqs.filter((f) => f.visible).length, c: "text-green-400" },
            { l: "مخفية", v: faqs.filter((f) => !f.visible).length, c: "text-muted-foreground" },
            { l: "التصنيفات", v: cats.length, c: "text-purple-400" },
          ].map((s) => (
            <div key={s.l} className="bg-card border border-border rounded-xl p-4">
              <p className={`text-2xl font-bold font-mono ${s.c}`}>{s.v}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في الأسئلة..."
              className="w-full bg-card border border-border rounded-xl pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["الكل", ...cats].map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  catFilter === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 size={20} className="animate-spin mr-2" /> جاري التحميل...
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-card border border-dashed border-border rounded-xl">
            لا توجد أسئلة
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {faqs.map((faq, i) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-card border rounded-xl overflow-hidden transition-all ${
                    faq.visible ? "border-border" : "border-border/40 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 px-4 py-4">
                    <GripVertical size={16} className="text-muted-foreground/40 flex-shrink-0 cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${catColors[faq.category] || "text-muted-foreground bg-muted border-border"}`}>
                          {faq.category}
                        </span>
                        <span className="text-sm font-medium truncate">{faq.question}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleVisible(faq)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${
                          faq.visible ? "border-green-400/30 text-green-400" : "border-border text-muted-foreground"
                        }`}
                      >
                        {faq.visible ? "مرئي" : "مخفي"}
                      </button>
                      <button onClick={() => openEdit(faq)} className="text-muted-foreground hover:text-primary p-1.5 rounded-lg border border-border hover:border-primary/40 transition-all">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteId(faq.id)} className="text-muted-foreground hover:text-red-400 p-1.5 rounded-lg border border-border hover:border-red-400/40 transition-all">
                        <Trash2 size={13} />
                      </button>
                      <button onClick={() => setExpanded(expanded === faq.id ? null : faq.id)} className="text-muted-foreground hover:text-primary p-1.5 transition-all">
                        {expanded === faq.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expanded === faq.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 pt-0 border-t border-border text-sm text-muted-foreground leading-relaxed pr-11 whitespace-pre-wrap">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

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
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold">{editing ? "تعديل السؤال" : "إضافة سؤال جديد"}</h2>
                  <button onClick={() => setShowModal(false)}>
                    <X size={18} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">التصنيف</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    >
                      {cats.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">السؤال *</label>
                    <input
                      value={form.question}
                      onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">الإجابة *</label>
                    <textarea
                      value={form.answer}
                      onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
                      rows={4}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">الترتيب</label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.visible}
                      onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))}
                      className="accent-primary"
                    />
                    مرئي في الموقع
                  </label>
                </div>
                <div className="flex gap-3 mt-5">
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
                className="bg-card border border-red-400/20 rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl"
              >
                <Trash2 size={28} className="text-red-400 mx-auto mb-3" />
                <h3 className="font-bold mb-1">حذف السؤال؟</h3>
                <p className="text-xs text-muted-foreground mb-4">لا يمكن التراجع عن هذا الإجراء.</p>
                <div className="flex gap-3">
                  <button onClick={() => remove(deleteId)} className="flex-1 bg-red-400 text-background py-2 rounded-xl text-sm font-mono">حذف</button>
                  <button onClick={() => setDeleteId(null)} className="flex-1 border border-border text-muted-foreground py-2 rounded-xl text-sm font-mono">إلغاء</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
