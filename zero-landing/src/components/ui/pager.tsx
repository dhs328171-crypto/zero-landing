import { ChevronRight, ChevronLeft } from "lucide-react";
import { useT } from "@/contexts/i18n-context";

interface PagerProps {
  page: number;
  pages: number;
  total?: number;
  onChange: (page: number) => void;
  className?: string;
}

/**
 * Lightweight, button-driven pager — works without router links.
 * Shows: «prev» [1] [2] [3] … [N] »next»
 */
export function Pager({ page, pages, total, onChange, className = "" }: PagerProps) {
  const t = useT();

  if (pages <= 1) {
    return total ? (
      <div className={`text-xs text-muted-foreground font-mono ${className}`}>
        {t("pager.totalItems")} {total}
      </div>
    ) : null;
  }

  // Build a windowed list of page numbers (current ±1, plus first/last)
  const nums = new Set<number>([1, pages, page]);
  if (page - 1 > 1) nums.add(page - 1);
  if (page + 1 < pages) nums.add(page + 1);
  const sorted = Array.from(nums).sort((a, b) => a - b);

  const btnBase =
    "min-w-[32px] h-8 px-2 rounded-lg text-xs font-mono border transition-all flex items-center justify-center";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {total !== undefined && (
        <span className="text-xs text-muted-foreground font-mono ml-2">
          {t("pager.total")} {total}
        </span>
      )}
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${btnBase} ${
          page <= 1
            ? "opacity-40 cursor-not-allowed border-border"
            : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
        }`}
      >
        <ChevronRight size={14} />
      </button>

      {sorted.map((n, i) => {
        const prev = sorted[i - 1];
        const showEllipsis = prev && n - prev > 1;
        return (
          <span key={n} className="flex items-center gap-1">
            {showEllipsis && <span className="text-muted-foreground/40 px-0.5">…</span>}
            <button
              type="button"
              onClick={() => onChange(n)}
              className={`${btnBase} ${
                n === page
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              {n}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className={`${btnBase} ${
          page >= pages
            ? "opacity-40 cursor-not-allowed border-border"
            : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
        }`}
      >
        <ChevronLeft size={14} />
      </button>
    </div>
  );
}
