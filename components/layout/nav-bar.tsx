import { CircleQuestionMark, Heart, Info, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";

const NavBar = () => {
  const contactInfo = [
    {
      state: "Tamil Nadu",
      phone: "+91 70257 37666",
      href: "tel:+917025737666",
    },
    {
      state: "Karnataka",
      phone: "+91 70348 46777",
      href: "tel:+917034846777",
    },
    {
      state: "Kerala",
      phone: "+91 70257 37666",
      href: "tel:+917025737666",
    },
  ];
  return (
    <header>
      <nav className="container mx-auto flex items-center justify-between py-4 px-8 text-primary">
        {/* logo - left */}
        <Link href="/">
          <Image
            src="/logo.webp"
            className="object-contain w-auto h-12"
            width={1887}
            height={512}
            alt="Ann Doctor Logo"
          />
        </Link>

        {/* right */}
        <div className="flex gap-4">
          <div className="hidden md:block">
            <h6>Contact Us:</h6>
            <ul className="flex gap-4 text-sm">
              {contactInfo.map((info) => (
                <li key={info.state}>
                  <a href={info.href}>
                    <span className="font-semibold">{info.state}</span>:{" "}
                    {info.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-4 items-center justify-center">
            <Link aria-label="Home" href="/" className="hover:text-primary/80 transition-colors">
              <span className="font-medium hidden md:inline-block mr-1">Home</span>
            </Link>
            <Link aria-label="Products" href="/products" className="hover:text-primary/80 transition-colors">
              <ShoppingBag className="w-5 h-5 md:hidden" />
              <span className="font-medium hidden md:inline-block mr-1">Products</span>
            </Link>
            <Link aria-label="Wishlist" href="/wishlist" className="hover:text-primary/80 transition-colors">
              <Heart className="w-5 h-5" />
            </Link>
            <CartDrawer />
            <Link aria-label="Profile" href="/profile" className="hover:text-primary/80 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </Link>
            <Link aria-label="Information" href="/info" className="hover:text-primary/80 transition-colors">
              <Info className="w-5 h-5" />
            </Link>
            <Link aria-label="Help" href="/help" className="hover:text-primary/80 transition-colors">
              <CircleQuestionMark className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
