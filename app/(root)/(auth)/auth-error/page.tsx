import Link from "next/link";
import { AlertTriangle, ArrowLeft, ShieldAlert } from "lucide-react";

interface ErrorPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

const errorMessages: Record<string, {
  title: string;
  description: string;
}> = {
  AccessDenied: {
    title: "Access Denied",
    description:
      "Your Google account does not have permission to access this CRM.",
  },
  Configuration: {
    title: "Server Configuration Error",
    description:
      "Authentication is temporarily unavailable due to a configuration issue.",
  },
  Verification: {
    title: "Verification Failed",
    description:
      "The login link is invalid or has expired. Please try again.",
  },
  Default: {
    title: "Authentication Error",
    description:
      "Something went wrong while trying to sign you in.",
  },
};

export default async function AuthErrorPage({
  searchParams,
}: ErrorPageProps) {
  const params = await searchParams;

  const error = params?.error || "Default";

  const errorData = errorMessages[error] || errorMessages.Default;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
        <div className="bg-destructive/10 border-b border-border p-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-destructive/15 flex items-center justify-center shrink-0">
            <ShieldAlert className="size-7 text-destructive" />
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Authentication Failed
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
              {errorData.title}
            </h1>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="rounded-2xl border border-border bg-muted/40 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-yellow-500 mt-0.5 shrink-0" />

              <div>
                <h2 className="font-semibold text-foreground">
                  Error Details
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  {errorData.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              scroll
            >
              Try Again
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium transition hover:bg-muted"
              scroll
            >
              <ArrowLeft className="size-4" />
              Back To Home
            </Link>
          </div>

          <div className="mt-8 border-t border-border pt-5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              If you believe this is a mistake, contact the administrator to
              verify your account access permissions.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}