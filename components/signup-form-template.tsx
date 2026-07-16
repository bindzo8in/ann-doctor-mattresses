"use client";
import * as z from "zod";
import { formSchema } from "@/lib/schema/signup-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { motion } from "motion/react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import {
  Field,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Password } from "@/components/password";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { routes } from "@/lib/routes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type Schema = z.infer<typeof formSchema>;

export function SignupForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");
  const [apiCode, setApiCode] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const form = useForm<Schema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      "confirm-password": "",
      name: "",
      email: "",
      password: "",
      agree: false,
    },
  });

  const {
    formState: { isSubmitting, isSubmitSuccessful },
  } = form;

  const handleSubmit = form.handleSubmit(async (data: Schema) => {
    setApiError("");
    setApiCode("");

    try {
      const { error } = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      })
      if (error) {
        setApiError(error?.message || error.statusText)
      }

      setMessage(
        `If this email is not already registered, an account has been created. Please check your inbox for verification.`
      );

      form.reset();
    } catch (error) {

    }

  }
  );

  return (
    <>
      {message && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            {message}
          </AlertDescription>
        </Alert>
      )}
      <form
        onSubmit={handleSubmit}
        className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border max-w-3xl mx-auto"
      >
        <FieldGroup className="grid md:grid-cols-6 gap-4 mb-6">
          <h1 className="mt-6 mb-1 font-extrabold text-3xl tracking-tight col-span-full">
            Sign Up
          </h1>
          <p className="tracking-wide text-muted-foreground mb-5 text-wrap text-sm col-span-full">
            You need an account to get started
          </p>

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="name">Your Name *</FieldLabel>
                <Input
                  {...field}
                  id="name"
                  type="text"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your Name"
                />

                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="email">Email *</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="text"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your Email"
                />

                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full md:col-span-3"
              >
                <FieldContent className="gap-0.5">
                  <FieldLabel htmlFor="password">Password *</FieldLabel>
                </FieldContent>
                <Password
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="password"
                  placeholder="Password"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="confirm-password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full md:col-span-3"
              >
                <FieldContent className="gap-0.5">
                  <FieldLabel htmlFor="confirm-password">
                    Confirm Password *
                  </FieldLabel>
                </FieldContent>
                <Password
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="confirm-password"
                  placeholder="Confirm Password"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="agree"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Checkbox
                    id="agree"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldLabel htmlFor="agree">
                    I agree to the terms and conditions *
                  </FieldLabel>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <FieldSeparator className="my-4 col-span-full">OR</FieldSeparator>
          <div className="flex gap-3 justify-center w-full items-center pb-3 col-span-full">
            <Button
              variant="outline"
              type="button"
              className="w-full text-sm font-medium"
              asChild
            >
              <Link href={routes.login} scroll>
                Log in to existing account
              </Link>
            </Button>
          </div>

        </FieldGroup>

        {apiError && (
          <div className="col-span-full rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">{apiError}</p>

            {apiCode === "EMAIL_NOT_VERIFIED" && (
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={async () => {
                  await fetch("/api/auth/resend-verification", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      email: userEmail,
                    }),
                  });
                }}
              >
                Resend Verification Email
              </Button>
            )}
          </div>
        )}

        <div className="flex justify-end items-center w-full">
          <Button disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </>

  );
}
