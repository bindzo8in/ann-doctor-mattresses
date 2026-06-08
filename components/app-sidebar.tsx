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
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon, Settings2Icon, CircleHelpIcon, SearchIcon, CommandIcon, MessageSquareIcon, MonitorPlay } from "lucide-react"

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
    title: "Reviews",
    url: "/dashboard/reviews",
    icon: (
      <MessageSquareIcon />
    ),
  },
]

const navSecondary = [
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
          if (user?.role === "BRANCH_ADMIN") {
            return item.title === "Dashboard" || item.title === "Orders" || item.title === "Hero Section";
          }
          return true;
        })} />
        <NavSecondary items={navSecondary.filter(item => {
          if (user?.role === "BRANCH_ADMIN") {
            return item.title === "Get Help" || item.title === "Search";
          }
          return true;
        })} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
