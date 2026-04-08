import { create } from "zustand";

interface RouteTransitionState {
  isNavigating: boolean;
  progress: number;
  startedAt: number;
  start: () => void;
  setProgress: (value: number) => void;
  done: () => void;
}

export const useRouteTransitionStore = create<RouteTransitionState>((set, get) => ({
  isNavigating: false,
  progress: 0,
  startedAt: 0,
  start: () => {
    const state = get();
    if (state.isNavigating) return;
    set({ isNavigating: true, progress: 12, startedAt: Date.now() });
  },
  setProgress: (value) => {
    const clamped = Math.max(0, Math.min(100, value));
    set({ progress: clamped });
  },
  done: () => {
    set({ progress: 100 });
    setTimeout(() => {
      set({ isNavigating: false, progress: 0, startedAt: 0 });
    }, 180);
  },
}));
