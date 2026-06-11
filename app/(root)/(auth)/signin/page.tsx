import { LoginForm } from "@/components/login-form-template";

export default async function Signin({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl = typeof resolvedSearchParams.callbackUrl === 'string' 
    ? resolvedSearchParams.callbackUrl 
    : '/';

  return (
    <LoginForm callbackUrl={callbackUrl} />
  );
}