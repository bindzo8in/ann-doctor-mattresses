import { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserRole } from "@/app/generated/prisma/enums";

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
 const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role !== UserRole.SUPER_ADMIN && session.user.role !== UserRole.BRANCH_ADMIN) {
    redirect("/unauthorized");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={session?.user as any} />

      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
