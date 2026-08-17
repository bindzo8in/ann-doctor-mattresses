import type { Metadata } from "next";
import "./globals.css";
import { Inter, JetBrains_Mono, Montserrat, Montserrat_Alternates, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
import { PushManager } from "@/components/notifications/push-manager";
import { AppSessionProvider } from "@/components/providers/session-provider";
import { GoogleAnalytics } from '@next/third-parties/google'
import { env } from "@/env";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  variable: "--font-montserrat-alternates",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ann Doctor Mattresses",
  description: "Premium Mattresses and Furniture for a Comfortable Living",
  appleWebApp: {
    title: "Ann Doctor Mattresses"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} ${montserrat.variable} ${montserratAlternates.variable} antialiased`}>
      <body>
        <QueryProvider>
          <AppSessionProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
            <Toaster expand richColors position="top-right" />
            <PushManager />
          </AppSessionProvider>
        </QueryProvider>
        <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  );
}
