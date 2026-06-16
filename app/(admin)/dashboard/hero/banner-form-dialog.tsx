"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload, UploadedImage } from "@/components/ui/image-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createHeroBanner, updateHeroBanner } from "@/actions/hero-banner";
import { Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

type BannerFormData = {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  type: "DYNAMIC" | "STATIC";
};

export function BannerFormDialog({
  isOpen,
  setIsOpen,
  initialData,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  initialData?: any;
}) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bgImage, setBgImage] = useState<UploadedImage | null>(
    initialData?.backgroundImageUrl
      ? { url: initialData.backgroundImageUrl, publicId: initialData.backgroundPublicId }
      : null
  );
  const [mobileBgImage, setMobileBgImage] = useState<UploadedImage | null>(
    initialData?.mobileBackgroundImageUrl
      ? { url: initialData.mobileBackgroundImageUrl, publicId: initialData.mobileBackgroundPublicId }
      : null
  );
  const [fgImage, setFgImage] = useState<UploadedImage | null>(
    initialData?.foregroundImageUrl
      ? { url: initialData.foregroundImageUrl, publicId: initialData.foregroundPublicId }
      : null
  );

  const { register, handleSubmit, reset, control } = useForm<BannerFormData>({
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      buttonText: initialData?.buttonText || "",
      buttonLink: initialData?.buttonLink || "",
      type: initialData?.type || "DYNAMIC",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: initialData?.title || "",
        subtitle: initialData?.subtitle || "",
        buttonText: initialData?.buttonText || "",
        buttonLink: initialData?.buttonLink || "",
        type: initialData?.type || "DYNAMIC",
      });
      setBgImage(
        initialData?.backgroundImageUrl
          ? { url: initialData.backgroundImageUrl, publicId: initialData.backgroundPublicId }
          : null
      );
      setMobileBgImage(
        initialData?.mobileBackgroundImageUrl
          ? { url: initialData.mobileBackgroundImageUrl, publicId: initialData.mobileBackgroundPublicId }
          : null
      );
      setFgImage(
        initialData?.foregroundImageUrl
          ? { url: initialData.foregroundImageUrl, publicId: initialData.foregroundPublicId }
          : null
      );
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: BannerFormData) => {
    if (!bgImage) {
      toast.error("Background image is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        backgroundImageUrl: bgImage.url,
        backgroundPublicId: bgImage.publicId,
        mobileBackgroundImageUrl: mobileBgImage?.url,
        mobileBackgroundPublicId: mobileBgImage?.publicId,
        foregroundImageUrl: fgImage?.url,
        foregroundPublicId: fgImage?.publicId,
      };

      let res;
      if (initialData?.id) {
        res = await updateHeroBanner(initialData.id, payload);
      } else {
        res = await createHeroBanner(payload);
      }

      if (res.success) {
        toast.success(initialData?.id ? "Banner updated" : "Banner created");
        queryClient.invalidateQueries({ queryKey: ["adminHeroBanners"] });
        setIsOpen(false);
        reset();
        setBgImage(null);
        setMobileBgImage(null);
        setFgImage(null);
      } else {
        toast.error("Failed to save banner");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Banner" : "Create New Banner"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DYNAMIC">Dynamic</SelectItem>
                      <SelectItem value="STATIC">Static</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Main Title *</Label>
              <Input {...register("title", { required: true })} placeholder="e.g., Spring Mega Sale!" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Subtitle</Label>
              <Input {...register("subtitle")} placeholder="e.g., Up to 50% off on all orthopedic mattresses" />
            </div>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input {...register("buttonText")} placeholder="e.g., Shop Now" />
            </div>
            <div className="space-y-2">
              <Label>Button Link</Label>
              <Input {...register("buttonLink")} placeholder="e.g., /products" />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Desktop Background * (1920x1080)</Label>
                <ImageUpload
                  value={bgImage}
                  onChange={(val) => setBgImage(val as UploadedImage | null)}
                  maxFiles={1}
                  placeholder="Upload Landscape Image"
                />
              </div>
              <div>
                <Label className="mb-2 block">Mobile Background (Optional, 1080x1920)</Label>
                <ImageUpload
                  value={mobileBgImage}
                  onChange={(val) => setMobileBgImage(val as UploadedImage | null)}
                  maxFiles={1}
                  placeholder="Upload Portrait Image"
                />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Foreground PNG Image (Optional, transparent background recommended)</Label>
              <ImageUpload
                value={fgImage}
                onChange={(val) => setFgImage(val as UploadedImage | null)}
                maxFiles={1}
                placeholder="Upload Product PNG"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Banner
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
