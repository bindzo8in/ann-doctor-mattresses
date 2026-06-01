"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  CloudUpload,
  Loader2,
  Trash2,
  Images,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  uploadSingleImage,
  uploadMultipleImages,
} from "@/lib/helpers/upload";

import {
  deleteImage,
  deleteImages,
} from "@/lib/helpers/upload";

export interface UploadedImage {
  url: string;
  publicId: string;
}

interface ImageUploadProps {
  value?: UploadedImage | UploadedImage[] | null;

  onChange: (
    value: UploadedImage | UploadedImage[] | null,
  ) => void;

  multiple?: boolean;

  maxFiles?: number;

  accept?: string;

  disabled?: boolean;

  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  maxFiles = 1,
  accept = "image/*",
  disabled,
  placeholder,
}: ImageUploadProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [uploading, setUploading] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const images = Array.isArray(value)
    ? value
    : value
      ? [value]
      : [];

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(
      event.target.files ?? [],
    );

    if (!files.length) return;

    try {
      setUploading(true);

      if (!multiple) {
        const uploaded =
          await uploadSingleImage(files[0]);

        if (
          value &&
          !Array.isArray(value)
        ) {
          await deleteImage(
            value.publicId,
          );
        }

        onChange(uploaded);
      } else {
        const remainingSlots =
          maxFiles - images.length;

        const filesToUpload =
          files.slice(
            0,
            remainingSlots,
          );

        if (
          !filesToUpload.length
        ) {
          return;
        }

        const uploaded =
          await uploadMultipleImages(
            filesToUpload,
          );

        onChange([
          ...images,
          ...uploaded,
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value =
          "";
      }
    }
  }

  async function handleRemove(
    image: UploadedImage,
  ) {
    try {
      setDeleting(true);

      await deleteImage(
        image.publicId,
      );

      if (!multiple) {
        onChange(null);
        return;
      }

      onChange(
        images.filter(
          (item) =>
            item.publicId !==
            image.publicId,
        ),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  async function handleRemoveAll() {
    if (!images.length) return;

    try {
      setDeleting(true);

      await deleteImages(
        images.map(
          (image) =>
            image.publicId,
        ),
      );

      onChange(
        multiple ? [] : null,
      );
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  const reachedLimit =
    multiple &&
    images.length >= maxFiles;

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
            accept={accept}
            multiple={multiple}
            disabled={
              disabled ||
              uploading ||
              deleting
            }
            className="hidden"
            onChange={
              handleUpload
            }
          />

          {uploading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              <p className="mt-2 text-sm">
                Uploading...
              </p>
            </>
          ) : (
            <>
              <CloudUpload className="size-6" />

              <p className="mt-2 text-sm font-medium">
                {placeholder ??
                  "Click to upload"}
              </p>

              {multiple && (
                <p className="text-muted-foreground text-xs">
                  {images.length}/
                  {maxFiles} uploaded
                </p>
              )}
            </>
          )}
        </label>
      )}

      {images.length > 0 && (
        <>
          <div
            className="
              grid
              grid-cols-2
              gap-4
              md:grid-cols-4
            "
          >
            {images.map(
              (image) => (
                <div
                  key={
                    image.publicId
                  }
                  className="
                    relative
                    overflow-hidden
                    rounded-lg
                    border
                  "
                >
                  <Image
                    src={image.url}
                    alt="Uploaded image"
                    width={300}
                    height={300}
                    className="
                      aspect-square
                      w-full
                      object-cover
                    "
                  />

                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    disabled={
                      deleting
                    }
                    className="
                      absolute
                      right-2
                      top-2
                    "
                    onClick={() =>
                      handleRemove(
                        image,
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ),
            )}
          </div>

          {multiple &&
            images.length >
              1 && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    deleting
                  }
                  onClick={
                    handleRemoveAll
                  }
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