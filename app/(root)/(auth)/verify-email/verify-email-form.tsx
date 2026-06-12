"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { VerificationTokenType } from "@/app/generated/prisma/enums";

const verifyEmailSchema = z.object({
  token: z.string().length(6, "OTP must be 6 digits"),
});

type Schema = z.infer<typeof verifyEmailSchema>;

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const form = useForm<Schema>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      token: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!email) {
      toast.error("Missing email address");
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token: data.token,
          type: VerificationTokenType.EMAIL_VERIFICATION,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.message ?? "Verification failed");
        return;
      }

      toast.success("Email verified successfully!");
      router.push("/signin");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  });

  const resendVerification = async () => {
    if (!email) return;

    try {
      setIsResending(true);

      const response = await fetch("/api/auth/resend-verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === "COOLDOWN_ACTIVE") {
          // Extract seconds from message if possible, or just default
          setResendCooldown(60);
          toast.error(result.message);
          return;
        }
        throw new Error(result.message ?? "Unable to resend email");
      }

      toast.success("Verification email sent!");
      setResendCooldown(60); // Simple 60s cooldown for UI
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="container max-w-lg mx-auto py-20">
        <Card>
          <CardContent className="space-y-6 p-8 text-center">
            <h1 className="text-2xl font-bold">Invalid Request</h1>
            <p className="text-muted-foreground">
              Email address is missing from the request.
            </p>
            <Button onClick={() => router.push("/signup")}>
              Back to Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-20">
      <Card>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Verify Your Email</h1>
                <p className="mt-2 text-muted-foreground">
                  We've sent a 6-digit code to <br />
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <Controller
                name="token"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1 flex flex-col items-center">
                    <FieldLabel className="sr-only">Verification Code</FieldLabel>

                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Verifying..." : "Verify Email"}
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resendVerification}
                  disabled={isResending || resendCooldown > 0}
                  className="w-full"
                >
                  {isResending
                    ? "Sending..."
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Verification Code"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}