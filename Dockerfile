# syntax=docker/dockerfile:1

# ============================================================
# 1. Dependencies
# ============================================================

FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && \
    corepack prepare pnpm@12.5.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

RUN pnpm config set ignore-scripts false && \
    pnpm install --frozen-lockfile


# ============================================================
# 2. Builder
# ============================================================

FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && \
    corepack prepare pnpm@12.5.1 --activate

# Reuse installed dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js
RUN --mount=type=secret,id=AUTH_SECRET,env=AUTH_SECRET \
    --mount=type=secret,id=DATABASE_URL,env=DATABASE_URL \
    --mount=type=secret,id=PRISMA_DATABASE_URL,env=PRISMA_DATABASE_URL \
    --mount=type=secret,id=SHADOW_DATABASE_URL,env=SHADOW_DATABASE_URL \
    --mount=type=secret,id=CLOUDINARY_CLOUD_NAME,env=CLOUDINARY_CLOUD_NAME \
    --mount=type=secret,id=CLOUDINARY_API_KEY,env=CLOUDINARY_API_KEY \
    --mount=type=secret,id=CLOUDINARY_API_SECRET,env=CLOUDINARY_API_SECRET \
    --mount=type=secret,id=CLOUDINARY_URL,env=CLOUDINARY_URL \
    --mount=type=secret,id=NEXT_PUBLIC_SITE_URL,env=NEXT_PUBLIC_SITE_URL \
    --mount=type=secret,id=NEXT_PUBLIC_SITE_URL_2,env=NEXT_PUBLIC_SITE_URL_2 \
    --mount=type=secret,id=NEXT_PUBLIC_RAZORPAY_KEY_ID,env=NEXT_PUBLIC_RAZORPAY_KEY_ID \
    --mount=type=secret,id=RAZORPAY_KEY_SECRET,env=RAZORPAY_KEY_SECRET \
    --mount=type=secret,id=RAZORPAY_WEBHOOK_SECRET,env=RAZORPAY_WEBHOOK_SECRET \
    --mount=type=secret,id=NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,env=NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY \
    --mount=type=secret,id=WEB_PUSH_PRIVATE_KEY,env=WEB_PUSH_PRIVATE_KEY \
    --mount=type=secret,id=WEB_PUSH_EMAIL,env=WEB_PUSH_EMAIL \
    --mount=type=secret,id=RESEND_API_KEY,env=RESEND_API_KEY \
    --mount=type=secret,id=EMAIL_FROM,env=EMAIL_FROM \
    --mount=type=secret,id=ADMIN_EMAIL,env=ADMIN_EMAIL \
    --mount=type=secret,id=UPSTASH_REDIS_REST_URL,env=UPSTASH_REDIS_REST_URL \
    --mount=type=secret,id=UPSTASH_REDIS_REST_TOKEN,env=UPSTASH_REDIS_REST_TOKEN \
    --mount=type=secret,id=BETTER_AUTH_SECRET,env=BETTER_AUTH_SECRET \
    --mount=type=secret,id=BETTER_AUTH_URL,env=BETTER_AUTH_URL \
    --mount=type=secret,id=NEXT_PUBLIC_APP_NAME,env=NEXT_PUBLIC_APP_NAME \
    --mount=type=secret,id=NEXT_PUBLIC_SUPPORT_EMAIL,env=NEXT_PUBLIC_SUPPORT_EMAIL \
    --mount=type=secret,id=NEXT_PUBLIC_GA_ID,env=NEXT_PUBLIC_GA_ID \
    --mount=type=secret,id=AUTH_TRUST_HOST,env=AUTH_TRUST_HOST \
    --mount=type=secret,id=AUTH_URL,env=AUTH_URL \
    pnpm run build


# ============================================================
# 3. Production Runner
# ============================================================

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PATH="/app/node_modules/.bin:$PATH"

RUN apk add --no-cache openssl libc6-compat

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs


# ------------------------------------------------------------
# Next.js standalone
# ------------------------------------------------------------

COPY --from=builder \
    /app/public ./public

COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/.next/standalone ./

COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/.next/static ./.next/static


# ------------------------------------------------------------
# Application runtime files
# ------------------------------------------------------------

# Required by Prisma seed and application runtime
# Contains:
#   lib/db.ts
#   lib/auth.ts
#   lib/generated/prisma/*
COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/lib ./lib


# ------------------------------------------------------------
# Prisma
# ------------------------------------------------------------

# Prisma schema + migrations
COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/prisma ./prisma

# Prisma 7 config
COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/prisma.config.ts ./prisma.config.ts


# ------------------------------------------------------------
# Reuse the already-installed dependencies from builder
# This includes Prisma CLI, Prisma engines and tsx.
# ------------------------------------------------------------

COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/node_modules ./node_modules


# ------------------------------------------------------------
# Runtime
# ------------------------------------------------------------

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]