import type { Metadata } from "next";
import "./globals.css";
import { Geist, Inter, JetBrains_Mono, Montserrat_Alternates, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
import { PushManager } from "@/components/notifications/push-manager";
import { AppSessionProvider } from "@/components/providers/session-provider";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  variable: "--font-montserrat-alternates",
  display: "swap",
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
});


export const metadata: Metadata = {
  title: "Ann Doctor Mattresses",
  description: "Premium Mattresses and Furniture for a Comfortable Living",
  appleWebApp: {
    title: "Ann Doctor Mattresses"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} ${montserratAlternates.variable} antialiased`}>
      <body>
        <QueryProvider>
          <AppSessionProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </AppSessionProvider>
          <Toaster />
          <PushManager />
        </QueryProvider>
      </body>
    </html>
  );
}
