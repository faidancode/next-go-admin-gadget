import { Role } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type AuthState = {
  user: AuthUser | null;
  hasHydrated: boolean;
  isValidating: boolean;

  /** derived */
  isAuthenticated: () => boolean;

  login: (user: AuthUser) => void;
  logout: () => void;
  setHydrated: () => void;
  setValidating: (val: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hasHydrated: false,
      isValidating: false,

      // ✅ DERIVED STATE (single source of truth)
      isAuthenticated: () => Boolean(get().user),

      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      setHydrated: () => set({ hasHydrated: true }),
      setValidating: (val) => set({ isValidating: val }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
