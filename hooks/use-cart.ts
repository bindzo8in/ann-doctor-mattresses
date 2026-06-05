import { create } from "zustand";
import { useEffect } from "react";

interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    thumbnailUrl: string;
  };
  variant: {
    id: string;
    salePrice: number;
    mrp: number;
  } | null;
  quantityPurchased: number;
  quantityFree: number;
  totalDelivered: number;
  unitPrice: number;
  totalPaid: number;
  saved: number;
  offerType: string | null;
  offerName: string | null;
}

interface CartStore {
  cartItems: CartItem[];
  subTotal: number;
  discountTotal: number;
  shippingTotal: number;
  totalAmount: number;
  pincode: string | null;
  isLoading: boolean;
  isAddingToCart: boolean;
  isUpdatingQuantity: boolean;
  isRemovingFromCart: boolean;
  error: Error | null;
  hasLoaded: boolean;
  
  fetchCart: () => Promise<void>;
  addToCart: (params: { productId: string; variantId: string | null; quantity: number }) => Promise<void>;
  updateQuantity: (params: { cartItemId: string; quantity: number }) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
}

const useCartStore = create<CartStore>((set, get) => ({
  cartItems: [],
  subTotal: 0,
  discountTotal: 0,
  shippingTotal: 0,
  totalAmount: 0,
  pincode: null,
  isLoading: false,
  isAddingToCart: false,
  isUpdatingQuantity: false,
  isRemovingFromCart: false,
  error: null,
  hasLoaded: false,

  fetchCart: async () => {
    // Avoid double loading indicators if already loaded once
    set({ isLoading: !get().hasLoaded });
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) {
          set({ cartItems: [], subTotal: 0, discountTotal: 0, shippingTotal: 0, totalAmount: 0, pincode: null, isLoading: false, hasLoaded: true });
          return;
        }
        throw new Error("Failed to fetch cart");
      }
      const data = await res.json();
      set({ 
        cartItems: data.items || [], 
        subTotal: data.subTotal || 0,
        discountTotal: data.discountTotal || 0,
        shippingTotal: data.shippingTotal || 0,
        totalAmount: data.totalAmount || 0,
        pincode: data.pincode ?? null,
        isLoading: false, 
        error: null, 
        hasLoaded: true 
      });
    } catch (err: any) {
      set({ error: err, isLoading: false, hasLoaded: true });
    }
  },

  addToCart: async ({ productId, variantId, quantity }) => {
    set({ isAddingToCart: true });
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId, quantity }),
      });
      if (res.status === 401) throw new Error("UNAUTHORIZED");
      if (!res.ok) throw new Error("Failed to add to cart");
      
      // Re-fetch to sync with backend
      await get().fetchCart();
      set({ isAddingToCart: false });
    } catch (err: any) {
      set({ isAddingToCart: false });
      throw err;
    }
  },

  updateQuantity: async ({ cartItemId, quantity }) => {
    set({ isUpdatingQuantity: true });
    
    // Optimistic local update for instant UI feedback
    const originalItems = get().cartItems;
    set({
      cartItems: originalItems.map(item => 
        item.id === cartItemId ? { ...item, quantity } : item
      )
    });

    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      if (!res.ok) throw new Error("Failed to update cart quantity");
      
      await get().fetchCart();
      set({ isUpdatingQuantity: false });
    } catch (err: any) {
      // Rollback on error
      set({ cartItems: originalItems, isUpdatingQuantity: false });
      throw err;
    }
  },

  removeFromCart: async (cartItemId) => {
    set({ isRemovingFromCart: true });
    
    // Optimistic local removal
    const originalItems = get().cartItems;
    set({
      cartItems: originalItems.filter(item => item.id !== cartItemId)
    });

    try {
      const res = await fetch(`/api/cart?id=${cartItemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove item from cart");
      
      await get().fetchCart();
      set({ isRemovingFromCart: false });
    } catch (err: any) {
      // Rollback on error
      set({ cartItems: originalItems, isRemovingFromCart: false });
      throw err;
    }
  },
}));

export function useCart() {
  const cartItems = useCartStore((state) => state.cartItems);
  const subTotal = useCartStore((state) => state.subTotal);
  const discountTotal = useCartStore((state) => state.discountTotal);
  const shippingTotal = useCartStore((state) => state.shippingTotal);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const pincode = useCartStore((state) => state.pincode);
  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);
  const hasLoaded = useCartStore((state) => state.hasLoaded);
  const isAddingToCart = useCartStore((state) => state.isAddingToCart);
  const isUpdatingQuantity = useCartStore((state) => state.isUpdatingQuantity);
  const isRemovingFromCart = useCartStore((state) => state.isRemovingFromCart);

  const fetchCart = useCartStore((state) => state.fetchCart);
  const addToCart = useCartStore((state) => state.addToCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const cartCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return {
    cartItems,
    subTotal,
    discountTotal,
    shippingTotal,
    totalAmount,
    pincode,
    isLoading: isLoading && !hasLoaded,
    error,
    cartCount,
    addToCart,
    isAddingToCart,
    updateQuantity,
    isUpdatingQuantity,
    removeFromCart,
    isRemovingFromCart,
  };
}
