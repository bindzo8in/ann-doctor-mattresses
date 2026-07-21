"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash, Maximize2, Copy, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ProductImageModal } from "@/components/modals/product-image-modal";
import { CloneProductModal } from "@/components/modals/clone-product-modal";

export type ProductColumn = {
  id: string;
  name: string;
  slug: string;
  type: string;
  category: { name: string };
  thumbnailUrl: string;
  images?: { id?: string; url: string; sortOrder?: number }[];
  baseSalePricePerSqFtPerInch?: number | null;
  baseMrpPerSqFtPerInch?: number | null;
  isActive: boolean;
  isFeatured: boolean;
};

function ImageCell({ row }: { row: any }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const url = row.getValue("thumbnailUrl") as string;
  const productName = row.getValue("name") as string;
  const images = row.original.images || [];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="h-12 w-12 relative rounded-md overflow-hidden bg-gray-100 group border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
        title="Click to view full image gallery"
      >
        <Image
          src={url}
          alt={productName}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-110"
          sizes="48px"
        />
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Maximize2 className="h-4 w-4 text-white drop-shadow-md" />
        </div>
      </button>

      <ProductImageModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productName={productName}
        images={images}
        fallbackThumbnail={url}
      />
    </>
  );
}

function ActionCell({ product }: { product: ProductColumn }) {
  const router = useRouter();
  const [cloneOpen, setCloneOpen] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      toast.success("Product deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Error deleting product");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/products/${product.id}/edit`} scroll>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCloneOpen(true)}>
            <Copy className="mr-2 h-4 w-4" />
            Clone
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CloneProductModal
        isOpen={cloneOpen}
        onClose={() => setCloneOpen(false)}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: (product as any).categoryId || (product.category as any)?.id || "",
        }}
      />
    </>
  );
}

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "thumbnailUrl",
    header: "Image",
    cell: ({ row }) => <ImageCell row={row} />,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => {
      const slug = row.getValue("slug") as string;
      return <span className="text-xs text-muted-foreground font-mono">{slug}</span>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return <Badge variant="outline">{type}</Badge>;
    },
  },
  {
    accessorFn: (row) => row.category?.name,
    id: "category",
    header: "Category",
    filterFn: (row, id, filterValue) => {
      if (!filterValue) return true;
      const catName = row.original.category?.name || "";
      const catId = (row.original as any).categoryId || (row.original.category as any)?.id || "";
      return catId === filterValue || catName.toLowerCase() === filterValue.toLowerCase();
    },
  },
  {
    id: "baseRate",
    header: "Rate (per Sq.Ft/Inch)",
    cell: ({ row }) => {
      const saleRate = row.original.baseSalePricePerSqFtPerInch;
      const mrpRate = row.original.baseMrpPerSqFtPerInch;

      if (saleRate === null || saleRate === undefined) {
        return <span className="text-xs text-slate-400">-</span>;
      }

      return (
        <div className="flex flex-col text-xs leading-tight">
          <span className="font-semibold text-emerald-600">
            ₹{saleRate} <span className="text-[10px] text-slate-400 font-normal">/ sqft/inch</span>
          </span>
          {mrpRate !== null && mrpRate !== undefined && mrpRate > (saleRate || 0) && (
            <span className="text-[11px] text-slate-400 line-through">
              ₹{mrpRate}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Draft"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell product={row.original} />,
  },
];
