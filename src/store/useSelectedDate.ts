"use client";
import { create } from "zustand";

type State = {
  date: Date;
  setDate: (d: Date) => void;
};

export const useSelectedDate = create<State>((set) => ({
  date: new Date(),
  setDate: (d: Date) => set({ date: d }),
}));
