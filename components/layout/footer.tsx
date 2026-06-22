"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { submitContactMessage } from "@/actions/support";
import { routes } from "@/lib/routes";

export function ContactBlock() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const message = formData.get("message") as string;

      if (!name || !email || !message) {
        toast.error("Please fill in all fields.");
        setIsSubmitting(false);
        return;
      }

      await submitContactMessage({ name, email, message });
      toast.success("Message sent successfully!");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row min-h-[200px] lg:min-h-[240px] border-b-4 lg:border-b-8 border-black">
      {/* Left White Section */}
      <div className="w-full lg:w-[35%] xl:w-[30%] bg-white flex items-center justify-center py-6 lg:py-0 px-8">
        <Link href={routes.home} scroll>
          <Image
            src="/logo.webp"
            className="object-contain w-auto h-16 md:h-20 lg:h-24"
            width={1887}
            height={512}
            alt="Ann Doctor Logo"
          />
        </Link>
      </div>

      {/* Right Dark Section */}
      <div className="w-full lg:w-[65%] xl:w-[70%] bg-[#222222] text-white py-8 lg:py-10 relative overflow-hidden flex items-center shadow-inner">
        {/* Large watermark logo */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Image src="/footer_bed.png" fill alt="" className="object-cover object-center" />
        </div>

        <div className="w-full px-6 sm:px-12 xl:px-16 relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-start gap-8 lg:gap-12">
            
            {/* Social Media Column */}
            <div className="space-y-4 lg:space-y-6 shrink-0 pt-2">
              <h3 className="text-base md:text-lg lg:text-xl font-normal tracking-wide text-slate-100">Follow us on social media</h3>
              <div className="flex items-center gap-4 lg:gap-5">
                <a href="https://www.facebook.com/p/Doctor-Mattresses-61577727336121/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-black p-2.5 rounded-full hover:bg-slate-200 transition-colors">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 fill-current" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z" /></svg>
                </a>
                <a href="https://www.instagram.com/doctor_mattresses_/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-black p-2.5 rounded-full hover:bg-slate-200 transition-colors">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </a>
                <a href="https://www.youtube.com/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-black p-2.5 rounded-full hover:bg-slate-200 transition-colors">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
                <a href="https://twitter.com/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-black p-2.5 rounded-full hover:bg-slate-200 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 lg:w-6 lg:h-6 fill-current" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.976H5.078z"></path></svg>
                </a>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="w-full max-w-2xl flex-1">
              <h3 className="text-base md:text-lg lg:text-xl font-normal tracking-wide text-slate-100 mb-4 sm:mb-6">GET IN TOUCH</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    name="name"
                    placeholder="Name:"
                    required
                    className="bg-white/20 border-none text-white placeholder:text-white/80 focus-visible:ring-1 focus-visible:ring-white/50 rounded-sm h-11 w-full text-sm font-medium"
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email:"
                    required
                    className="bg-white/20 border-none text-white placeholder:text-white/80 focus-visible:ring-1 focus-visible:ring-white/50 rounded-sm h-11 w-full text-sm font-medium"
                  />
                </div>
                <Input
                  name="message"
                  placeholder="Leave your message:"
                  required
                  className="bg-white/20 border-none text-white placeholder:text-white/80 focus-visible:ring-1 focus-visible:ring-white/50 rounded-sm h-12 text-sm font-medium"
                />
                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#0055ff] hover:bg-blue-600 text-white px-8 py-2 h-8 text-xs rounded font-semibold tracking-wide transition-colors"
                  >
                    {isSubmitting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : null}
                    Send
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function MainFooterBlock() {
  return (
    <div className="w-full bg-black text-white pt-16 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-16">

          {/* Contact */}
          <div className="space-y-6 w-full lg:w-[280px] shrink-0">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              <h4 className="font-bold text-lg">Contact</h4>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p>Tamil Nadu: 70257 37656</p>
                  <p>Karnataka: 70346 46777</p>
                  <p>Kerala: 70257 37656</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 shrink-0" />
                <span>doctormattresses24@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Links Group (Shop, Company, Support) */}
          <div className="flex flex-wrap sm:flex-nowrap justify-center gap-10 sm:gap-16 lg:gap-24 flex-1">
            
            {/* Shop */}
            <div className="space-y-6 min-w-[120px]">
            <h4 className="font-bold text-lg">Shop</h4>

            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link
                  href={routes.products}
                  className="hover:text-white transition-colors"
                  scroll
                >
                  All Products
                </Link>
              </li>

              <li>
                <Link
                  href={`${routes.products}?type=MATTRESS`}
                  className="hover:text-white transition-colors"
                  scroll
                >
                  Mattresses
                </Link>
              </li>

              <li>
                <Link
                  href={`${routes.products}?type=SOFA`}
                  className="hover:text-white transition-colors"
                  scroll
                >
                  Sofas
                </Link>
              </li>

              <li>
                <Link
                  href={`${routes.products}?size=CUSTOM`}
                  className="hover:text-white transition-colors"
                  scroll
                >
                  Custom Size Mattress
                </Link>
              </li>

            </ul>
            </div>

            {/* Company */}
            <div className="space-y-6 min-w-[120px]">
            <h4 className="font-bold text-lg">Company</h4>

            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link
                  href={routes.aboutUs}
                  className="hover:text-white transition-colors"
                  scroll
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href={routes.branches}
                  className="hover:text-white transition-colors"
                  scroll
                >
                  Our Branches
                </Link>
              </li>
            </ul>
            </div>

            {/* Support */}
            <div className="space-y-6 min-w-[120px]">
            <h4 className="font-bold text-lg">Support</h4>

            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link
                  href={routes.help}
                  className="hover:text-white transition-colors"
                  scroll
                >
                  Help
                </Link>
              </li>

              <li>
                <Link
                  href={routes.shippingPolicy}
                  className="hover:text-white transition-colors"
                  scroll
                >
                  Shipping Policy
                </Link>
              </li>

              <li>
                <Link
                  href={routes.returnPolicy}
                  className="hover:text-white transition-colors"
                  scroll
                >
                  Return Policy
                </Link>
              </li>

              <li>
                <Link
                  href={routes.privacyPolicy}
                  className="hover:text-white transition-colors"
                  scroll
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href={routes.termsAndConditions}
                  className="hover:text-white transition-colors"
                  scroll
                >
                  Terms & Conditions
                </Link>
              </li>
              </ul>
            </div>

          </div>

          {/* Right Spacer for Perfect Centering */}
          <div className="hidden lg:block lg:w-[280px] shrink-0"></div>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer>
      <ContactBlock />
      <MainFooterBlock />
      {/* Bottom Red Bar */}
      <div className="h-10 w-full bg-[#da251d] flex items-center justify-center">
        <p className="text-white text-xs sm:text-sm font-medium">
          Designed & developed by{" "}
          <a
            href="https://bindzo8.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/80 transition-colors"
          >
            Bindzo 8 Private Limited
          </a>
        </p>
      </div>
    </footer>
  );
}
