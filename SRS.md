# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

# Ann Doctor Mattresses Ecommerce & Order Management Platform

Version: 1.0
Prepared For: Ann Doctor Mattresses
Prepared By: Technical Product & Solution Architecture Consultant
Project Type: Ecommerce + Operational Order Management Platform
Geographic Scope: India
Deployment Model: Web-Based Platform

---

# 1. PROJECT OVERVIEW

## 1.1 Project Summary

Ann Doctor Mattresses requires a centralized ecommerce and order management platform for selling mattresses and sofas online while operational delivery handling remains manually coordinated by internal staff.

The platform is designed as a lightweight operational ecommerce system rather than a warehouse-driven enterprise commerce platform.

The system focuses on:

* Product showcase
* Customer ordering
* Online payment collection
* Centralized order handling
* Branch assignment
* Manual delivery coordination
* Operational visibility

The MVP prioritizes operational simplicity, low maintenance overhead, and fast deployment.

---

# 2. BUSINESS MODEL

## 2.1 Operational Business Structure

The business operates using a centralized order handling model.

### Operational Flow

1. Customer places order online
2. Payment collected online
3. Admin reviews order
4. Admin assigns nearest branch
5. Delivery coordinated manually
6. Admin updates delivery status
7. Customer receives updates

Branches are fulfillment locations only.

Branches do NOT independently:

* manage inventory
* process payments
* manage pricing
* operate autonomous workflows

---

# 3. MVP OBJECTIVES

## 3.1 Primary Goals

* Establish online ecommerce presence
* Simplify order management
* Centralize branch coordination
* Enable online payments
* Improve operational visibility
* Reduce manual communication confusion
* Enable delivery status tracking

---

## 3.2 MVP Priorities

### Launch Critical Features

* Ecommerce storefront
* Product catalog
* Cart & checkout
* Razorpay integration
* Admin dashboard
* Order management
* Branch assignment
* Delivery status updates
* Customer order tracking
* Email notifications

---

## 3.3 Operational Pain Points Solved

| Problem                        | Solution                    |
| ------------------------------ | --------------------------- |
| Manual order confusion         | Centralized order dashboard |
| Branch coordination issues     | Branch assignment system    |
| Customer status uncertainty    | Order status tracking       |
| Payment verification confusion | Razorpay verification       |
| Product visibility limitations | Ecommerce storefront        |

---

# 4. USER ROLES

## 4.1 Super Admin

Full platform access.

### Permissions

* Manage products
* Manage categories
* Manage homepage content
* Manage branches
* View all orders
* Assign branches
* Update order status
* Process refunds
* View reports
* Manage customers
* Configure platform settings

---

## 4.2 Customer

### Permissions

* Register/login
* Browse products
* Add to cart
* Place orders
* Make payments
* Track orders
* Manage profile
* Manage addresses

---

# 5. FUNCTIONAL REQUIREMENTS

# 5.1 Authentication & Authorization

## Features

* Email/password authentication
* JWT/session-based authentication
* Password hashing
* Password reset via email
* Protected admin routes
* Session expiration handling
* Role-based access control

## Security Requirements

* Secure HTTP-only cookies
* CSRF protection
* Rate limiting
* Login attempt throttling
* Input sanitization
* Audit logging for admin actions

---

# 5.2 Customer Module

## Features

### Registration & Login

* Customer registration
* Email login
* Forgot password
* Session management

### Profile Management

* Edit profile
* Manage addresses
* View order history

### Product Browsing

* Product listing
* Search functionality
* Category filtering
* Featured products
* Product detail pages

### Cart & Checkout

* Add/remove cart items
* Quantity updates
* Address selection
* Online payment
* Order confirmation

### Order Tracking

* View order status
* Delivery updates
* Payment status

---

# 5.3 Product Management

## Product Features

* Product CRUD
* Categories
* Subcategories
* Product images
* Product specifications
* SEO metadata
* Featured products
* Availability status

## Availability States

* Available
* Out of Stock
* Made to Order

---

# 5.4 Order Management

## Order Lifecycle

```text
PENDING_PAYMENT
PAYMENT_SUCCESS
PENDING_ASSIGNMENT
ASSIGNED
PROCESSING
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
REFUND_PENDING
REFUNDED
```

## Features

* Order listing
* Date filtering
* Branch assignment
* Payment tracking
* Order notes
* Delivery updates
* Refund management
* Invoice generation

---

# 5.5 Branch Management

## Features

* Create/edit branches
* Activate/deactivate branches
* Assign branch to orders
* View branch sales reports

## Branch Structure

Branches are operational entities only.

Branches do NOT have:

* login accounts
* inventory ownership
* independent management workflows

---

# 5.6 Delivery Management

## Delivery Model

Manual operational delivery workflow.

## Features

* Manual delivery assignment
* Status updates
* Delivery notes
* Customer communication tracking
* Dispatch status updates

