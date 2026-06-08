import React from "react";
import NavBar from "@/components/layout/nav-bar";
import NavMarquee from "@/components/layout/nav-marquee";
import { ProfileSidebar } from "./profile-sidebar";
import { auth } from "@/auth";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userRole = session?.user?.role as string | undefined;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <NavMarquee />
      <NavBar />

      {/* Main Grid Layout */}
      <div className="container mx-auto max-w-6xl py-10 px-4 md:px-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1 space-y-4">
            <ProfileSidebar userRole={userRole} />
          </aside>

          {/* Content Area */}
          <main className="md:col-span-3">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[500px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
