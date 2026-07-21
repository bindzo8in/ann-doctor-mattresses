import { UseFormReturn } from "react-hook-form";
import { CreateProductInput } from "@/lib/schema/product-form-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getColorByValue } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface PreviewStepProps {
  form: UseFormReturn<CreateProductInput>;
}

export function PreviewStep({ form }: PreviewStepProps) {
  const values = form.getValues();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="font-semibold block">Name</span>
              <span className="text-muted-foreground">{values.name || "N/A"}</span>
            </div>
            <div>
              <span className="font-semibold block">Slug</span>
              <span className="text-muted-foreground">{values.slug || "N/A"}</span>
            </div>
            <div>
              <span className="font-semibold block">Type</span>
              <span className="text-muted-foreground">{values.type || "N/A"}</span>
            </div>
            <div>
              <span className="font-semibold block">Status</span>
              <div className="flex gap-2 mt-1">
                <Badge variant={values.isActive ? "default" : "secondary"}>
                  {values.isActive ? "Active" : "Inactive"}
                </Badge>
                {values.isFeatured && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
            {values.availableColors && values.availableColors.length > 0 && (
              <div>
                <span className="font-semibold block mb-1">Available Colors</span>
                <div className="flex flex-wrap gap-2">
                  {values.availableColors.map((colorVal) => {
                    const colorObj = getColorByValue(colorVal);
                    const isDefault = (values.defaultColor || values.availableColors?.[0]) === colorVal;
                    return (
                      <span
                        key={colorVal}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                          isDefault ? "bg-slate-900 text-white border-slate-900 font-semibold" : "bg-slate-50 text-slate-700 border-slate-200"
                        )}
                      >
                        <span className={cn("w-3 h-3 rounded-full border border-slate-300 shrink-0", colorObj.tailwindClass)} />
                        <span>{colorObj.label}</span>
                        {isDefault && <span className="text-[10px] bg-primary text-white px-1 rounded">Default</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-semibold">Variants Count</span>
              <Badge variant="secondary">{values.variants?.length || 0}</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-semibold">Images Count</span>
              <Badge variant="secondary">{values.images?.length || 0}</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-semibold">Specifications</span>
              <Badge variant="secondary">{values.specifications?.length || 0}</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-semibold">FAQs</span>
              <Badge variant="secondary">{values.faqs?.length || 0}</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold">Sections</span>
              <Badge variant="secondary">{values.sections?.length || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex flex-col md:flex-row md:items-center justify-between">
        <span>Please review the product details before submitting. You can go back to previous steps if you need to make changes.</span>
      </div>
    </div>
  );
}
