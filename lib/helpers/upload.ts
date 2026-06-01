import { routes } from "../routes";

export interface UploadedImage {
  url: string;
  publicId: string;
}

async function uploadFile(file: File): Promise<UploadedImage> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(routes.api_upload, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();

    throw new Error(error || "Upload failed");
  }

  return response.json();
}

export async function uploadSingleImage(file: File): Promise<UploadedImage> {
  return uploadFile(file);
}

export async function uploadMultipleImages(
  files: File[],
): Promise<UploadedImage[]> {
  return Promise.all(files.map(uploadFile));
}

export async function deleteImage(publicId: string): Promise<void> {
  const response = await fetch(routes.api_upload, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      publicId,
    }),
  });

  if (!response.ok) {
    const result = await response.json();

    throw new Error(result.message || "Failed to delete image");
  }
}

export async function deleteImages(publicIds: string[]): Promise<void> {
  const response = await fetch(routes.api_upload, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      publicIds,
    }),
  });

  if (!response.ok) {
    const result = await response.json();

    throw new Error(result.message || "Failed to delete images");
  }
}
