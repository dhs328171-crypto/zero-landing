import { useRef, useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { apiUpload } from "@/lib/api";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  /** Hint label above the input. */
  label?: string;
  /** Render an extra URL text input next to the uploader. */
  allowUrl?: boolean;
  className?: string;
}

/**
 * Single-image uploader — POSTs to /api/media/upload and returns the URL.
 * Falls back to a manual URL text input (when `allowUrl` is true).
 */
export function ImageUpload({
  value,
  onChange,
  label = "الصورة",
  allowUrl = true,
  className = "",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiUpload<{ items: { url: string }[] }>(
        "/media/upload",
        file
      );
      if (res.items?.[0]?.url) onChange(res.items[0].url);
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      )}
      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-background border border-border flex items-center justify-center flex-shrink-0 relative">
          {value ? (
            <>
              <img
                src={value}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-0.5 right-0.5 bg-background/90 rounded p-0.5 text-muted-foreground hover:text-red-400"
                aria-label="حذف الصورة"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <ImageIcon size={20} className="text-muted-foreground/40" />
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-mono hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {busy ? "جاري الرفع..." : "رفع صورة"}
            </button>
            {allowUrl && (
              <button
                type="button"
                onClick={() => setShowUrl((s) => !s)}
                className="flex items-center gap-1.5 border border-border text-muted-foreground px-3 py-1.5 rounded-lg text-xs hover:border-primary/40 hover:text-primary transition-all"
              >
                <LinkIcon size={13} /> رابط
              </button>
            )}
          </div>
          {showUrl && allowUrl && (
            <input
              value={value.startsWith("/") || value.startsWith("http") ? value : ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
              dir="ltr"
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
            />
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
          {value && (
            <p className="text-[10px] text-muted-foreground/60 font-mono truncate" dir="ltr">
              {value}
            </p>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
