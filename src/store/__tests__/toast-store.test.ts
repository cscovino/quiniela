import { beforeEach, describe, expect, it } from 'vitest';

import { __resetToastStore, useToastStore } from '../toast-store';

describe('toast-store', () => {
  beforeEach(() => {
    __resetToastStore();
  });

  describe('addToast', () => {
    it('appends a new toast to the list', () => {
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Saved',
        message: 'Your prediction was saved',
      });

      const toasts = useToastStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({
        type: 'success',
        title: 'Saved',
        message: 'Your prediction was saved',
      });
      expect(toasts[0].id).toBeDefined();
    });

    it('deduplicates an identical toast that fires twice in a row (TOAST-dedup)', () => {
      // Repro of the duplicate "Error al enviar las predicciones" toast: a catch
      // block and a feedback effect can both enqueue the same payload in the same tick.
      const payload = {
        type: 'error' as const,
        title: 'Error al enviar las predicciones',
        message: 'Error al enviar las predicciones',
      };

      useToastStore.getState().addToast(payload);
      useToastStore.getState().addToast(payload);

      expect(useToastStore.getState().toasts).toHaveLength(1);
    });

    it('does not deduplicate a different toast that follows a duplicate', () => {
      const first = { type: 'error' as const, title: 'A', message: 'A' };
      const second = { type: 'error' as const, title: 'B', message: 'B' };

      useToastStore.getState().addToast(first);
      useToastStore.getState().addToast(first);
      useToastStore.getState().addToast(second);

      const toasts = useToastStore.getState().toasts;
      expect(toasts).toHaveLength(2);
      expect(toasts.map((t) => t.title)).toEqual(['A', 'B']);
    });
  });

  describe('dismissToast', () => {
    it('removes the toast with the given id', () => {
      useToastStore.getState().addToast({ type: 'info', title: 't', message: 'm' });
      const id = useToastStore.getState().toasts[0].id;
      useToastStore.getState().dismissToast(id);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('clearToasts', () => {
    it('empties the list', () => {
      useToastStore.getState().addToast({ type: 'info', title: 'a', message: 'a' });
      useToastStore.getState().addToast({ type: 'info', title: 'b', message: 'b' });
      useToastStore.getState().clearToasts();
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });
});
