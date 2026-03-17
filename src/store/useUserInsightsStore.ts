import { create } from "zustand";
import {
  getUserInsightsData,
  SparkAnalyticsData,
} from "@/src/lib/userInsightsApiHandler";

export interface UserInsightsState {
  data: SparkAnalyticsData | null;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  clearData: () => void;
}

export const useUserInsightsStore = create<UserInsightsState>((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getUserInsightsData();
      set({ data, loading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch analytics data";
      set({ error: errorMessage, loading: false, data: null });
      console.error("UserInsightsStore error:", error);
    }
  },

  clearData: () => {
    set({ data: null, loading: false, error: null });
  },
}));
