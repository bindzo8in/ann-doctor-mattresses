"use client";

import * as z from "zod";

import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Password } from "@/components/password";
import { Button } from "@/components/ui/button";
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

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    token: z.string().length(6, "OTP must be 6 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
type Schema = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const form = useForm<Schema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email ?? "",
      token: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!data.email) {
      toast.error("Missing email address");
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          token: data.token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === "VALIDATION_ERROR" && result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as keyof Schema, {
              message: Array.isArray(messages) ? messages[0] : String(messages),
            });
          });

          return;
        }

        toast.error(result.message ?? "Unable to reset password.");

        return;
      }

      toast.success("Password reset successfully.");

      router.push("/signin");
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");
    }
  });

  if (!email) {
    return (
      <div className="max-w-lg mx-auto border rounded-md p-8">
        <h1 className="text-2xl font-bold">Invalid Request</h1>

        <p className="mt-2 text-muted-foreground">
          Email address is missing from the request.
        </p>
        <Button className="mt-4" onClick={() => router.push("/forgot-password")}>
          Back to Forgot Password
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto border rounded-md p-8"
    >
      <FieldGroup className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold">Reset Password</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Enter the 6-digit code sent to {email} and your new password.
          </p>
        </div>

        <Controller
          name="token"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1 flex flex-col items-center">
              <FieldLabel>Verification Code</FieldLabel>

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

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel>New Password</FieldLabel>

              <Password {...field} placeholder="New password" />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel>Confirm Password</FieldLabel>

              <Password {...field} placeholder="Confirm password" />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Updating..." : "Update Password"}
        </Button>
      </FieldGroup>
    </form>
  );
}
