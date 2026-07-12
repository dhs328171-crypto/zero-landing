import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Edit2, Trash2, Eye, X, Save, Search, BookOpen, Loader2 } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete, qs, type Paginated } from "@/lib/api";
import { Pager } from "@/components/ui/pager";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  tag: string;
  hot: boolean;
  published: boolean;
  views: number;
  createdAt: string;
}

const tagColors: Record<string, string> = {
  React: "text-primary bg-primary/10 border-primary/20",
  "Node.js": "text-green-400 bg-green-400/10 border-green-400/20",
  Tailwind: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  TypeScript: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  Database: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  DevOps: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  General: "text-muted-foreground bg-muted/20 border-border",
};

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
}

function formatDate(s: string) {
  try {
    return new Date(s).toISOString().slice(0, 10);
  } catch {
    return s;
  }
}

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  tag: "General",
  hot: false,
  published: true,
};

export default function AdminBlog() {
  const [items, setItems] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = qs({
        page,
        limit: 10,
        q: search,
        tag: tagFilter,
        all: true,
      });
      const res = await apiGet<Paginated<Post>>(`/blog${query}`);
      setItems(res.items);
      setTotal(res.total);
      setPages(res.pages);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, tagFilter]);

  // Debounced search → reset to page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, tagFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };
  const openEdit = (p: Post) => {
    setEditing(p);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      image: p.image,
      tag: p.tag,
      hot: p.hot,
      published: p.published,
    });
    setShowModal(true);
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
        await apiPut(`/blog/${editing.id}`, payload);
        toast.success("تم تحديث المقال");
      } else {
        await apiPost(`/blog`, payload);
        toast.success("تم نشر المقال");
      }
      setShowModal(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiDelete(`/blog/${id}`);
      toast.success("تم حذف المقال");
      setDeleteId(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const publishedCount = items.filter((p) => p.published).length;
  const draftsCount = items.filter((p) => !p.published).length;
  const totalViews = items.reduce((s, p) => s + (p.views || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">إدارة المدونة</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              // blog.posts() — {total} مقال
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-mono hover:bg-primary/90 glow-cyan"
          >
            <Plus size={16} /> مقال جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "منشور", count: publishedCount, color: "text-green-400" },
            { label: "إجمالي المشاهدات", count: totalViews.toLocaleString(), color: "text-primary" },
            { label: "مسودات", count: draftsCount, color: "text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + tag filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في المقالات..."
              className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">كل التصنيفات</option>
            {Object.keys(tagColors).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Posts list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border text-xs font-mono text-muted-foreground">
            <span>العنوان</span><span>التصنيف</span><span>الحالة</span><span>المشاهدات</span><span></span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 size={18} className="animate-spin mr-2" /> جاري التحميل...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">لا توجد مقالات</div>
          ) : (
            <AnimatePresence>
              {items.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 border-b border-border/50 hover:bg-background/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{formatDate(p.createdAt)}</p>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border w-fit ${tagColors[p.tag] || tagColors.General}`}>
                    {p.tag}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border w-fit ${
                    p.published
                      ? "bg-green-400/10 text-green-400 border-green-400/30"
                      : "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
                  }`}>
                    {p.published ? "منشور" : "مسودة"}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-mono text-muted-foreground">
                    <Eye size={12} className="text-primary" />
                    {(p.views || 0).toLocaleString()}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-muted-foreground hover:text-primary">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-muted-foreground hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination */}
        {!loading && (
          <Pager page={page} pages={pages} total={total} onChange={setPage} />
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <BookOpen size={18} className="text-primary" />
                    {editing ? "تعديل المقال" : "مقال جديد"}
                  </h2>
                  <button onClick={() => setShowModal(false)}>
                    <X size={18} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">عنوان المقال</label>
                    <input
                      value={form.title}
                      onChange={(e) => {
                        const t = e.target.value;
                        setForm((p) => ({
                          ...p,
                          title: t,
                          slug: editing ? p.slug : slugify(t),
                        }));
                      }}
                      placeholder="عنوان المقال..."
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
                        placeholder="post-slug"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">التصنيف</label>
                      <select
                        value={form.tag}
                        onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      >
                        {Object.keys(tagColors).map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <ImageUpload
                    label="صورة الغلاف"
                    value={form.image}
                    onChange={(url) => setForm((p) => ({ ...p, image: url }))}
                  />
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">مقتطف (Excerpt)</label>
                    <textarea
                      value={form.excerpt}
                      onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                      rows={2}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">المحتوى</label>
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                      rows={5}
                      placeholder="اكتب محتوى المقال هنا..."
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.published}
                        onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
                        className="accent-primary"
                      />
                      منشور
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.hot}
                        onChange={(e) => setForm((p) => ({ ...p, hot: e.target.checked }))}
                        className="accent-primary"
                      />
                      مقال مميز (Hot)
                    </label>
                  </div>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-mono text-sm hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    {editing ? "حفظ التعديلات" : "نشر المقال"}
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
                <p className="text-sm text-muted-foreground mb-5">
                  هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-card/50"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => remove(deleteId)}
                    className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
                  >
                    حذف
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
