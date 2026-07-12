import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Plus, Search, Edit2, Trash2, ExternalLink, X, Save, Code2, Loader2, Star,
} from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete, qs, type Paginated } from "@/lib/api";
import { Pager } from "@/components/ui/pager";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  tech: string;
  category: string;
  image: string;
  url: string | null;
  featured: boolean;
  createdAt: string;
}

const categories = ["General", "متجر", "تطبيق", "موقع", "نظام"];

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
}

function formatDate(s: string) {
  try { return new Date(s).toISOString().slice(0, 10); } catch { return s; }
}

const emptyProject = {
  title: "",
  slug: "",
  description: "",
  tech: "",
  category: "General",
  image: "",
  url: "",
  featured: false,
};

export default function AdminProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const [editing, setEditing] = useState<Project | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ ...emptyProject });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = qs({
        page,
        limit: 12,
        q: search,
        category: catFilter,
        featured: featuredOnly ? true : "",
      });
      const res = await apiGet<Paginated<Project>>(`/projects${query}`);
      setItems(res.items);
      setTotal(res.total);
      setPages(res.pages);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, catFilter, featuredOnly]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, catFilter, featuredOnly]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyProject });
    setIsAdding(true);
  };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title: p.title, slug: p.slug, description: p.description, tech: p.tech,
      category: p.category, image: p.image, url: p.url || "", featured: p.featured,
    });
    setIsAdding(true);
  };

  const save = async () => {
    if (!form.title || !form.slug) {
      toast.error("العنوان والـ slug مطلوبان");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, slug: slugify(form.slug) };
      if (editing) {
        await apiPut(`/projects/${editing.id}`, payload);
        toast.success("تم تحديث المشروع");
      } else {
        await apiPost(`/projects`, payload);
        toast.success("تم إضافة المشروع");
      }
      setIsAdding(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiDelete(`/projects/${id}`);
      toast.success("تم حذف المشروع");
      setDeleteId(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleFeatured = async (p: Project) => {
    try {
      await apiPut(`/projects/${p.id}`, { featured: !p.featured });
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة المشاريع</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              // {total} مشروع إجمالاً
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-mono hover:bg-primary/90 glow-cyan transition-all"
          >
            <Plus size={16} /> مشروع جديد
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في العنوان/الوصف/التقنيات..."
              className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">كل التصنيفات</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={() => setFeaturedOnly((v) => !v)}
            className={`px-3 py-2.5 rounded-lg text-sm border font-mono transition-all flex items-center gap-1.5 ${
              featuredOnly
                ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                : "border-border text-muted-foreground hover:border-yellow-400/30"
            }`}
          >
            <Star size={14} fill={featuredOnly ? "currentColor" : "none"} /> مميز فقط
          </button>
        </div>

        {/* Projects grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 size={20} className="animate-spin mr-2" /> جاري التحميل...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-card border border-dashed border-border rounded-xl">
            لا توجد مشاريع مطابقة
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence>
              {items.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all group"
                >
                  {/* Image */}
                  <div className="aspect-video bg-background relative overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Code2 size={28} className="text-muted-foreground/30" />
                      </div>
                    )}
                    {p.featured && (
                      <span className="absolute top-2 right-2 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 text-[10px] font-mono px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={9} fill="currentColor" /> مميز
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-foreground mb-1 leading-tight">{p.title}</h3>
                    <p className="text-xs font-mono text-primary/70 mb-2">{p.tech}</p>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-mono">{formatDate(p.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button onClick={() => toggleFeatured(p)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-yellow-400 transition-colors">
                          <Star size={14} fill={p.featured ? "currentColor" : "none"} className={p.featured ? "text-yellow-400" : ""} />
                        </button>
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && <Pager page={page} pages={pages} total={total} onChange={setPage} />}

        {/* Modal */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsAdding(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">{editing ? "تعديل المشروع" : "إضافة مشروع جديد"}</h2>
                  <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">اسم المشروع</label>
                    <input
                      value={form.title}
                      onChange={(e) => {
                        const t = e.target.value;
                        setForm((p) => ({ ...p, title: t, slug: editing ? p.slug : slugify(t) }));
                      }}
                      placeholder="مثال: متجر إلكتروني"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Slug</label>
                      <input
                        value={form.slug}
                        onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
                        dir="ltr"
                        placeholder="project-slug"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">التصنيف</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      >
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">التقنيات</label>
                    <input
                      value={form.tech}
                      onChange={(e) => setForm((p) => ({ ...p, tech: e.target.value }))}
                      placeholder="React + Node.js + ..."
                      dir="ltr"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <ImageUpload
                    label="صورة المشروع"
                    value={form.image}
                    onChange={(url) => setForm((p) => ({ ...p, image: url }))}
                  />
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">رابط المشروع</label>
                    <input
                      value={form.url}
                      onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                      placeholder="https://..."
                      dir="ltr"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">الوصف</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      rows={3}
                      placeholder="وصف مختصر للمشروع..."
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                      className="accent-primary"
                    />
                    مشروع مميز
                  </label>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-mono text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    {editing ? "حفظ التعديلات" : "إضافة المشروع"}
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
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-card border border-red-400/30 rounded-xl p-6 max-w-sm w-full text-center"
              >
                <Trash2 size={32} className="text-red-400 mx-auto mb-3" />
                <h3 className="font-bold mb-2">تأكيد الحذف</h3>
                <p className="text-sm text-muted-foreground mb-5">هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-card/50">إلغاء</button>
                  <button onClick={() => remove(deleteId)} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600">حذف</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
