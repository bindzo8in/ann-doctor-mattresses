"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";

import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { CloudUpload, Loader2, Trash2, Images } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  uploadMultipleImages,
  type UploadedImage,
  deleteImage,
  deleteImages,
} from "@/lib/helpers/upload";

export interface ProductImage extends UploadedImage {
  sortOrder: number;
}

interface SortableImageUploadProps {
  value?: ProductImage[];

  onChange: (value: ProductImage[]) => void;

  maxFiles?: number;

  disabled?: boolean;

  placeholder?: string;
}

interface SortableCardProps {
  image: ProductImage;

  onDelete: (image: ProductImage) => void;
}

function SortableCard({ image, onDelete }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: image.publicId,
    });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="
        relative
        overflow-hidden
        rounded-lg
        border
        cursor-move
      "
    >
      <div {...attributes} {...listeners}>
        <Image
          src={image.url}
          alt=""
          width={400}
          height={400}
          className="
            aspect-square
            w-full
            object-cover
          "
        />
      </div>

      <div
        className="
          absolute
          left-2
          top-2
          rounded-md
          bg-background/80
          px-2
          py-1
          text-xs
          font-medium
        "
      >
        #{image.sortOrder + 1}
      </div>

      <Button
        type="button"
        size="icon"
        variant="destructive"
        className="
          absolute
          right-2
          top-2
        "
        onClick={() => onDelete(image)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function SortableImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  disabled,
  placeholder,
}: SortableImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const reachedLimit = value.length >= maxFiles;

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) return;

    try {
      setUploading(true);

      const remainingSlots = maxFiles - value.length;

      const filesToUpload = files.slice(0, remainingSlots);

      if (filesToUpload.length === 0) {
        return;
      }

      const uploaded = await uploadMultipleImages(filesToUpload);

      const newImages = uploaded.map((image, index) => ({
        ...image,
        sortOrder: value.length + index,
      }));

      onChange([...value, ...newImages]);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleDelete(image: ProductImage) {
    try {
      setDeleting(true);

      await deleteImage(image.publicId);

      const updated = value
        .filter((item) => item.publicId !== image.publicId)
        .map((item, index) => ({
          ...item,
          sortOrder: index,
        }));

      onChange(updated);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteAll() {
    if (!value.length) return;

    try {
      setDeleting(true);

      await deleteImages(value.map((image) => image.publicId));

      onChange([]);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = value.findIndex((image) => image.publicId === active.id);

    const newIndex = value.findIndex((image) => image.publicId === over.id);

    const reordered = arrayMove(value, oldIndex, newIndex).map(
      (image, index) => ({
        ...image,
        sortOrder: index,
      }),
    );

    onChange(reordered);
  }

  return (
    <div className="space-y-4">
      {!reachedLimit && (
        <label
          className="
            border-input
            hover:bg-accent/50
            flex
            min-h-32
            cursor-pointer
            flex-col
            items-center
            justify-center
            rounded-lg
            border
            border-dashed
            p-4
            transition-colors
          "
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            disabled={disabled || uploading || deleting}
            className="hidden"
            onChange={handleUpload}
          />

          {uploading ? (
            <>
              <Loader2 className="size-5 animate-spin" />

              <p className="mt-2 text-sm">Uploading...</p>
            </>
          ) : (
            <>
              <CloudUpload className="size-6" />

              <p className="mt-2 text-sm font-medium">
                {placeholder ?? "Upload gallery images"}
              </p>

              <p className="text-muted-foreground text-xs">
                {value.length}/{maxFiles} uploaded
              </p>
            </>
          )}
        </label>
      )}

      {value.filter((img) => img && img.url).length > 0 && (
        <>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={value.map((image) => image.publicId)}
              strategy={rectSortingStrategy}
            >
              <div
                className="
                  grid
                  grid-cols-2
                  gap-4
                  md:grid-cols-4
                "
              >
                {value
                  .filter((image) => image && image.url)
                  .map((image) => (
                  <SortableCard
                    key={image.publicId}
                    image={image}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {value.filter((img) => img && img.url).length > 1 && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={handleDeleteAll}
              >
                {deleting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Images className="mr-2 size-4" />
                )}
                Remove All
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
