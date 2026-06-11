import { create } from "zustand";
import { useEffect } from "react";

export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnailUrl: string;
    variants: Array<{
      id: string;
      mrp: string | number;
      salePrice: string | number;
      isDefault: boolean;
    }>;
  };
}

interface WishlistStore {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  isToggling: boolean;
  error: Error | null;
  hasLoaded: boolean;
  isAuthenticated: boolean;

  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<boolean>;
}

let wishlistFetchPromise: Promise<void> | null = null;

const useWishlistStore = create<WishlistStore>((set, get) => ({
  wishlistItems: [],
  isLoading: false,
  isToggling: false,
  error: null,
  hasLoaded: false,
  isAuthenticated: true, // Default to true until checked

  fetchWishlist: async () => {
    if (wishlistFetchPromise) {
      return wishlistFetchPromise;
    }

    wishlistFetchPromise = (async () => {
      set({ isLoading: !get().hasLoaded });
      try {
        const res = await fetch("/api/wishlist", { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 401) {
            set({ wishlistItems: [], isAuthenticated: false, isLoading: false, hasLoaded: true });
            return;
          }
          throw new Error("Failed to fetch wishlist");
        }
        const data = await res.json();
        set({ wishlistItems: data, isAuthenticated: true, isLoading: false, error: null, hasLoaded: true });
      } catch (err: any) {
        set({ error: err, isLoading: false, hasLoaded: true });
      } finally {
        wishlistFetchPromise = null;
      }
    })();

    return wishlistFetchPromise;
  },

  toggleWishlist: async (productId: string) => {
    set({ isToggling: true });
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        set({ isAuthenticated: false });
        throw new Error("UNAUTHORIZED");
      }
      if (!res.ok) throw new Error("Failed to toggle wishlist");

      const data = await res.json();
      // Re-fetch to sync state with backend
      await get().fetchWishlist();
      set({ isToggling: false });
      return data.wishlisted;
    } catch (err: any) {
      set({ isToggling: false });
      throw err;
    }
  },
}));

export function useWishlist() {
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const isLoading = useWishlistStore((state) => state.isLoading);
  const isToggling = useWishlistStore((state) => state.isToggling);
  const error = useWishlistStore((state) => state.error);
  const hasLoaded = useWishlistStore((state) => state.hasLoaded);
  const isAuthenticated = useWishlistStore((state) => state.isAuthenticated);

  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlistItems,
    isLoading: isLoading && !hasLoaded,
    isToggling,
    error,
    toggleWishlist,
    isAuthenticated,
    hasLoaded,
  };
}

