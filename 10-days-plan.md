# FINAL 10-DAY EXECUTION PLAN

## Mattress Ecommerce + Admin System (MVP)

This is the locked scope.
Do NOT add features outside this document.

---

# FINAL TECH STACK

## Frontend

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui

---

## Backend

* Next.js Route Handlers
* Server Actions
* Prisma ORM
* PostgreSQL

---

## Authentication

* [Auth.js](https://authjs.dev?utm_source=chatgpt.com)

---

## Storage

* [Cloudinary](https://cloudinary.com?utm_source=chatgpt.com)

---

## Deployment

* [Vercel](https://vercel.com?utm_source=chatgpt.com)
* [Neon](https://neon.tech?utm_source=chatgpt.com) or [Supabase](https://supabase.com?utm_source=chatgpt.com)

---

# FINAL MVP FEATURES

# CUSTOMER FEATURES

## Pages

* Home Page
* Products Page
* Product Details Page
* Cart Page
* Checkout Page
* Login/Register
* Profile/Orders

---

## Functionalities

* Browse products
* Filter by category
* Add to cart
* Place order
* View order history

---

# SUPER ADMIN FEATURES

## Dashboard

* overview cards
* recent orders

---

## Category Management

* create
* update
* delete

---

## Product Management

* create
* update
* delete
* image upload
* activate/deactivate

---

## Order Management

* view orders
* assign branch
* update status

---

# BRANCH ADMIN FEATURES

## Dashboard

* assigned orders only

---

## Order Actions

* update processing status
* mark delivered

---

# FEATURES REMOVED (DO NOT BUILD)

## STRICTLY OUT OF SCOPE

* inventory management
* payment gateway
* delivery tracking APIs
* coupons
* wishlist
* reviews
* notifications
* analytics
* SEO optimization
* CRM
* WhatsApp automation
* invoice PDFs
* email automation
* multi-vendor
* advanced search
* AI features

---

# FINAL DATABASE STRUCTURE

# User

```prisma
model User {
  id          String   @id @default(cuid())
  name        String?
  email       String   @unique
  password    String
  role        UserRole @default(CUSTOMER)
  branchId    String?
  branch      Branch?  @relation(fields: [branchId], references: [id])

  orders      Order[]

  createdAt   DateTime @default(now())
}
```

---

# Branch

```prisma
model Branch {
  id        String  @id @default(cuid())
  name      String
  location  String

  users     User[]
  orders    Order[]
}
```

---

# Category

```prisma
model Category {
  id        String    @id @default(cuid())
  name      String
  slug      String    @unique

  products  Product[]
}
```

---

# Product

```prisma
model Product {
  id          String   @id @default(cuid())

  name        String
  slug        String   @unique

  description String
  price       Float

  images      String[]

  isActive    Boolean  @default(true)

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  createdAt   DateTime @default(now())
}
```

---

# Order

```prisma
model Order {
  id           String      @id @default(cuid())

  customerId   String
  customer     User        @relation(fields: [customerId], references: [id])

  branchId     String?
  branch       Branch?     @relation(fields: [branchId], references: [id])

  status       OrderStatus @default(PENDING)

  totalAmount  Float

  address      String
  phone        String
  notes        String?

  items        OrderItem[]

  createdAt    DateTime @default(now())
}
```

---

# OrderItem

```prisma
model OrderItem {
  id          String  @id @default(cuid())

  orderId     String
  order       Order   @relation(fields: [orderId], references: [id])

  productId   String
  product     Product @relation(fields: [productId], references: [id])

  quantity    Int
  price       Float
}
```

---

# ENUMS

```prisma
enum UserRole {
  SUPER_ADMIN
  BRANCH_ADMIN
  CUSTOMER
}

enum OrderStatus {
  PENDING
  ASSIGNED
  PROCESSING
  DELIVERED
  CANCELLED
}
```

---

# FINAL PROJECT STRUCTURE

```txt
app/
  (store)/
  admin/
  branch/
  api/

components/
  ui/
  store/
  admin/
  branch/

lib/
actions/
hooks/
types/
prisma/
```

---

# FINAL AUTH PLAN

## Auth.js

Use:

* Credentials Provider
* JWT Sessions

---

## Middleware Protection

Protect:

```txt
/admin/*
/branch/*
```

---

## Role Access

### SUPER_ADMIN

* full access

### BRANCH_ADMIN

* branch routes only

### CUSTOMER

* store only

---

# DAY-BY-DAY EXECUTION PLAN

# DAY 1 — FOUNDATION

# Goals

* setup entire project
* DB connected
* auth working

---

# Tasks

## Setup

* [x] create Next.js app
* [x] setup Tailwind
* [x] setup shadcn/ui
* [x] setup Prisma
* [x] setup PostgreSQL
* [x] setup Auth.js
* [x] setup Cloudinary

---

## Database

* [x] create Prisma schema
* [x] run migrations
* [ ] seed admin user

---

## Authentication

* [x] login page
* [x] register page
* [x] JWT sessions
* [x] middleware protection
* [ ] role-based redirects

---

## Layouts

* [ ] store layout
* [ ] admin layout
* [ ] branch layout

---

# DAY 2 — ADMIN FOUNDATION

# Goals

* admin dashboard ready
* category CRUD complete

---

# Tasks

## Admin UI

* [ ] sidebar
* [ ] topbar
* [ ] dashboard cards

---

## Category CRUD

* [ ] create category
* [ ] edit category
* [ ] delete category
* [ ] category table

---

## Access Control

* [ ] admin-only protection
* [ ] branch restriction

---

# DAY 3 — PRODUCT CRUD

# Goals

* full product management

---

# Tasks

## Product CRUD

* [ ] create product
* [ ] edit product
* [ ] delete product
* [ ] activate/deactivate product

---

## Product Form

* [ ] image upload
* [ ] category select
* [ ] validation

---

## Product Table

* [ ] pagination
* [ ] search
* [ ] status badge

---

# DAY 4 — STORE FRONTEND

# Goals

* customer frontend working

---

# Tasks

## Store Pages

* [ ] homepage
* [ ] products page
* [ ] product details page
* [ ] category filtering

---

## Components

* [ ] navbar
* [ ] footer
* [ ] product card
* [ ] category section

---

## UI

* [ ] responsive layout
* [ ] loading states
* [ ] empty states

---

# DAY 5 — CART + CHECKOUT

# Goals

* order creation flow complete

---

# Tasks

## Cart

* [ ] Zustand store
* [ ] add/remove items
* [ ] quantity update

---

## Checkout

* [ ] address form
* [ ] phone field
* [ ] notes field

---

## Order Creation

* [ ] create order
* [ ] create order items
* [ ] clear cart after order

---

# DAY 6 — ORDER MANAGEMENT

# Goals

* admin order system complete

---

# Tasks

## Orders Table

* [ ] list orders
* [ ] customer details
* [ ] status badges

---

## Order Details

* [ ] order items
* [ ] total amount
* [ ] customer info

---

## Branch Assignment

* [ ] assign branch
* [ ] update order status

---

# DAY 7 — BRANCH ADMIN PANEL

# Goals

* branch workflow operational

---

# Tasks

## Branch Dashboard

* [ ] assigned orders only
* [ ] filtering by status

---

## Order Actions

* [ ] mark processing
* [ ] mark delivered

---

## Restrictions

* [ ] branch cannot access others' orders

---

# DAY 8 — POLISH + FIXES

# Goals

* production usability

---

# Tasks

## Validation

* [ ] zod validation
* [ ] form validation
* [ ] error messages

---

## UX Improvements

* [ ] toast messages
* [ ] skeleton loaders
* [ ] loading buttons

---

## Mobile

* [ ] responsive fixes
* [ ] spacing fixes
* [ ] table responsiveness

---

# DAY 9 — TESTING + DEPLOYMENT

# Goals

* production deployment complete

---

# Tasks

## Deployment

* [ ] deploy frontend
* [ ] connect DB
* [ ] setup env vars
* [ ] configure Cloudinary

---

## Testing

* [ ] login flow
* [ ] register flow
* [ ] product CRUD
* [ ] cart flow
* [ ] checkout flow
* [ ] order management
* [ ] branch assignment
* [ ] role protection

---

# DAY 10 — BUFFER + CLIENT CHANGES

# Goals

* stabilize project

---

# Tasks

## Bug Fixes

* [ ] production bug fixes
* [ ] deployment fixes
* [ ] UI cleanup

---

## Client Requests

* [ ] only small changes
* [ ] no major features

---

# FINAL DEVELOPMENT RULES

# RULE 1

Do NOT redesign pages repeatedly.

---

# RULE 2

Do NOT refactor working code during the 10 days.

---

# RULE 3

Do NOT add new features after Day 3.

---

# RULE 4

Focus on:

* working flow
* stable functionality
* decent UI

NOT perfection.

---

# RULE 5

Every day must end with:

* committed code
* deployed preview
* working feature

No exceptions.

---

# FINAL REALITY CHECK

This is achievable in 10 days IF:

* you stay disciplined
* you avoid perfectionism
* you stop changing architecture
* you stop chasing fancy UI ideas

The project itself is not hard.

Scope control is the real challenge.
