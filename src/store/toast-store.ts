import { create } from 'zustand';

import type { Toast } from '@atoms/Toast';

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

let toastId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastId}-${Date.now()}`;
    set((state) => {
      // Deduplicate: if the most recent toast shares the same title+message+type,
      // skip inserting a duplicate. (Catches the case where a catch block and a
      // feedback effect both fire the same error in the same tick.)
      const last = state.toasts[state.toasts.length - 1];
      if (
        last &&
        last.title === toast.title &&
        last.message === toast.message &&
        last.type === toast.type
      ) {
        return state;
      }
      return {
        toasts: [...state.toasts, { ...toast, id }],
      };
    });
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// Test-only helper to reset the in-memory toast queue between tests.
export const __resetToastStore = () =>
  useToastStore.setState({ toasts: [] });