## Delivery Statuses

```text
PENDING
ASSIGNED
PROCESSING
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

---

# 5.7 Payment System

## Payment Gateway

Razorpay integration.

## Features

* Razorpay order creation
* Payment verification
* Webhook handling
* Refund support
* Failed payment handling
* Payment reconciliation

## Security

Payment verification must happen server-side.

Frontend payment success cannot be trusted directly.

---

# 5.8 Admin Dashboard

## Dashboard Features

* Daily sales
* Pending orders
* Pending assignments
* Revenue overview
* Delivery pending summary
* Branch sales report

## Reports

### Required Reports

* Daily orders
* Date range sales
* Branch sales
* Pending deliveries
* Payment reconciliation

---

# 5.9 Notification System

## Notification Channels

### MVP

* Email notifications
* Admin alerts

## Notification Triggers

* Order placed
* Payment success
* Order assigned
* Delivery update
* Refund processed

---

# 6. NON-FUNCTIONAL REQUIREMENTS

# 6.1 Security

## Requirements

* HTTPS enforcement
* Password hashing
* CSRF protection
* XSS prevention
* SQL injection prevention
* Rate limiting
* Secure session management
* Role-based access control

---

# 6.2 Performance

## Targets

| Metric           | Target            |
| ---------------- | ----------------- |
| Page Load        | < 3 seconds       |
| API Response     | < 500ms average   |
| Concurrent Users | 100-300 initially |

## Optimization

* Image optimization
* Lazy loading
* CDN caching
* Query indexing
* Pagination

---

# 6.3 Scalability

## Scalability Considerations

* Horizontal frontend scaling possible
* Database indexing
* CDN support
* Redis optional later
* Queue support for notifications later

---

# 6.4 Reliability

## Requirements

* Daily database backup
* Rollback support
* Error logging
* Uptime monitoring
* Transaction logging

---

# 6.5 Monitoring

## Monitoring Stack

* Server monitoring
* Error tracking
* API logging
* Admin activity logs
* Payment logs

---

# 7. TECHNICAL ARCHITECTURE

# 7.1 Recommended Stack

## Frontend

* Next.js App Router
* TypeScript
* Tailwind CSS
* Shadcn UI

## Backend

* Next.js Route Handlers
* Server Actions

## Database

* PostgreSQL
* Prisma ORM

## Authentication

* Auth.js / NextAuth

## Media Storage

* Cloudinary

## Payments

* Razorpay

## Hosting

* VPS
* PM2
* Nginx

---

# 7.2 Architecture Pattern

```text
Client Browser
      ↓
Next.js Frontend
      ↓
Server Actions / API Routes
      ↓
PostgreSQL Database
      ↓
Cloudinary / Razorpay
```

---

# 8. DATABASE DESIGN

# 8.1 Core Entities

## Tables

```text
users
addresses
branches
categories
products
product_images
orders
order_items
payments
delivery_updates
notifications
```

---

# 8.2 Important Relationships

## Relationships

* User → Orders
* Order → Order Items
* Order → Payment
* Order → Assigned Branch
* Product → Category
* Product → Images

---

# 8.3 Audit Fields

All major tables should contain:

```text
created_at
updated_at
deleted_at
created_by
updated_by
```

---

# 9. API DESIGN

# 9.1 API Standards

## Conventions

* RESTful architecture
* JSON responses
* JWT authentication
* Versioned APIs

Example:

```text
/api/v1/products
```

---

# 9.2 Authentication APIs

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

---

# 9.3 Product APIs

```text
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id
```

---

# 9.4 Order APIs

```text
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/:id
PUT    /api/v1/orders/:id/status
PUT    /api/v1/orders/:id/assign-branch
```

---

# 9.5 Payment APIs

```text
POST   /api/v1/payments/create-order
POST   /api/v1/payments/verify
POST   /api/v1/payments/webhook
POST   /api/v1/payments/refund
```

---

# 10. WORKFLOW DIAGRAMS

# 10.1 Customer Order Flow

```text
Customer Browses Products
        ↓
Add To Cart
        ↓
Checkout
        ↓
Payment Success
        ↓
Order Created
        ↓
Admin Reviews Order
        ↓
Branch Assigned
        ↓
Delivery Process
        ↓
Delivered
```

---

# 10.2 Branch Assignment Flow

```text
Order Created
      ↓
Pending Assignment
      ↓
Admin Reviews Address
      ↓
Nearest Branch Assigned
      ↓
Order Processing Starts
```

---

# 10.3 Payment Flow

```text
Customer Checkout
      ↓
Razorpay Order Created
      ↓
Payment Completed
      ↓
Server Verification
      ↓
Payment Stored
      ↓
Order Confirmed
```

---

# 10.4 Delivery Flow

```text
Order Assigned
      ↓
Admin Coordinates Delivery
      ↓
