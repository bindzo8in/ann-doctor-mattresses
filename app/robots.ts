import { MetadataRoute } from "next";
import { env } from "@/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL || "https://doctormattresses.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/api/",
          "/profile/",
          "/checkout/",
          "/auth-error",
          "/unauthorized",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
