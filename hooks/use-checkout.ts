import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CheckoutSource } from "@/app/generated/prisma/enums";

export interface BuyNowItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  isCustom: boolean;
  customData?: any;
  color?: string;
  product: {
    name: string;
    thumbnailUrl: string;
  };
  variant: {
    id: string;
    salePrice: number;
    mrp: number;
  } | null;
}

interface CheckoutStore {
  source: CheckoutSource;
  buyNowItem: BuyNowItem | null;
  setCheckoutSession: (source: CheckoutSource, buyNowItem?: BuyNowItem | null) => void;
  clearCheckoutSession: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      source: CheckoutSource.CART,
      buyNowItem: null,
      setCheckoutSession: (source, buyNowItem = null) => {
        set({ source, buyNowItem });
      },
      clearCheckoutSession: () => {
        set({ source: CheckoutSource.CART, buyNowItem: null });
      },
    }),
    {
      name: "ann-doctor-checkout-session",
    }
  )
);
