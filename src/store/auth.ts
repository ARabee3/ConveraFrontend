import { create } from "zustand";
import type { AuthTokens, User } from "@/lib/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (tokens: AuthTokens) => void;
  clearAuth: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  setAuth: (tokens: AuthTokens) => {
    localStorage.setItem("convera_access_token", tokens.accessToken);
    localStorage.setItem("convera_refresh_token", tokens.refreshToken);
    localStorage.setItem("convera_user", JSON.stringify(tokens.user));
    // Store in cookie for middleware
    document.cookie = `convera_token=${tokens.accessToken}; path=/; SameSite=Lax; max-age=86400`;
    document.cookie = `convera_role=${tokens.user.role}; path=/; SameSite=Lax; max-age=86400`;
    set({
      user: tokens.user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  },

  clearAuth: () => {
    localStorage.removeItem("convera_access_token");
    localStorage.removeItem("convera_refresh_token");
    localStorage.removeItem("convera_user");
    document.cookie = "convera_token=; path=/; max-age=0";
    document.cookie = "convera_role=; path=/; max-age=0";
    set({ user: null, accessToken: null, refreshToken: null });
  },

  initFromStorage: () => {
    if (typeof window === "undefined") return;
    const accessToken = localStorage.getItem("convera_access_token");
    const refreshToken = localStorage.getItem("convera_refresh_token");
    const userStr = localStorage.getItem("convera_user");
    if (accessToken && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, accessToken, refreshToken });
      } catch {
        // ignore
      }
    }
  },
}));
