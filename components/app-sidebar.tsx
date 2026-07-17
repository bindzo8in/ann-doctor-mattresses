"use client";

import * as React from "react";
import Link from "next/link";

import { admin } from "@/lib/auth-client";
import { UserRole } from "@/app/generated/prisma/enums";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  LayoutDashboardIcon,
  ListIcon,
  ChartBarIcon,
  FolderIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  CommandIcon,
  MessageSquareIcon,
  MonitorPlay,
  ShieldIcon,
  UsersIcon,
  TagsIcon,
} from "lucide-react";

import { routes } from "@/lib/routes";

type Permission =
  Parameters<typeof admin.checkRolePermission>[0]["permissions"];

type NavItem = {
  title: string;
  url: string;
  icon: React.ReactNode;
  permission?: Permission;
};

const navMain: NavItem[] = [
  {
    title: "Dashboard",
    url: routes.dashboard,
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Orders",
    url: routes.dashboard_orders,
    icon: <ListIcon />,
    permission: {
      orders: ["read"],
    },
  },
  {
    title: "Promotions",
    url: routes.dashboard_promotions,
    icon: <ChartBarIcon />,
    permission: {
      promotions: ["read"],
    },
  },
  {
    title: "Hero Section",
    url: routes.dashboard_hero,
    icon: <MonitorPlay />,
    permission: {
      hero: ["read"],
    },
  },
  {
    title: "Products",
    url: routes.dashboard_products,
    icon: <FolderIcon />,
    permission: {
      products: ["read"],
    },
  },
  {
    title: "Categories",
    url: routes.dashboard_categories,
    icon: <TagsIcon />,
    permission: {
      categories: ["read"],
    },
  },
  {
    title: "Reviews",
    url: routes.dashboard_reviews,
    icon: <MessageSquareIcon />,
    permission: {
      reviews: ["read"],
    },
  },
];

const navSecondary: NavItem[] = [
  {
    title: "Users",
    url: routes.dashboard_users,
    icon: <UsersIcon />,
    permission: {
      users: ["read"],
    },
  },
  {
    title: "Audit Logs",
    url: routes.dashboard_audit,
    icon: <ShieldIcon />,
    permission: {
      audit: ["read"],
    },
  },
  {
    title: "Locked Accounts",
    url: routes.dashboard_locked_accounts,
    icon: <ShieldIcon />,
    permission: {
      users: ["read"],
    },
  },
  {
    title: "Settings",
    url: routes.dashboard_settings,
    icon: <Settings2Icon />,
    permission: {
      settings: ["read"],
    },
  },
  {
    title: "Get Help",
    url: routes.help,
    icon: <CircleHelpIcon />,
  },
  {
    title: "Search",
    url: "#",
    icon: <SearchIcon />,
  },
];

function can(
  role: UserRole | undefined,
  permission?: Permission
) {
  console.log('role permission => ', role, permission)
  if (!permission) return true;
  if (!role) return false;

  return admin.checkRolePermission({
    role,
    permissions: permission,
  });
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole;
  };
}) {
  const role = user?.role;

  const filteredMain = navMain.filter((item) =>
    can(role, item.permission)
  );

  const filteredSecondary = navSecondary.filter((item) =>
    can(role, item.permission)
  );

  const userData = {
    name: user?.name ?? "Admin",
    email: user?.email ?? "admin@example.com",
    avatar: user?.image ?? "/logo_symbol.png",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href={routes.home}>
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">
                  Ann Doctor Mattresses
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={filteredMain} />
        <NavSecondary
          items={filteredSecondary}
          className="mt-auto"
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}