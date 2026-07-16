import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { ProfileForm } from "./profile-form";
import { PushSettings } from "@/components/notifications/push-settings";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect(routes.login);
  }

  return (
    <div className="space-y-8 font-montserrat">
      <ProfileForm initialUser={session.user} />
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Notification Preferences</h2>
        <PushSettings />
      </div>
    </div>
  );
}
