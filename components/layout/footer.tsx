"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { submitContactMessage } from "@/actions/support";

function ContactBlock() {
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
    <div className="w-full bg-[#1e1e1e] text-white py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('/images/mattress-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Logo & Socials */}
          <div className="flex flex-col md:flex-row items-center gap-8 justify-center md:justify-start">
            <div className="bg-white p-4 rounded-lg inline-block">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.webp"
                  className="object-contain w-auto h-12"
                  width={1887}
                  height={512}
                  alt="Ann Doctor Logo"
                />
              </Link>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <p className="text-sm text-slate-300 font-medium">Follow us on social media</p>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <Link href="#" className="bg-white text-black p-2 rounded-full hover:bg-slate-200 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z"/></svg>
                </Link>
                <Link href="#" className="bg-white text-black p-2 rounded-full hover:bg-slate-200 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </Link>
                <Link href="#" className="bg-white text-black p-2 rounded-full hover:bg-slate-200 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </Link>
                <Link href="#" className="bg-white text-black p-2 rounded-full hover:bg-slate-200 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.976H5.078z"></path></svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side: Get In Touch Form */}
          <div className="max-w-md w-full mx-auto md:ml-auto md:mr-0">
            <h3 className="text-2xl font-bold mb-6 text-center md:text-left tracking-wide">GET IN TOUCH</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input 
                  name="name" 
                  placeholder="Name:" 
                  required 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30 rounded-none h-10"
                />
                <Input 
                  name="email" 
                  type="email"
                  placeholder="Email:" 
                  required 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30 rounded-none h-10"
                />
              </div>
              <Input 
                name="message" 
                placeholder="Leave your message:" 
                required 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30 rounded-none h-12"
              />
              <div className="flex justify-center md:justify-start">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 h-9 text-xs rounded-sm uppercase tracking-wider font-semibold"
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
  );
}

function MainFooterBlock() {
  return (
    <div className="w-full bg-black text-white pt-16 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">
          
          {/* Column 1: Contact Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              <h4 className="font-bold text-lg">Chat with sales</h4>
            </div>
            
            <div className="flex items-start gap-3 mt-8">
              <Phone className="w-5 h-5 mt-1 shrink-0" />
              <div className="space-y-1 text-sm text-slate-300">
                <p><span className="font-semibold text-white">Tamil Nadu:</span> 70257 37656</p>
                <p><span className="font-semibold text-white">Karnataka:</span> 70346 46777</p>
                <p><span className="font-semibold text-white">Kerala:</span> 70257 37656</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 shrink-0" />
              <p className="text-sm text-slate-300">doctormattresses24@gmail.com</p>
            </div>
          </div>

          {/* Column 2: Products */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg">Products</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/products?type=MATTRESS" className="hover:text-white transition-colors">Orthopedic Mattresses</Link></li>
              <li><Link href="/products?type=MATTRESS" className="hover:text-white transition-colors">Memory Foam Mattresses</Link></li>
              <li><Link href="/products?type=MATTRESS" className="hover:text-white transition-colors">Dual Comfort Mattresses</Link></li>
              <li><Link href="/products?type=MATTRESS" className="hover:text-white transition-colors">Spring Mattresses</Link></li>
              <li><Link href="/products?type=SOFA" className="hover:text-white transition-colors">Premium Sofas</Link></li>
              <li><Link href="/products?type=MATTRESS" className="hover:text-white transition-colors">Custom Size Mattresses</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg">Company</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Customer Stories</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Legal</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Press Kit</Link></li>
            </ul>
          </div>

          {/* Column 4: Customer Service */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg">Customer Service</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Warranty Registration</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Return Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Shipping Information</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Sleep Guide</Link></li>
            </ul>
          </div>

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
      <div className="h-10 w-full bg-[#da251d]"></div>
    </footer>
  );
}
