import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect(`${routes.login}?callbackUrl=/checkout`);
  }

  return <>{children}</>;
}
