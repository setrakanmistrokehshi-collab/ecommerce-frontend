import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => i._id === product._id);
        if (existing) {
          set({
            items: items.map((i) =>
              i._id === product._id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity }] });
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i._id !== id) }),

      updateQty: (id, qty) => {
        if (qty < 1) return get().removeItem(id);
        set({
          items: get().items.map((i) =>
            i._id === id ? { ...i, quantity: qty } : i
          ),
        });
      },

      clear: () => set({ items: [] }),

      get total() {
        return get().items.reduce((s, i) => s + i.price * i.quantity, 0);
      },

      get count() {
        return get().items.reduce((s, i) => s + i.quantity, 0);
      },
    }),
    { name: 'winners-cart' }
  )
);

export default useCartStore;
