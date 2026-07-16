import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({ searchParams }: PageProps<'/reset-password'>) {
  const { token } = await searchParams;
  return (
    <ResetPasswordForm token={token as string | undefined} />
  );
}
