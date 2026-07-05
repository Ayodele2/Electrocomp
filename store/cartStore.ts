import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        const existing = get().items.find((i) => i.productId === product.id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
            isOpen: true,
          }));
        } else {
          set((state) => ({
            items: [
              ...state.items,
              {
                id: crypto.randomUUID(),
                productId: product.id,
                quantity,
                product,
              },
            ],
            isOpen: true,
          }));
        }
      },

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        })),

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + Number(i.product.price) * i.quantity,
          0
        ),
    }),
    {
      name: "electrocomp-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);