import * as z from "zod";

export interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  inputs?: T;
}

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/\d/, { message: "Password must contain at least one number" })
  .regex(/[^a-zA-Z0-9]/, {
    message: "Password must contain at least one special character",
  });

export const formSchema = z
  .object({
    name: z.string({ error: "This field is required" }).nonempty(),
    email: z.email({ error: "Please enter a valid email" }).nonempty(),
    password: passwordSchema,
    "confirm-password": passwordSchema,
    // "social-media-buttons": z.unknown(),
    agree: z.boolean().refine((value) => value === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data["confirm-password"], {
    message: "Passwords don't match",
    path: ["confirm-password"],
  });

export interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  inputs?: T;
}

export type SignupInput = z.infer<typeof formSchema>;
