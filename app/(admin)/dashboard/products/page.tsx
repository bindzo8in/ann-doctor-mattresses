import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export const metadata: Metadata = {
  title: "Products",
  description: "Manage products",
};

async function getProducts() {
  
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
    },
  });

  return products;
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/products/create" scroll>
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Link>
          </Button>
        </div>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <DataTable data={products} columns={columns} />
      </div>
    </div>
  );
}
