import NavBar from "@/components/layout/nav-bar";
import NavMarquee from "@/components/layout/nav-marquee";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavMarquee />
      <NavBar />
      {children}
    </>
  );
}
