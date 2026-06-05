import { UseFormReturn } from "react-hook-form";
import { CreateProductInput } from "@/lib/schema/product-form-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
