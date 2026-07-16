"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/lib/schema/reset-password";

import { resetPassword } from "@/lib/auth-client";

import { Password } from "@/components/password";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";

import {
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ResetPasswordFormProps {
  token?: string;
}

export function ResetPasswordForm({
  token,
}: ResetPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      "confirm-password": "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const handleSubmit = form.handleSubmit(async (data) => {
    setError(null);

    if (!token) {
      setError("This password reset link is invalid or has expired.");
      return;
    }

    try {
      const { error } = await resetPassword({
        token,
        newPassword: data.password,
      });
      console.log(error)

      if (error) {
        switch (error.status) {
          case 400:
            setError("This password reset link is invalid or has expired.");
            break;

          case 429:
            setError("Too many requests. Please try again later.");
            break;

          default:
            setError(error.message ?? "Failed to reset password.");
        }

        return;
      }

      setSuccess(true);
      form.reset();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  });

  if (!token) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <AlertCircle className="size-12 text-destructive mb-4" />

          <h2 className="text-2xl font-bold">
            Invalid Reset Link
          </h2>

          <p className="mt-3 text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>

          <Button asChild className="mt-6 w-full">
            <Link href="/forgot-password">
              Request New Reset Link
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <CheckCircle2 className="size-12 text-green-600 mb-4" />

          <h2 className="text-2xl font-bold">
            Password Updated
          </h2>

          <p className="mt-3 text-muted-foreground">
            Your password has been updated successfully.
          </p>

          <p className="text-sm text-muted-foreground mt-2">
            You can now sign in using your new password.
          </p>

          <Button asChild className="mt-6 w-full">
            <Link href="/signin">
              Continue to Sign In
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {error && (
        <Alert
          variant="destructive"
          className="max-w-3xl mx-auto mb-4"
        >
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-2 sm:p-5 md:p-8 w-full rounded-md border max-w-3xl mx-auto"
      >
        <FieldGroup className="grid md:grid-cols-6 gap-4 mb-6">
          <h1 className="mt-6 mb-1 font-extrabold text-3xl tracking-tight col-span-full">
            🔒 Create New Password
          </h1>

          <p className="tracking-wide text-muted-foreground mb-5 text-sm col-span-full">
            Enter and confirm your new password.
          </p>

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldContent className="gap-0.5">
                  <FieldLabel htmlFor="password">
                    New Password *
                  </FieldLabel>
                </FieldContent>

                <Password
                  {...field}
                  id="password"
                  placeholder="Enter your new password"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="confirm-password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldContent className="gap-0.5">
                  <FieldLabel htmlFor="confirm-password">
                    Confirm Password *
                  </FieldLabel>
                </FieldContent>

                <Password
                  {...field}
                  id="confirm-password"
                  placeholder="Confirm your new password"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex justify-end items-center gap-2">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href="/signin">
              Back to Sign In
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Updating Password..."
              : "Update Password"}
          </Button>
        </div>
      </form>
    </>
  );
}