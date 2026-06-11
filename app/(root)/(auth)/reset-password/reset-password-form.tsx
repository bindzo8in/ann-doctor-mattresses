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

export const resetPasswordSchema = z
  .object({
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

  const token = searchParams.get("token");

  const form = useForm<Schema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!token) {
      toast.error("Invalid reset link");

      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
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

  if (!token) {
    return (
      <div className="max-w-lg mx-auto border rounded-md p-8">
        <h1 className="text-2xl font-bold">Invalid Reset Link</h1>

        <p className="mt-2 text-muted-foreground">
          This password reset link is invalid or missing.
        </p>
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
            Enter your new password.
          </p>
        </div>

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
