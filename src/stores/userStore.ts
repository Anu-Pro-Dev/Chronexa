import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "user-store",
    }
  )
);