import { ProductDetails } from "@/types/product-details";
import { Badge } from "@/components/ui/badge";

interface Props {
  product: ProductDetails;
}

export function MattressRecommendationSection({ product }: Props) {
  const mattress = product.variants.find(v => v.mattressVariant)?.mattressVariant;
  
  if (!mattress) return null;

  const { recommendedPositions, recommendedAgeGroups, recommendedWeightGroups } = product;

  if (
    !recommendedPositions?.length &&
    !recommendedAgeGroups?.length &&
    !recommendedWeightGroups?.length
  ) {
    return null;
  }

  return (
    <div className="bg-muted/30 p-6 rounded-xl border border-border space-y-6">
      <h3 className="text-xl font-bold tracking-tight">Best Suited For</h3>
      
      <div className="space-y-4">
        {recommendedPositions?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Sleeping Positions
            </h4>
            <div className="flex flex-wrap gap-2">
              {recommendedPositions.map((pos: string) => (
                <Badge key={pos} variant="secondary" className="px-3 py-1 text-sm font-medium">
                  {pos}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {recommendedAgeGroups?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Age Groups
            </h4>
            <div className="flex flex-wrap gap-2">
              {recommendedAgeGroups.map((age: string) => (
                <Badge key={age} variant="secondary" className="px-3 py-1 text-sm font-medium">
                  {age}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {recommendedWeightGroups?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Weight Groups
            </h4>
            <div className="flex flex-wrap gap-2">
              {recommendedWeightGroups.map((weight: string) => (
                <Badge key={weight} variant="secondary" className="px-3 py-1 text-sm font-medium">
                  {weight}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
