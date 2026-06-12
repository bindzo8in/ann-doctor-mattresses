import prisma from "@/lib/prisma";
import { measure } from "@/lib/utils/measure";

export const dynamic = "force-dynamic";

export default async function ProductBenchmarkPage() {
  const result = await measure("Benchmark: Fetch 50 Products", async () => {
    return prisma.product.findMany({
      take: 50,
      select: {
        id: true,
        name: true,
        type: true,
        images: { select: { id: true, url: true }, take: 1 },
        variants: {
          select: {
            id: true,
            salePrice: true,
            mattressVariant: { select: { sizeName: true } },
            sofaVariant: { select: { seatCount: true } }
          },
          take: 5
        }
      }
    });
  });

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Product Fetch Benchmark</h1>
      <p className="text-muted-foreground">Check server logs for exact timing of the `measure` call.</p>
      
      <div className="bg-slate-50 p-4 border rounded-md">
        <h2 className="font-semibold mb-2">Fetched {result.length} products:</h2>
        <pre className="text-xs overflow-auto max-h-[600px]">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
}
