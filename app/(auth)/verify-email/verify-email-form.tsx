"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VerificationTokenType } from "@/app/generated/prisma/enums";

type Status =
  | "loading"
  | "verified"
  | "error"
  | "idle";

export function VerifyEmailForm() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] =
    useState<Status>("idle");

  const [isResending, setIsResending] =
    useState(false);

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        setStatus("loading");

        const response = await fetch(
          "/api/auth/verify-token",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              token,
              type: VerificationTokenType.EMAIL_VERIFICATION
            }),
          }
        );

        const result =
          await response.json();
        if (!response.ok) {
          throw new Error(
            result.message ??
              "Verification failed"
          );
        }

        setStatus("verified");
      } catch (error) {
        console.error(error)
        setStatus("error");

        toast.error(
          error instanceof Error
            ? error.message
            : "Verification failed"
        );
      }
    };

    verifyEmail();
  }, [token]);

  const resendVerification = async () => {
    if (!email) return;

    try {
      setIsResending(true);

      const response = await fetch(
        "/api/auth/resend-verify-token",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ??
            "Unable to resend email"
        );
      }

      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container max-w-lg py-20">
      <Card>
        <CardContent className="space-y-6 p-8">
          {!token && (
            <>
              <h1 className="text-2xl font-bold">
                Verify Your Email
              </h1>

              <p className="text-muted-foreground">
                We've sent a verification
                email to:
              </p>

              <p className="font-medium">
                {email}
              </p>

              <Button
                onClick={resendVerification}
                disabled={isResending}
                className="w-full"
              >
                {isResending
                  ? "Sending..."
                  : "Resend Verification Email"}
              </Button>
            </>
          )}

          {status === "loading" && (
            <>
              <h1 className="text-2xl font-bold">
                Verifying Email
              </h1>

              <p className="text-muted-foreground">
                Please wait...
              </p>
            </>
          )}

          {status === "verified" && (
            <>
              <h1 className="text-2xl font-bold text-green-600">
                Email Verified
              </h1>

              <p>
                Your email has been
                verified successfully.
              </p>

              <Button asChild>
                <a href="/signin">
                  Continue to Login
                </a>
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="text-2xl font-bold text-red-600">
                Verification Failed
              </h1>

              <p>
                This verification link is
                invalid or expired.
              </p>

              {email && (
                <Button
                  onClick={
                    resendVerification
                  }
                  disabled={isResending}
                >
                  Resend Email
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}