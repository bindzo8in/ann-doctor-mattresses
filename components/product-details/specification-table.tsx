import { ProductSpecification } from "@/app/generated/prisma/browser";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface Props {
  specifications: ProductSpecification[];
}

export function SpecificationTable({ specifications }: Props) {
  if (!specifications?.length) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableBody>
          {specifications.map((spec, index) => (
            <TableRow key={spec.id} className={index % 2 === 0 ? "bg-muted/30" : "bg-background"}>
              <TableCell className="font-medium py-4 w-1/3">{spec.label}</TableCell>
              <TableCell className="py-4 text-muted-foreground">{spec.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
