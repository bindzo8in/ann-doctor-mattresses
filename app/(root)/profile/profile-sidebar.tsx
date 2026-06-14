"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, ClipboardList, LogOut, Home } from "lucide-react";
import { routes } from "@/lib/routes";
import { logoutAction } from "@/actions/logout";

export function ProfileSidebar({ userRole }: { userRole?: string }) {
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

  if (userRole === "SUPER_ADMIN" || userRole === "BRANCH_ADMIN") {
    menuItems.push({
      label: "Admin Dashboard",
      href: routes.dashboard,
      icon: Home,
    });
  }

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = routes.login;
  };

  return (
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
  );
}
