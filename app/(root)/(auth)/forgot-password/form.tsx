"use client";

import * as z from "zod";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { forgotPasswordSchema } from "@/lib/schema/forgot-password-schema";
import { requestPasswordReset } from "@/lib/auth-client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import { Mail } from "lucide-react";

type Schema = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);

  const [submittedEmail, setSubmittedEmail] =
    useState<string | null>(null);

  const [resendAvailableAt, setResendAvailableAt] =
    useState<number | null>(null);

  const [cooldown, setCooldown] = useState(0);

  const [isResending, setIsResending] = useState(false);

  const form = useForm<Schema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const handleSubmit = form.handleSubmit(async (data) => {
    setError(null);

    try {
      const { error } = await requestPasswordReset({
        email: data.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        switch (error.status) {
          case 429:
            setError("Too many requests. Please try again later.");
            break;

          default:
            setError(
              error.message ??
                "Unable to send password reset email."
            );
        }

        return;
      }

      setSubmittedEmail(data.email);
      setResendAvailableAt(Date.now() + 60_000);

      form.reset();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  });

  useEffect(() => {
    if (!resendAvailableAt) return;

    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((resendAvailableAt - Date.now()) / 1000)
      );

      setCooldown(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [resendAvailableAt]);

  const handleResend = async () => {
    if (!submittedEmail || cooldown > 0) return;

    try {
      setError(null);
      setIsResending(true);

      const { error } = await requestPasswordReset({
        email: submittedEmail,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        switch (error.status) {
          case 429:
            setError("Too many requests. Please try again later.");
            break;

          default:
            setError(
              error.message ?? "Failed to resend reset email."
            );
        }

        return;
      }

      setResendAvailableAt(Date.now() + 60_000);
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setIsResending(false);
    }
  };

  if (submittedEmail) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <Mail className="size-12 mb-4 text-primary" />

          <h2 className="text-2xl font-bold">
            Check your email
          </h2>

          <p className="mt-3 text-muted-foreground">
            If an account exists for
          </p>

          <p className="font-medium">{submittedEmail}</p>

          <p className="mt-4 text-muted-foreground">
            We've sent you a password reset link.
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Didn't receive it? Check your spam folder or resend
            the email below.
          </p>

          <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
            <Button
              asChild
              variant="outline"
              className="flex-1"
            >
              <Link href="/signin">
                Back to Sign In
              </Link>
            </Button>

            <Button
              className="flex-1"
              variant="outline"
              disabled={cooldown > 0 || isResending}
              onClick={handleResend}
            >
              {isResending
                ? "Sending..."
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend Email"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {error && (
        <Alert
          variant="destructive"
          className="max-w-lg mx-auto mb-4"
        >
          <AlertTitle>Reset Password</AlertTitle>

          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg mx-auto rounded-md border p-8"
      >
        <FieldGroup className="space-y-5">
          <div>
            <h1 className="text-3xl font-bold">
              Forgot Password
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email address and we'll send you a
              password reset link.
            </p>
          </div>

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1"
              >
                <FieldLabel htmlFor="email">
                  Email Address
                </FieldLabel>

                <Input
                  {...field}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting
              ? "Sending..."
              : "Send Reset Link"}
          </Button>
        </FieldGroup>
      </form>
    </>
  );
}