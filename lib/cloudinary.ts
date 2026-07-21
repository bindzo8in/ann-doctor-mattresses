import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const CLOUDINARY_FOLDER_PREFIX = "ann-doctor-mattressess";

/**
 * Uploads a file to Cloudinary
 * @param file The file to upload (File or Buffer)
 * @param folder The sub-folder in Cloudinary (defaults to project name)
 */
export async function uploadImage(file: File | Buffer, folder: string = "general") {
  let buffer: Buffer;

  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    buffer = file;
  }

  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${CLOUDINARY_FOLDER_PREFIX}/${folder}`,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deletes an image from Cloudinary
 * @param urlOrId The URL or Public ID to delete
 */
export async function deleteImage(urlOrId: string) {
  if (!urlOrId || !urlOrId.includes("cloudinary")) return;

  try {
    // Extract public_id from URL if necessary
    // Example: https://res.cloudinary.com/cloudname/image/upload/v12345678/yash-organics/products/public_id.jpg
    let publicId = urlOrId;
    if (urlOrId.startsWith("http")) {
      const parts = urlOrId.split("/");
      const fileNameWithExtension = parts.pop();
      const folderParts = parts.slice(parts.indexOf(CLOUDINARY_FOLDER_PREFIX));
      const fileName = fileNameWithExtension?.split(".")[0];
      publicId = [...folderParts, fileName].join("/");
    }

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete Cloudinary image:", urlOrId, error);
  }
}

/**
 * Clones/duplicates an existing Cloudinary image by uploading from URL to a new public_id
 */
export async function cloneCloudinaryImage(url: string, folder: string = "products") {
  if (!url) return { url: "", publicId: "" };
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: `${CLOUDINARY_FOLDER_PREFIX}/${folder}`,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Failed to clone Cloudinary image, using original as fallback:", error);
    return { url, publicId: "" };
  }
}

