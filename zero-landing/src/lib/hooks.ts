/**
 * Data hooks — fetch from real backend
 */
import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!path);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!path) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<T>(path);
      setData(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Projects
export const fetchProjects = () => apiGet<{ items: any[] }>("/projects");
export const fetchProject = (slug: string) => apiGet<{ item: any }>(`/projects/${slug}`);

// Blog
export const fetchBlogPosts = () => apiGet<{ items: any[] }>("/blog");
export const fetchBlogPost = (slug: string) => apiGet<{ item: any }>(`/blog/${slug}`);

// Testimonials
export const fetchTestimonials = () => apiGet<{ items: any[] }>("/testimonials");

// FAQ
export const fetchFAQs = () => apiGet<{ items: any[] }>("/faq");

// Services
export const fetchServices = () => apiGet<{ items: any[] }>("/services");

// Messages
export const submitMessage = (data: { name: string; email: string; subject?: string; message: string }) =>
  apiPost<{ success: boolean; id: string }>("/messages", data);
export const fetchMessages = () => apiGet<{ items: any[] }>("/messages");
export const markMessageRead = (id: string) => apiPut<{ item: any }>(`/messages/${id}/read`);
export const deleteMessage = (id: string) => apiDelete<{ success: boolean }>(`/messages/${id}`);

// Stats
export const fetchStats = () =>
  apiGet<{ projects: number; posts: number; testimonials: number; messages: number; users: number }>("/stats");

// Admin CRUD helpers
export const createProject = (data: any) => apiPost<{ item: any }>("/projects", data);
export const updateProject = (id: string, data: any) => apiPut<{ item: any }>(`/projects/${id}`, data);
export const deleteProject = (id: string) => apiDelete<{ success: boolean }>(`/projects/${id}`);

export const createBlogPost = (data: any) => apiPost<{ item: any }>("/blog", data);
export const updateBlogPost = (id: string, data: any) => apiPut<{ item: any }>(`/blog/${id}`, data);
export const deleteBlogPost = (id: string) => apiDelete<{ success: boolean }>(`/blog/${id}`);

export const createTestimonial = (data: any) => apiPost<{ item: any }>("/testimonials", data);
export const updateTestimonial = (id: string, data: any) => apiPut<{ item: any }>(`/testimonials/${id}`, data);
export const deleteTestimonial = (id: string) => apiDelete<{ success: boolean }>(`/testimonials/${id}`);

export const createFAQ = (data: any) => apiPost<{ item: any }>("/faq", data);
export const updateFAQ = (id: string, data: any) => apiPut<{ item: any }>(`/faq/${id}`, data);
export const deleteFAQ = (id: string) => apiDelete<{ success: boolean }>(`/faq/${id}`);

export const createService = (data: any) => apiPost<{ item: any }>("/services", data);
export const updateService = (id: string, data: any) => apiPut<{ item: any }>(`/services/${id}`, data);
export const deleteService = (id: string) => apiDelete<{ success: boolean }>(`/services/${id}`);
