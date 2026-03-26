import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Organization {
  id: number;
  name: string;
}

interface User {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  organization?: Organization;
  [key: string]: any;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
  // Helper to get organization ID
  getOrganizationId: () => number | null;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      getOrganizationId: () => {
        const user = get().user;
        return user?.organization?.id ?? null;
      },
    }),
    {
      name: "user-store",
    }
  )
);
