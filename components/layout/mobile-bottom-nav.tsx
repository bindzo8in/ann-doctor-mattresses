"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Heart, User, HelpCircle } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { routes } from "@/lib/routes";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const bottomNavItems = [
    { label: "Home", href: routes.home, icon: Home },
    { label: "Products", href: routes.products, icon: ShoppingBag },
    { label: "Wishlist", href: routes.wishlist, icon: Heart },
    { 
      label: session?.user ? "Profile" : "Account", 
      href: session?.user ? routes.profile : routes.login, 
      icon: User 
    },
    { label: "Help", href: routes.help, icon: HelpCircle },
  ];

  return (
    /* Only visible on mobile, hidden md+ */
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <ul className="flex items-stretch h-16">
        {bottomNavItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <li key={label} className="relative flex-1">
              <Link
                href={href}
                aria-label={label}
                className={`flex flex-col items-center justify-center h-full gap-1 transition-colors ${
                  active ? "text-destructive" : "text-muted-foreground hover:text-foreground"
                }`}
                scroll
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${active ? "scale-110" : ""}`}
                />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-destructive" />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
