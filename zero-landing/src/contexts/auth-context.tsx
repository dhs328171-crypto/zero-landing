import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiPost, apiGet, apiPut, getToken, setToken } from "@/lib/api";

// Session timeout: 30 minutes of inactivity → auto-logout admin
const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000;
const SESSION_KEY = "zero_last_activity";
const ADMIN_PIN_KEY = "zero_admin_verified";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  avatar?: string;
  joinedAt: string;
  bio?: string;
  phone?: string;
  country?: string;
  website?: string;
  social?: { twitter?: string; linkedin?: string; github?: string };
  verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminVerified: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = "zero_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminVerified, setAdminVerified] = useState(false);

  // Session timeout for admin users
  const updateActivity = useCallback(() => {
    localStorage.setItem(SESSION_KEY, String(Date.now()));
  }, []);

  const checkSessionTimeout = useCallback(() => {
    const lastActivity = localStorage.getItem(SESSION_KEY);
    if (lastActivity && user?.role === "admin") {
      const elapsed = Date.now() - Number(lastActivity);
      if (elapsed > ADMIN_SESSION_TIMEOUT) {
        // Session expired — log out
        setUser(null);
        setToken(null);
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(ADMIN_PIN_KEY);
        setAdminVerified(false);
        return false;
      }
    }
    return true;
  }, [user]);

  // Track activity
  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    const handler = () => updateActivity();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, [updateActivity]);

  // Check session every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkSessionTimeout();
    }, 60000);
    return () => clearInterval(interval);
  }, [checkSessionTimeout]);

  // On mount: restore from localStorage, then verify with backend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 1. Restore cached user
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem(AUTH_KEY);
        }
      }

      // 2. If we have a token, verify with backend
      const token = getToken();
      if (token) {
        try {
          const res = await apiGet<{ user: User | null }>("/auth/me");
          if (!cancelled && res.user) {
            setUser(res.user);
            localStorage.setItem(AUTH_KEY, JSON.stringify(res.user));
          } else if (!cancelled) {
            // Token invalid — clear
            setUser(null);
            localStorage.removeItem(AUTH_KEY);
            setToken(null);
          }
        } catch {
          // API not reachable — keep cached user
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const res = await apiPost<{ token: string; user: User }>("/auth/login", { email, password });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem(AUTH_KEY, JSON.stringify(res.user));
      return { success: true, user: res.user };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const res = await apiPost<{ token: string; user: User }>("/auth/register", { name, email, password });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem(AUTH_KEY, JSON.stringify(res.user));
      return { success: true, user: res.user };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ADMIN_PIN_KEY);
    setAdminVerified(false);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    apiPut<{ user: User }>("/auth/profile", data)
      .then((res) => {
        setUser(res.user);
        localStorage.setItem(AUTH_KEY, JSON.stringify(res.user));
      })
      .catch(() => {
        // Fallback to local update
        const updated = { ...user, ...data };
        setUser(updated);
        localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
      });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        adminVerified,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
