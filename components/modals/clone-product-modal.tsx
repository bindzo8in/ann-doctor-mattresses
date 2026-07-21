"use client";

import * as React from "react";
import slugify from "slugify";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryCombobox } from "@/components/forms/product/category-combobox";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    slug: string;
    categoryId?: string;
  };
}

export function CloneProductModal({ isOpen, onClose, product }: Props) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [isAutoSlug, setIsAutoSlug] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Initialize values when modal opens or product changes
  React.useEffect(() => {
    if (isOpen && product) {
      const initialName = `${product.name} (Copy)`;
      const initialSlug = slugify(`${product.slug}-copy`, { lower: true, strict: true });
      setName(initialName);
      setSlug(initialSlug);
      setCategoryId(product.categoryId || "");
      setIsAutoSlug(true);
      setErrorMsg(null);
    }
  }, [isOpen, product]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setErrorMsg(null);
    if (isAutoSlug) {
      setSlug(slugify(newName, { lower: true, strict: true }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAutoSlug(false);
    setErrorMsg(null);
    setSlug(slugify(e.target.value, { lower: true, strict: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/products/${product.id}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          categoryId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to clone product");
      }

      toast.success(`Product "${data.product.name}" cloned successfully!`);
      onClose();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Error cloning product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Copy className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Clone Product</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Duplicate "{product.name}" with a unique name and slug.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="clone-name" className="text-xs font-medium">
              New Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="clone-name"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Coir Mattress Premium (Copy)"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clone-slug" className="text-xs font-medium">
              New Product Slug (URL) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="clone-slug"
              value={slug}
              onChange={handleSlugChange}
              placeholder="e.g. coir-mattress-premium-copy"
              disabled={loading}
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Must be unique across all products.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Category</Label>
            <CategoryCombobox
              value={categoryId}
              onChange={(val) => setCategoryId(val)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim() || !slug.trim()}
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cloning...
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Clone Product
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
