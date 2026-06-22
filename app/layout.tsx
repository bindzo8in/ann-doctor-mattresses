import type { Metadata } from "next";
import "./globals.css";
import { Geist, Inter, JetBrains_Mono, Montserrat, Montserrat_Alternates, Playfair_Display } from "next/font/google";
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

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
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
})

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

import { auth } from "@/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} ${montserratAlternates.variable} antialiased`}>
      <body>
        <QueryProvider>
          <AppSessionProvider session={session}>
            <TooltipProvider>
              {children}
            </TooltipProvider>
            <Toaster expand richColors position="top-right" />
            <PushManager />
          </AppSessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
