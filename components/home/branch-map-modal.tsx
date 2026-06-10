"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BranchMapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  address?: string;
  googleMapUrl?: string;
  mapUrl?: string;
}

export function BranchMapModal({
  open,
  onOpenChange,
  title,
  address,
  googleMapUrl,
  mapUrl,
}: BranchMapModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {googleMapUrl ? (
            <iframe
              src={googleMapUrl}
              width="100%"
              height="500"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="border-0"
            />
          ) : (
            <div className="flex h-[500px] items-center justify-center text-muted-foreground">
              Map not available
            </div>
          )}

          <div className="border-t p-4">
            <p className="mb-4 text-sm text-muted-foreground">
              {address}
            </p>

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Get Directions
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}