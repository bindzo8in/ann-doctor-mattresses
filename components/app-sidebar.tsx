"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon, Settings2Icon, CircleHelpIcon, SearchIcon, CommandIcon, MessageSquareIcon, MonitorPlay, ShieldIcon, UsersIcon, TagsIcon } from "lucide-react"
import { userHasPermission } from "@/lib/rbac"
import { Permission } from "@/lib/permissions"

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: (
      <LayoutDashboardIcon />
    ),
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: (
      <ListIcon />
    ),
  },
  {
    title: "Promotions",
    url: "/dashboard/promotions",
    icon: (
      <ChartBarIcon />
    ),
  },
  {
    title: "Hero Section",
    url: "/dashboard/hero",
    icon: (
      <MonitorPlay />
    ),
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: (
      <FolderIcon />
    ),
  },
  {
    title: "Categories",
    url: "/dashboard/products/categories",
    icon: (
      <TagsIcon />
    ),
  },
  {
    title: "Reviews",
    url: "/dashboard/reviews",
    icon: (
      <MessageSquareIcon />
    ),
  },
]

const navSecondary = [
  {
    title: "Users",
    url: "/dashboard/users",
    icon: (
      <UsersIcon />
    ),
  },
  {
    title: "Audit Logs",
    url: "/dashboard/audit",
    icon: (
      <ShieldIcon />
    ),
  },
  {
    title: "Locked Accounts",
    url: "/dashboard/security/locked-accounts",
    icon: (
      <ShieldIcon />
    ),
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: (
      <Settings2Icon />
    ),
  },
  {
    title: "Get Help",
    url: "#",
    icon: (
      <CircleHelpIcon />
    ),
  },
  {
    title: "Search",
    url: "#",
    icon: (
      <SearchIcon />
    ),
  },
]
export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user?: any }) {
  const userData = {
    name: user?.name || "Admin",
    email: user?.email || "admin@example.com",
    avatar: user?.image || "/avatars/shadcn.jpg",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Ann Doctor Mattresses</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain.filter(item => {
          if (item.title === "Dashboard") return true;
          if (item.title === "Orders") return userHasPermission(user, "orders.read");
          if (item.title === "Promotions") return userHasPermission(user, "promotions.read");
          if (item.title === "Hero Section") return userHasPermission(user, "settings.read");
          if (item.title === "Products") return userHasPermission(user, "products.read");
          if (item.title === "Categories") return userHasPermission(user, "categories.read");
          if (item.title === "Reviews") return userHasPermission(user, "reviews.read");
          return true;
        })} />
        <NavSecondary items={navSecondary.filter(item => {
          if (item.title === "Users") return userHasPermission(user, "users.read");
          if (item.title === "Audit Logs") return userHasPermission(user, "audit.read");
          if (item.title === "Locked Accounts") return userHasPermission(user, "audit.read");
          if (item.title === "Settings") return userHasPermission(user, "settings.read");
          return true;
        })} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
