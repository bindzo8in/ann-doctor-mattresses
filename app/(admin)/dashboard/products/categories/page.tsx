"use client";

import { useState, useEffect } from "react";
import { Loader2, PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import { ImageUpload, UploadedImage } from "@/components/ui/image-upload";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";

type Category = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  thumbnailPublicId: string | null;
  description?: string | null;
  features?: any;
  layerImageUrl?: string | null;
  layerImagePublicId?: string | null;
  layerVideoUrl?: string | null;
  layerVideoPublicId?: string | null;
  coverImageUrl?: string | null;
  coverImagePublicId?: string | null;
  productCount?: number;
};

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().nullable().optional(),
  features: z.array(z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
  })).optional(),
  layerImageUrl: z.string().nullable().optional(),
  layerImagePublicId: z.string().nullable().optional(),
  layerVideoUrl: z.string().nullable().optional(),
  layerVideoPublicId: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  coverImagePublicId: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  thumbnailPublicId: z.string().nullable().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: null,
      features: [],
      layerImageUrl: null,
      layerImagePublicId: null,
      layerVideoUrl: null,
      layerVideoPublicId: null,
      coverImageUrl: null,
      coverImagePublicId: null,
      thumbnailUrl: null,
      thumbnailPublicId: null,
    },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: "features" as never // typescript workaround for optional array
  });

  const isEditing = !!form.watch("id");

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      form.reset({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        features: Array.isArray(category.features) ? category.features : [],
        layerImageUrl: category.layerImageUrl,
        layerImagePublicId: category.layerImagePublicId,
        layerVideoPublicId: category.layerVideoPublicId,
        layerVideoUrl: category.layerVideoUrl,
        coverImageUrl: category.coverImageUrl,
        coverImagePublicId: category.coverImagePublicId,
        thumbnailUrl: category.thumbnailUrl,
        thumbnailPublicId: category.thumbnailPublicId,
      });
    } else {
      form.reset({
        id: undefined,
        name: "",
        slug: "",
        description: null,
        features: [],
        layerImageUrl: null,
        layerImagePublicId: null,
        coverImageUrl: null,
        coverImagePublicId: null,
        thumbnailUrl: null,
        thumbnailPublicId: null,
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setIsSaving(true);
      const dataToSave = {
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        features: values.features || [],
        layerImageUrl: values.layerImageUrl || null,
        layerImagePublicId: values.layerImagePublicId || null,
        layerVideoUrl: values.layerVideoUrl || null,
        layerVideoPublicId: values.layerVideoPublicId || null,
        coverImageUrl: values.coverImageUrl || null,
        coverImagePublicId: values.coverImagePublicId || null,
        thumbnailUrl: values.thumbnailUrl || null,
        thumbnailPublicId: values.thumbnailPublicId || null,
      };

      if (values.id) {
        await updateCategory(values.id, dataToSave);
        toast.success("Category updated");
      } else {
        await createCategory(dataToSave);
        toast.success("Category created");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, count: number) => {
    if (count > 0) {
      toast.error(`Cannot delete category because it has ${count} products.`);
      return;
    }

    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Categories</h1>
        <p className="text-slate-500 mt-1">Manage product categories and taxonomy.</p>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">All Categories</h2>
            <p className="text-sm text-slate-500 mt-1">Add or edit categories.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <PlusIcon className="w-4 h-4" /> Add Category
          </Button>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Image</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.thumbnailUrl ? (
                      <div className="relative w-12 h-12 rounded overflow-hidden border">
                        <Image src={category.thumbnailUrl} alt={category.name} fill className="object-cover" sizes="48px" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded border bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                        None
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-slate-600 font-mono text-sm">{category.slug}</TableCell>
                  <TableCell className="text-slate-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {category.productCount || 0} products
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="Preview category"
                      >
                        <Link href={`/categories/${category.slug}`} target="_blank" rel="noopener noreferrer">
                          <EyeIcon className="w-4 h-4 text-slate-600 hover:text-slate-900" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(category)} title="Edit category">
                        <PencilIcon className="w-4 h-4 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id, category.productCount || 0)}
                        disabled={(category.productCount || 0) > 0}
                        title={(category.productCount || 0) > 0 ? "Cannot delete category with products" : "Delete category"}
                      >
                        <TrashIcon className={`w-4 h-4 ${((category.productCount || 0) > 0) ? 'text-slate-300' : 'text-red-500'}`} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Category Name</FieldLabel>
                    <Input
                      placeholder="e.g., Spring Mattresses"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (!isEditing) {
                          form.setValue(
                            "slug",
                            e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                            { shouldValidate: true }
                          );
                        }
                      }}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="slug"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Slug</FieldLabel>
                    <Input placeholder="e.g., spring-mattresses" {...field} />
                    <FieldDescription>Unique identifier used in URLs.</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea placeholder="Category description..." {...field} value={field.value || ""} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FieldLabel className="mb-0">Features</FieldLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => appendFeature({ title: "", description: "" })}>
                  <PlusIcon className="w-4 h-4 mr-1" /> Add Feature
                </Button>
              </div>
              {featureFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md relative space-y-4 bg-slate-50/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    onClick={() => removeFeature(index)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                  <Controller
                    control={form.control}
                    name={`features.${index}.title` as const}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Title</FieldLabel>
                        <Input placeholder="e.g., Quilted Cotton Cover" {...field} />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={`features.${index}.description` as const}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Description</FieldLabel>
                        <Input placeholder="e.g., Soft and breathable for a smooth surface." {...field} />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                control={form.control}
                name="thumbnailUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Thumbnail</FieldLabel>
                    <ImageUpload
                      value={
                        field.value
                          ? { url: field.value, publicId: form.getValues("thumbnailPublicId") || "thumbnail" }
                          : null
                      }
                      onChange={(value) => {
                        const uploaded = value as UploadedImage | null;
                        field.onChange(uploaded?.url || null);
                        form.setValue("thumbnailPublicId", uploaded?.publicId || null, { shouldValidate: true });
                      }}
                      maxFiles={1}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="coverImageUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Cover Image</FieldLabel>
                    <ImageUpload
                      value={
                        field.value
                          ? { url: field.value, publicId: form.getValues("coverImagePublicId") || "cover-image" }
                          : null
                      }
                      onChange={(value) => {
                        const uploaded = value as UploadedImage | null;
                        field.onChange(uploaded?.url || null);
                        form.setValue("coverImagePublicId", uploaded?.publicId || null, { shouldValidate: true });
                      }}
                      maxFiles={1}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="layerImageUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Layer Image</FieldLabel>
                    <ImageUpload
                      value={
                        field.value
                          ? { url: field.value, publicId: form.getValues("layerImagePublicId") || "layer-image" }
                          : null
                      }
                      onChange={(value) => {
                        const uploaded = value as UploadedImage | null;
                        field.onChange(uploaded?.url || null);
                        form.setValue("layerImagePublicId", uploaded?.publicId || null, { shouldValidate: true });
                      }}
                      maxFiles={1}
                      accept="image/*,video/*"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="layerVideoUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Layer Video (Optional)</FieldLabel>
                    <ImageUpload
                      value={
                        field.value
                          ? { url: field.value, publicId: form.getValues("layerVideoPublicId") || "layer-video" }
                          : null
                      }
                      onChange={(value) => {
                        const uploaded = value as UploadedImage | null;
                        field.onChange(uploaded?.url || null);
                        form.setValue("layerVideoPublicId", uploaded?.publicId || null, { shouldValidate: true });
                      }}
                      maxFiles={1}
                      accept="video/*"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
