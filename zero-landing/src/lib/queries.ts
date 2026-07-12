/**
 * Convenience hooks for fetching public data from the API.
 * Uses @tanstack/react-query so we get caching, deduplication, and refetch
 * for free across all pages that consume the same data.
 */
import { useQuery } from "@tanstack/react-query";
import { apiGet, qs, type Paginated } from "@/lib/api";

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string; // JSON string
  price: string | null;
  active: boolean;
  order: number;
}
export interface Project {
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
export interface BlogPost {
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
  authorId: string | null;
  createdAt: string;
}
export interface Testimonial {
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
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  visible: boolean;
  createdAt: string;
}
export interface Stats {
  projects: number;
  posts: number;
  testimonials: number;
  messages: number;
  users: number;
  media: number;
}

/** Parse a JSON-encoded feature list, falling back to []. */
export function parseFeatures(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** Map icon string from DB → emoji; allows admin to store either an emoji or a name. */
export function iconToEmoji(icon: string | null | undefined): string {
  if (!icon) return "⚡";
  // If it's already a single emoji (or short emoji sequence), return as-is.
  if (/^\p{Extended_Pictographic}/u.test(icon) || icon.length <= 4) return icon;
  // Fallback map for common lucide icon names used in seed.
  const map: Record<string, string> = {
    Code: "💻",
    Palette: "🎨",
    ShoppingCart: "🛒",
    Smartphone: "📱",
    Database: "🗄️",
    BarChart3: "📊",
    Cloud: "☁️",
    Zap: "⚡",
    Star: "⭐",
  };
  return map[icon] || "⚡";
}

// ---------------------------------------------------------------------------
//  Hooks
// ---------------------------------------------------------------------------

export function useStats() {
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: () => apiGet<Stats>("/stats"),
    staleTime: 60_000,
  });
}

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await apiGet<{ items: Service[] }>("/services");
      return res.items;
    },
    staleTime: 60_000,
  });
}

export function useProjects(opts: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  featured?: boolean;
} = {}) {
  const { page = 1, limit = 12, q = "", category = "", featured } = opts;
  const query = qs({ page, limit, q, category, featured: featured ? true : "" });
  return useQuery<Paginated<Project>>({
    queryKey: ["projects", page, limit, q, category, featured],
    queryFn: () => apiGet<Paginated<Project>>(`/projects${query}`),
    staleTime: 30_000,
  });
}

export function useProject(slug: string | null) {
  return useQuery<Project>({
    queryKey: ["project", slug],
    queryFn: async () => {
      const res = await apiGet<{ item: Project }>(`/projects/${slug}`);
      return res.item;
    },
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function useBlog(opts: {
  page?: number;
  limit?: number;
  q?: string;
  tag?: string;
  all?: boolean;
} = {}) {
  const { page = 1, limit = 9, q = "", tag = "", all = false } = opts;
  const query = qs({ page, limit, q, tag, all: all ? true : "" });
  return useQuery<Paginated<BlogPost>>({
    queryKey: ["blog", page, limit, q, tag, all],
    queryFn: () => apiGet<Paginated<BlogPost>>(`/blog${query}`),
    staleTime: 30_000,
  });
}

export function useBlogPost(slug: string | null) {
  return useQuery<BlogPost>({
    queryKey: ["blogPost", slug],
    queryFn: async () => {
      const res = await apiGet<{ item: BlogPost }>(`/blog/${slug}`);
      return res.item;
    },
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function useTestimonials(opts: {
  page?: number;
  limit?: number;
  q?: string;
  all?: boolean;
  featured?: boolean;
} = {}) {
  const { page = 1, limit = 50, q = "", all = false, featured } = opts;
  const query = qs({ page, limit, q, all: all ? true : "", featured: featured ? true : "" });
  return useQuery<Paginated<Testimonial>>({
    queryKey: ["testimonials", page, limit, q, all, featured],
    queryFn: () => apiGet<Paginated<Testimonial>>(`/testimonials${query}`),
    staleTime: 30_000,
  });
}

export function useFAQs(opts: { q?: string; category?: string; all?: boolean } = {}) {
  const { q = "", category = "", all = false } = opts;
  const query = qs({ page: 1, limit: 100, q, category, all: all ? true : "" });
  return useQuery<FAQ[]>({
    queryKey: ["faqs", q, category, all],
    queryFn: async () => {
      const res = await apiGet<Paginated<FAQ>>(`/faq${query}`);
      return res.items;
    },
    staleTime: 60_000,
  });
}
