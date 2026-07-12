import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Upload, Image as ImageIcon, Trash2, Copy, Check, Search, X, ExternalLink, Loader2,
} from "lucide-react";
import { apiGet, apiDelete, apiUpload, qs, type Paginated } from "@/lib/api";
import { Pager } from "@/components/ui/pager";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  alt: string | null;
  createdAt: string;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function fmtDate(s: string) {
  try { return new Date(s).toISOString().slice(0, 10); } catch { return s; }
}

export default function MediaGallery() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "pdf">("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = qs({
        page,
        limit: 24,
        q: search,
        type: typeFilter === "all" ? "" : typeFilter,
      });
      const res = await apiGet<Paginated<MediaItem>>(`/media${query}`);
      setItems(res.items);
      setTotal(res.total);
      setPages(res.pages);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter]);

  const copyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const remove = async (id: string) => {
    try {
      await apiDelete(`/media/${id}`);
      toast.success("تم حذف الملف");
      setDeleteId(null);
      setSelected(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const uploadFiles = async (files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith("image/") || f.type === "application/pdf");
    if (valid.length === 0) {
      toast.error("يرجى اختيار صور أو ملفات PDF فقط");
      return;
    }
    setUploading(true);
    try {
      const res = await apiUpload<{ items: MediaItem[] }>(`/media/upload`, valid);
      toast.success(`تم رفع ${res.items.length} ملف`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(Array.from(e.target.files));
    // Reset so same file can be selected again
    if (fileRef.current) fileRef.current.value = "";
  };

  const totalSizeMB = items.reduce((s, m) => s + m.size, 0) / 1024 / 1024;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">مكتبة الوسائط</h1>
            <p className="text-sm text-muted-foreground font-mono">// media.gallery()</p>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-mono hover:bg-primary/90 glow-cyan transition-all disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? "جاري الرفع..." : "رفع صور"}
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { l: "إجمالي الملفات", v: total, c: "text-primary" },
            { l: "حجم الصفحة", v: `${totalSizeMB.toFixed(2)} MB`, c: "text-yellow-400" },
            { l: "صور", v: items.filter((m) => m.type.startsWith("image/")).length, c: "text-green-400" },
          ].map((s) => (
            <div key={s.l} className="bg-card border border-border rounded-xl p-4">
              <p className={`text-xl font-bold font-mono ${s.c}`}>{s.v}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl py-8 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-card/30"
          }`}
        >
          <Upload size={24} className={`mx-auto mb-2 ${dragOver ? "text-primary" : "text-muted-foreground/40"}`} />
          <p className="text-sm text-muted-foreground">
            اسحب الصور هنا أو <span className="text-primary cursor-pointer">انقر للرفع</span>
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">PNG, JPG, GIF, WebP, PDF — حتى 10MB</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في الملفات..."
              className="w-full bg-card border border-border rounded-xl pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            {[
              { k: "all", l: "الكل" },
              { k: "image", l: "صور" },
              { k: "pdf", l: "PDF" },
            ].map(({ k, l }) => (
              <button
                key={k}
                onClick={() => setTypeFilter(k as any)}
                className={`px-3 py-2 rounded-lg text-xs font-mono border transition-all ${
                  typeFilter === k
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 size={20} className="animate-spin mr-2" /> جاري التحميل...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-card border border-dashed border-border rounded-xl">
            لا توجد ملفات — ارفع أول صورة
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all cursor-pointer"
                  onClick={() => setSelected(item)}
                >
                  <div className="aspect-square overflow-hidden relative bg-background flex items-center justify-center">
                    {item.type.startsWith("image/") ? (
                      <img
                        src={item.url}
                        alt={item.alt || item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon size={28} className="text-muted-foreground/40 mx-auto mb-1" />
                        <span className="text-[10px] font-mono text-muted-foreground">PDF</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); copyUrl(item); }}
                        className="bg-card p-1.5 rounded-lg text-primary hover:bg-card/90"
                      >
                        {copied === item.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
                        className="bg-card p-1.5 rounded-lg text-red-400 hover:bg-card/90"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{item.name}</p>
                    <p className="text-[9px] text-muted-foreground/50">{fmtSize(item.size)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && <Pager page={page} pages={pages} total={total} onChange={setPage} />}

        {/* Detail sidebar */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed inset-y-0 right-0 w-72 bg-card border-r border-border z-50 shadow-2xl p-5 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">تفاصيل الملف</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-background flex items-center justify-center">
                {selected.type.startsWith("image/") ? (
                  <img src={selected.url} alt={selected.alt || selected.name} className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon size={32} className="text-muted-foreground/40" />
                )}
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { l: "الاسم", v: selected.name },
                  { l: "النوع", v: selected.type },
                  { l: "الحجم", v: fmtSize(selected.size) },
                  { l: "التاريخ", v: fmtDate(selected.createdAt) },
                  { l: "النص البديل", v: selected.alt || "—" },
                ].map((d) => (
                  <div key={d.l}>
                    <p className="text-xs text-muted-foreground">{d.l}</p>
                    <p className="text-xs font-mono truncate" dir="ltr">{d.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
                  <input
                    readOnly
                    value={selected.url}
                    className="flex-1 text-xs bg-transparent focus:outline-none text-muted-foreground truncate"
                    dir="ltr"
                  />
                  <button onClick={() => copyUrl(selected)} className="text-primary flex-shrink-0">
                    {copied === selected.id ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                  </button>
                </div>
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full border border-border text-muted-foreground py-2 rounded-lg text-xs font-mono hover:border-primary/40 hover:text-primary transition-all"
                >
                  <ExternalLink size={12} /> فتح في نافذة جديدة
                </a>
                <button
                  onClick={() => setDeleteId(selected.id)}
                  className="w-full flex items-center justify-center gap-2 border border-red-400/20 text-red-400 py-2 rounded-lg text-xs font-mono hover:bg-red-400/5 transition-all"
                >
                  <Trash2 size={12} /> حذف الملف
                </button>
              </div>
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
                <h3 className="font-bold mb-1">حذف الملف؟</h3>
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
