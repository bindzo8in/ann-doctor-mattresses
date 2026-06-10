import { ReactNode } from "react";

interface DashboardContentProps {
  children: ReactNode;
}

export function DashboardContent({
  children,
}: DashboardContentProps) {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {children}
    </div>
  );
}