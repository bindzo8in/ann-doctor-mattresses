"use client";

import * as z from "zod";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { forgotPasswordSchema } from "@/lib/forgot-password-schema";

type Schema = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
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
    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (
          result.code === "VALIDATION_ERROR" &&
          result.errors
        ) {
          Object.entries(result.errors).forEach(
            ([field, messages]) => {
              form.setError(field as keyof Schema, {
                message: Array.isArray(messages)
                  ? messages[0]
                  : String(messages),
              });
            }
          );

          return;
        }

        toast.error(
          result.message ??
            "Unable to send reset email."
        );

        return;
      }

      toast.success(result.message);

      form.reset();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");
    }
  });

  return (
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
            Enter your email address and we'll send
            you a password reset link.
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
  );
}