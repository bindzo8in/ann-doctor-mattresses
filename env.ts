import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    AUTH_SECRET: z.string().nonempty(),
    RAZORPAY_KEY_SECRET: z.string().nonempty(),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().nonempty(),
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    WEB_PUSH_PRIVATE_KEY: z.string().min(1),
    WEB_PUSH_EMAIL: z.string().startsWith("mailto:"),
    /** Sender identity shown to email recipients, e.g. "Ann Doctor <info@doctormattresses.com>" */
    EMAIL_FROM: z.string().min(1),
    /** Admin inbox that receives contact/complaint notifications */
    ADMIN_EMAIL: z.email(),
    AUTH_TRUST_HOST: z.coerce.boolean().default(true),
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().nonempty(),
    NEXT_PUBLIC_SITE_URL: z.url(),
    NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY: z.string().min(1),
    // NEXT_PUBLIC_SITE_NAME: z.string(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    WEB_PUSH_PRIVATE_KEY: process.env.WEB_PUSH_PRIVATE_KEY,
    WEB_PUSH_EMAIL: process.env.WEB_PUSH_EMAIL,
    NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
});
