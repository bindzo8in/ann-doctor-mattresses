"use client";
import * as z from "zod";
import { formSchema } from "@/lib/schema/signin-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import {
  Field,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Password } from "@/components/password";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { login } from "@/lib/actions/auth";
import { routes } from "@/lib/routes";
import Link from "next/link";

type Schema = z.infer<typeof formSchema>;

export function LoginForm({ callbackUrl = "/" }: { callbackUrl?: string }) {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const {
    formState: { isSubmitting },
  } = form;

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await login(data.email, data.password, callbackUrl);

      if (!result.success) {
        switch (result.code) {
          case "EMAIL_NOT_VERIFIED":
            toast.error(result.message);

            router.push(
              `${routes.verifyEmail}?email=${encodeURIComponent(
                result.email!,
              )}`,
            );
            return;

          case "ACCOUNT_DISABLED":
            toast.error(result.message);
            return;

          case "INVALID_CREDENTIALS":
            toast.error(result.message);
            return;

          default:
            toast.error("Something went wrong");
            return;
        }
      }
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: callbackUrl,
      });
    } catch (error) {
      console.error(error);
      // toast.error(String(error))
      toast.error("Something went wrong");
    }
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border max-w-3xl mx-auto"
    >
      <FieldGroup className="grid md:grid-cols-6 gap-4 mb-6">
        <h1 className="mt-6 mb-1 font-extrabold text-3xl tracking-tight col-span-full">
          Login
        </h1>
        <p className="tracking-wide text-muted-foreground mb-5 text-wrap text-sm col-span-full">
          Login to create an account
        </p>

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 col-span-full"
            >
              <FieldLabel htmlFor="email">Email </FieldLabel>
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
              className="gap-1 col-span-full"
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
        <Link
          href={routes.forgotPassword}
          className="text-sm text-primary text-nowrap hover:underline"
        >
          Forgot password?
        </Link>
        <FieldSeparator className="my-4 col-span-full">OR</FieldSeparator>
        <div className="flex gap-3 justify-center w-full items-center pb-3 col-span-full">
          <Button
            variant="outline"
            type="button"
            className="w-full text-sm font-medium"
            asChild
          >
            <Link href={routes.signup}>
              Create an account
            </Link>
          </Button>
        </div>
      </FieldGroup>
      <div className="flex justify-end items-center w-full">
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}
