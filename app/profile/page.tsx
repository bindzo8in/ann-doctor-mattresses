import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect(routes.login);
  }

  return <ProfileForm initialUser={session.user} />;
}
