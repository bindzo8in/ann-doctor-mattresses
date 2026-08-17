"use client";

import { Heart, Home, Info, ShoppingBag, CircleHelp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useSession } from "@/lib/auth-client";

const contactInfo = [
  { state: "TN", phone: "+91 70257 37666", href: "tel:+917025737666" },
  { state: "KA", phone: "+91 70348 46777", href: "tel:+917034846777" },
  { state: "KL", phone: "+91 70257 37666", href: "tel:+917025737666" },
];

const navLinks = [
  { label: "Home", href: routes.home },
  { label: "Products", href: routes.products },
  { label: "Track Order", href: routes.trackOrder },
  { label: "Wishlist", href: routes.wishlist },
  { label: "Help", href: routes.help },
];

export default function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <nav className="page-container flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <Link href={routes.home} className="shrink-0" scroll>
          <Image
            src="/logo.webp"
            className="object-contain w-auto h-10"
            width={180}
            height={48}
            alt="Ann Doctor Logo"
            priority
          />
        </Link>

        {/* Desktop nav links – hidden on mobile */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-destructive/10 text-destructive"
                    : "text-foreground hover:bg-muted hover:text-foreground"
                }`}
                scroll
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side: contact info + action icons */}
        <div className="flex items-center gap-3 lg:gap-5">
          {/* Contact strip – only on extra-large screens to prevent squishing */}
          <div className="hidden xl:flex flex-col items-end leading-none">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">
              Contact Us
            </span>
            <ul className="flex gap-3 text-xs text-foreground/80">
              {contactInfo.map((c) => (
                <li key={c.state}>
                  <a
                    href={c.href}
                    className="hover:text-primary transition-colors"
                  >
                    <span className="font-semibold">{c.state}:</span> {c.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Action icons – always visible on desktop, hidden on mobile (bottom bar handles it) */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              aria-label="Wishlist"
              href={routes.wishlist}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              scroll
            >
              <Heart className="w-5 h-5" />
            </Link>
            <CartDrawer />
            <Link
              aria-label={session?.user ? "Profile" : "Sign In"}
              href={session?.user ? routes.profile : routes.login}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              scroll
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          </div>

          {/* Mobile: only show cart icon in navbar (rest in bottom bar) */}
          <div className="flex md:hidden items-center gap-2">
            <CartDrawer />
          </div>
        </div>
      </nav>
    </header>
  );
}
