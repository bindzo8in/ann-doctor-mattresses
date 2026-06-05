"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ClipboardList, LogOut, Home } from "lucide-react";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

import NavBar from "@/components/layout/nav-bar";
import NavMarquee from "@/components/layout/nav-marquee";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "My Profile",
      href: routes.profile,
      icon: User,
    },
    {
      label: "My Orders",
      href: routes.profileOrders,
      icon: ClipboardList,
    },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: routes.home });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <NavMarquee />
      <NavBar />

      {/* Main Grid Layout */}
      <div className="container mx-auto max-w-6xl py-10 px-4 md:px-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
              
              <hr className="my-2 border-slate-100" />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
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
