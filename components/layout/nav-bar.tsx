import { CircleQuestionMark, Heart, Info, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

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
        <Image
          src="/logo.webp"
          className="object-contain w-auto h-12"
          width={1887}
          height={512}
          alt="Ann Doctor Logo"
        />

        {/* right */}
        <div className="flex gap-4">
          <div className="">
            <h6>Contact Us:</h6>
            <ul className="flex gap-4">
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
            <Link aria-label="Wishlist" href="/wishlist">
              <Heart />
            </Link>
            <Link aria-label="Shopping Cart" href="/cart">
              <ShoppingBag />
            </Link>
            <Link aria-label="Information" href="/info">
              <Info />
            </Link>
            <Link aria-label="Help" href="/help">
              <CircleQuestionMark />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
