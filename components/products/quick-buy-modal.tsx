"use client";

import { useState } from "react";
import { ProductDetails, ProductVariantWithDetails } from "@/types/product-details";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, Loader2 } from "lucide-react";
import { MattressVariantSelector } from "@/components/product-details/variants/mattress-variant-selector";
import { SofaVariantSelector } from "@/components/product-details/variants/sofa-variant-selector";
import { CustomSizeSelector } from "@/components/product-details/variants/custom-size-selector";
import { useCart } from "@/hooks/use-cart";
import { useCheckoutStore } from "@/hooks/use-checkout";
import { CheckoutSource } from "@/app/generated/prisma/enums";
import { formatPrice } from "@/lib/price";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { routes } from "@/lib/routes";
import { useMediaQuery } from "@/hooks/use-media-query";
import Image from "next/image";

interface Props {
  product: ProductDetails;
  trigger: React.ReactNode;
}

export function QuickBuyModal({ product, trigger }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantWithDetails>(
    product.variants.find((v) => v.isDefault) || product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customData, setCustomData] = useState<{
    width: number;
    length: number;
    thickness: number;
    calculatedPrice: number;
    isValid: boolean;
  } | null>(null);

  const { addToCart, isAddingToCart } = useCart();
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const handleAddToCart = async () => {
    if (isCustomMode && (!customData || !customData.isValid)) {
      toast.error("Please enter valid custom dimensions.");
      return;
    }
    await addToCart({
      productId: product.id,
      variantId: isCustomMode ? null : selectedVariant?.id || null,
      quantity,
      isCustom: isCustomMode,
      customData: isCustomMode ? customData : undefined
    } as any);
    setIsOpen(false);
  };

  const handleBuyNow = () => {
    if (status === "unauthenticated") {
      toast.error("Please login to proceed to checkout");
      router.push(`${routes.login}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (isCustomMode && (!customData || !customData.isValid)) {
      toast.error("Please enter valid custom dimensions.");
      return;
    }
    setIsBuyingNow(true);
    const checkoutStore = useCheckoutStore.getState();
    checkoutStore.setCheckoutSession(CheckoutSource.BUY_NOW, {
      productId: product.id,
      variantId: isCustomMode ? null : selectedVariant?.id || null,
      quantity,
      isCustom: isCustomMode,
      customData: isCustomMode ? customData : undefined,
      product: { name: product.name, thumbnailUrl: product.thumbnailUrl },
      variant: selectedVariant ? { id: selectedVariant.id, salePrice: Number(selectedVariant.salePrice), mrp: Number(selectedVariant.mrp) } : null,
    } as any);
    router.push(routes.checkout);
  };

  const price = isCustomMode
    ? customData?.calculatedPrice || 0
    : Number(selectedVariant?.salePrice || 0);

  const content = (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 border-b flex items-center gap-4 bg-slate-50">
        <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-white border shrink-0">
          <Image src={product.thumbnailUrl || "/products/mattress.webp"} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>
          <p className="text-[#E53935] font-bold">₹{formatPrice(price)}</p>
        </div>
      </div>
      
      <div className="p-6 space-y-6 flex-1">
        {product.type === "MATTRESS" ? (
          <>
            <MattressVariantSelector
              product={product}
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
              quantity={quantity}
              setQuantity={setQuantity}
              isCustomMode={isCustomMode}
              setIsCustomMode={setIsCustomMode}
              setCustomData={setCustomData}
              customData={customData}
            />
          </>
        ) : (
          <SofaVariantSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            onSelect={setSelectedVariant}
          />
        )}
      </div>

      <div className="p-6 border-t bg-white flex gap-3 mt-auto">
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isAddingToCart || isBuyingNow || (isCustomMode && !customData?.isValid)}
        >
          {isAddingToCart ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShoppingCart className="w-5 h-5 mr-2" />}
          Add to Cart
        </Button>
        <Button
          size="lg"
          className="flex-1 bg-[#E53935] hover:bg-red-700"
          onClick={handleBuyNow}
          disabled={isAddingToCart || isBuyingNow || (isCustomMode && !customData?.isValid)}
        >
          {isBuyingNow ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
          Buy Now
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 rounded-2xl h-[80vh] flex flex-col">
          <DialogTitle className="sr-only">Quick Buy: {product.name}</DialogTitle>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="h-[85vh]">
        <DrawerTitle className="sr-only">Quick Buy: {product.name}</DrawerTitle>
        {content}
      </DrawerContent>
    </Drawer>
  );
}
