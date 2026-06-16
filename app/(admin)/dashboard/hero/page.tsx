import { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { HeroTable } from "./hero-table";

export const metadata: Metadata = {
  title: "Manage Hero Carousel",
};

export default async function HeroAdminPage() {
  const banners = await prisma.heroBanner.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Hero Carousel</h2>
      </div>
      
      <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-amber-800 mb-1">Recommendation</h5>
          <p className="text-sm">
            For optimal display quality, ensure <strong>Desktop Backgrounds</strong> are <strong>1920x1080 (16:9)</strong> and <strong>Mobile Backgrounds</strong> are <strong>1080x960</strong>.
            For <strong>Foreground Images</strong>, use a transparent PNG format.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <HeroTable initialBanners={banners} />
      </div>
    </div>
  );
}