Delivery Scheduled
      ↓
Out For Delivery
      ↓
Delivered
```

---

# 10.5 Refund Flow

```text
Refund Requested
      ↓
Admin Reviews
      ↓
Refund Approved
      ↓
Razorpay Refund Triggered
      ↓
Customer Notified
```

---

# 11. FUTURE ENHANCEMENTS

The following features are intentionally excluded from MVP.

## Possible Future Scope

* Branch login system
* Inventory management
* Warehouse module
* Courier integrations
* Live tracking
* WhatsApp notifications
* Mobile applications
* Loyalty system
* ERP integration
* Accounting integration
* Advanced analytics
* Franchise management

---

# 12. OUT OF SCOPE

## Explicitly Excluded From MVP

* Real-time GPS tracking
* Multi-vendor marketplace
* Automated warehouse systems
* AI recommendations
* Advanced ERP
* Native mobile apps
* Complex inventory engine
* Automated logistics integrations
* Multi-country taxation systems

---

# 13. RISKS & OPERATIONAL CONSIDERATIONS

| Risk                         | Impact               | Mitigation               |
| ---------------------------- | -------------------- | ------------------------ |
| Admin bottleneck             | Order delays         | Dashboard alerts         |
| Manual delivery coordination | Update inconsistency | Required status workflow |
| Payment disputes             | Customer complaints  | Server-side verification |
| Branch communication issues  | Delivery delays      | Centralized notes        |
| Image-heavy platform         | Storage cost growth  | Cloudinary optimization  |

---

# 14. ASSUMPTIONS & DEPENDENCIES

## Assumptions

* Admin manages all operations
* Branches are fulfillment units only
* Deliveries handled manually
* Payments online only
* Product catalog managed internally

## Dependencies

* Razorpay availability
* Cloudinary availability
* VPS uptime
* Email provider availability

---

# 15. TESTING STRATEGY

## Testing Types

### Unit Testing

* Utility functions
* Validation logic
* Payment verification

### API Testing

* Authentication APIs
* Product APIs
* Order APIs

### Integration Testing

* Payment flow
* Checkout flow
* Admin workflow

### UAT

* Order placement
* Payment verification
* Delivery updates
* Refund handling

---

# 16. DEPLOYMENT & MAINTENANCE

# 16.1 Deployment Workflow

```text
Development
    ↓
Staging
    ↓
Production Deployment
```

---

# 16.2 Server Setup

## Production Stack

* Ubuntu VPS
* PM2 process manager
* Nginx reverse proxy
* SSL certificate
* Automated backups

---

# 16.3 Maintenance Strategy

* Weekly dependency updates
* Daily DB backups
* Error monitoring
* SSL renewal monitoring
* Monthly performance review

---

# 17. MVP DEVELOPMENT TIMELINE

# Total Estimated Timeline: 8–10 Weeks

---

# Phase 1 — Project Setup & Architecture (Week 1)

## Tasks

* Repository setup
* Next.js architecture setup
* Database schema design
* Prisma integration
* Authentication setup
* UI foundation
* Admin layout structure

### Deliverables

* Base architecture
* Auth system
* Database setup
* Initial UI structure

---

# Phase 2 — Ecommerce Frontend (Week 2–3)

## Tasks

* Homepage
* Product listing
* Product detail pages
* Search/filter
* Cart system
* Customer authentication
* Address management

### Deliverables

* Fully functional storefront
* Customer workflows

---

# Phase 3 — Checkout & Payments (Week 4)

## Tasks

* Checkout flow
* Razorpay integration
* Payment verification
* Order creation
* Email confirmations

### Deliverables

* Complete payment flow

---

# Phase 4 — Admin Dashboard (Week 5–6)

## Tasks

* Product management
* Category management
* Order management
* Branch assignment
* Dashboard analytics
* Customer management

### Deliverables

* Operational admin system

---

# Phase 5 — Delivery & Reporting (Week 7)

## Tasks

* Delivery status system
* Order tracking
* Reporting module
* Date range filters
* Branch sales reporting

### Deliverables

* Delivery workflow
* Reporting dashboard

---

# Phase 6 — Testing & Optimization (Week 8)

## Tasks

* Bug fixing
* Security testing
* Payment testing
* Performance optimization
* SEO optimization
* Responsive testing

### Deliverables

* Production-ready system

---

# Optional Buffer (Week 9–10)

Reserved for:

* client revisions
* deployment fixes
* production stabilization
* content updates
* operational adjustments

---

# 18. FINAL RECOMMENDATION

This project should remain:

* operationally simple
* centrally managed
* ecommerce-focused
* manually coordinated

The system should prioritize:

* order visibility
* admin efficiency
* customer clarity
* low maintenance overhead

Avoid unnecessary enterprise complexity during MVP.

The architecture should evolve only after operational scale justifies additional systems.
