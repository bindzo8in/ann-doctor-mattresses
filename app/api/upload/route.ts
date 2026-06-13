import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import { env } from "@/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!userHasPermission(session?.user, "products.create") && !userHasPermission(session?.user, "products.update")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "File is required" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "products",
          },
          (error, result) => {
            if (error) return reject(error);

            if (!result) {
              return reject(new Error("Upload failed"));
            }

            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          },
        )
        .end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!userHasPermission(session?.user, "products.delete") && !userHasPermission(session?.user, "products.update")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    const publicIds: string[] = body.publicIds
      ? body.publicIds
      : body.publicId
        ? [body.publicId]
        : [];

    if (!publicIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one publicId is required",
        },
        { status: 400 },
      );
    }

    // Single delete
    if (publicIds.length === 1) {
      const result = await cloudinary.uploader.destroy(publicIds[0], {
        invalidate: true,
      });

      if (result.result !== "ok") {
        return NextResponse.json(
          {
            success: false,
            message: "Failed to delete image",
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        success: true,
        deleted: publicIds,
      });
    }

    // Multiple delete
    const result = await cloudinary.api.delete_resources(publicIds, {
      invalidate: true,
    });

    return NextResponse.json({
      success: true,
      deleted: Object.keys(result.deleted ?? {}),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
