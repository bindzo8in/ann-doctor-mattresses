import NavBar from "@/components/layout/nav-bar";
import NavMarquee from "@/components/layout/nav-marquee";
import Footer from "@/components/layout/footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavMarquee />
      <NavBar />
      <div className="min-h-screen">
        {children}
      </div>
      <Footer />
    </>
  );
}
