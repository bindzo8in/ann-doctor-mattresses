import NavBar from "@/components/layout/nav-bar";
import NavMarquee from "@/components/layout/nav-marquee";
import Footer from "@/components/layout/footer";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavMarquee />
      <NavBar />
      {/* pb-16 reserves space so content doesn't hide behind the mobile bottom nav */}
      <div className="min-h-screen pb-16 md:pb-0">
        {children}
      </div>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
