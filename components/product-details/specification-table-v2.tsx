import { ProductSpecification } from "@/app/generated/prisma/browser";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface Props {
  specifications: ProductSpecification[];
}

export function SpecificationTableV2({ specifications }: Props) {
  if (!specifications?.length) return null;

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-[#E53935] mb-4 text-center bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] py-2 rounded-t-xl border border-b-0 border-slate-100 max-w-max mx-auto px-10 relative top-2">
        Product Description:
      </h2>
      <div className="bg-[#E53935] text-white rounded-xl shadow-lg border-2 border-white overflow-hidden p-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {specifications.map((spec, index) => (
            <div key={spec.id} className="flex flex-col gap-1 border-b border-red-400 pb-3">
              <span className="text-xs text-red-100 font-medium uppercase tracking-wider">{spec.label}</span>
              <span className="text-sm font-semibold">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
