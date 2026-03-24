# Happy Shisha Booking Platform — Design Spec

**Date:** 2026-03-24
**Status:** Approved
**Author:** Claude Code (brainstorming session)

---

## 1. Overview

A standalone booking platform for Happy Shisha, deployed at `booking.happyshisha.co.za`. Customers can browse packages, check availability, and submit booking requests. Staff manage bookings via a protected admin dashboard and manually send Yoco payment links on confirmation. The existing marketing site (`happyshisha.co.za`) is left completely untouched.

---

## 2. Architecture

### Two independent apps, one AWS account

| App | URL | Stack |
|---|---|---|
| Marketing site | `happyshisha.co.za` | React + Vite (existing, unchanged) |
| Booking platform | `booking.happyshisha.co.za` | Next.js 14 App Router + AWS Amplify |

### Booking platform structure

```
booking-platform/
├── app/
│   ├── (public)/               # Customer-facing booking flow
│   │   ├── page.tsx            # Package selection
│   │   ├── book/page.tsx       # Date, time, details form
│   │   └── confirmation/page.tsx
│   ├── admin/                  # Protected dashboard (Cognito)
│   │   ├── page.tsx            # Booking list
│   │   ├── bookings/[id]/page.tsx
│   │   └── packages/page.tsx
│   └── api/
│       ├── packages/route.ts
│       ├── availability/route.ts
│       ├── book/route.ts
│       ├── confirm/route.ts
│       ├── contact/route.ts
│       └── admin/
│           ├── bookings/route.ts
│           ├── bookings/[id]/route.ts
│           └── packages/route.ts
├── components/
├── lib/
│   ├── dynamo.ts               # DynamoDB client
│   ├── calendar.ts             # Google Calendar client
│   ├── email.ts                # Nodemailer/SMTP client
│   └── auth.ts                 # Cognito helpers
└── infra/                      # OpenTofu modules
```

---

## 3. Data Model (DynamoDB)

### Table: `bookings`

| Attribute | Type | Notes |
|---|---|---|
| `bookingId` | String (PK) | UUID |
| `createdAt` | String (SK) | ISO 8601 timestamp |
| `name` | String | Customer full name |
| `email` | String | Customer email |
| `phone` | String | Customer phone |
| `address` | String | Event location |
| `packageId` | String | Reference to packages table |
| `date` | String | YYYY-MM-DD |
| `preferredTime` | String | e.g. "18:00" |
| `notes` | String? | Optional |
| `status` | String | `PENDING` \| `CONFIRMED` \| `PAID` |
| `paymentLink` | String? | Yoco link, set on confirmation |
| `calendarEventId` | String? | Google Calendar event ID |

**GSI:** `status-createdAt-index` — for admin dashboard filtering by status.

### Table: `packages`

| Attribute | Type | Notes |
|---|---|---|
| `packageId` | String (PK) | UUID |
| `name` | String | e.g. "Premium Package" |
| `description` | String | |
| `price` | Number | ZAR |
| `duration` | String | e.g. "4 hours" |
| `includedItems` | List\<String\> | |
| `active` | Boolean | Soft delete / hide from booking flow |

No users table — Cognito manages admin identity. No customer accounts.

---

## 4. Customer Booking Flow

### Step 1 — Package Selection (`/`)
- Grid of active packages fetched from `GET /api/packages`
- Each card: name, description, price, duration, included items
- Clicking a package proceeds to booking

### Step 2 — Date & Time (`/book?package=xxx`)
- Date picker; on selection calls `GET /api/availability?date=YYYY-MM-DD`
- Unavailable dates (blocked in Google Calendar) are disabled
- Customer enters preferred start time

### Step 3 — Details Form (`/book?package=xxx&date=xxx`)
- Fields: name, email, phone, address (event location), optional notes
- Submit calls `POST /api/book`

### On submit (server-side)
1. Validate all inputs
2. Re-check availability server-side
3. Write booking to DynamoDB with status `PENDING`
4. Create tentative full-day Google Calendar event
5. Send acknowledgement email to customer
6. Send booking notification email to admin
7. Redirect to `/confirmation?id=xxx`

### Step 4 — Confirmation Page (`/confirmation?id=xxx`)
- "Booking request received" with booking summary
- No payment at this stage

---

## 5. Admin Dashboard (`/admin`)

### Auth
- Cognito User Pool (email/password, admin users only)
- Next.js middleware protects all `/admin/*` routes
- Unauthenticated requests redirect to Cognito hosted UI

### Pages

**`/admin`** — Booking list
- All bookings sorted by date, newest first
- Filter tabs: All / Pending / Confirmed / Paid
- Status badges: `PENDING` (amber), `CONFIRMED` (blue), `PAID` (green)
- Columns: customer name, package, date, preferred time, status, actions

**`/admin/bookings/[id]`** — Booking detail
- Full customer info + package summary
- Actions by status:
  - `PENDING` → "Confirm Booking" (modal to paste Yoco link)
  - `CONFIRMED` → "Mark as Paid"
  - Any → "Cancel Booking"

**Confirm flow:**
1. Staff clicks "Confirm Booking"
2. Modal: paste Yoco payment link
3. Submit → `POST /api/confirm`
4. DynamoDB status → `CONFIRMED`, payment link stored
5. Confirmation + payment link email sent to customer
6. Google Calendar event updated (tentative → confirmed)

**`/admin/packages`** — Package management
- List all packages (including inactive)
- Create / edit / toggle active

---

## 6. API Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/packages` | GET | Public | List active packages |
| `/api/availability` | GET | Public | Check Google Calendar for a date |
| `/api/book` | POST | Public | Create booking, send emails, block calendar |
| `/api/confirm` | POST | Cognito | Confirm booking, send payment email |
| `/api/contact` | POST | Public | Contact form (migrated from existing Lambda) |
| `/api/admin/packages` | GET/POST/PUT | Cognito | Package CRUD |
| `/api/admin/bookings` | GET | Cognito | List all bookings |
| `/api/admin/bookings/[id]` | PUT | Cognito | Update booking status |

**Rate limiting:** `/api/book` and `/api/contact` — simple in-memory rate limiter or Amplify WAF rule.

---

## 7. Email (Nodemailer / SMTP)

Replaces the existing AWS Lambda contact handler. All email sent inline from Next.js API routes.

**SMTP credentials (from SSM Parameter Store):**
- Host: `www74.cpt1.host-h.net`
- Port: `465`
- Secure: `true` (SSL)
- User: `jaylene@happyevents.co.za`

### Email triggers

| Trigger | Recipients | Content |
|---|---|---|
| Booking submitted | Customer + admin | Booking details, status: pending |
| Booking confirmed | Customer | Confirmation + Yoco payment link |
| Contact form submitted | Admin | Enquiry details |
| Contact form submitted | Customer | Auto-responder (preserved from Lambda) |

Email templates use HTML with the Happy Shisha logo (inline CID attachment), matching existing Lambda template style.

---

## 8. Google Calendar Integration

- **New dedicated calendar** created for bookings (calendar ID stored in SSM)
- **Service account** credentials stored in SSM Parameter Store as JSON
- **Full-day events** — each confirmed booking blocks the entire day

### Logic
- `GET /api/availability?date=YYYY-MM-DD` — checks for any full-day events on that date
- `POST /api/book` — creates tentative full-day event on booking submission
- `POST /api/confirm` — updates event to confirmed status (title updated)
- Overlap check prevents double-bookings server-side

---

## 9. Infrastructure (OpenTofu)

**New module: `infra/booking-platform/`** (separate from existing `infra/` contact Lambda)

### Resources

```hcl
# DynamoDB
aws_dynamodb_table.bookings          # + GSI: status-createdAt
aws_dynamodb_table.packages

# Cognito
aws_cognito_user_pool.admin
aws_cognito_user_pool_client.nextjs

# SSM Parameter Store
aws_ssm_parameter.smtp_host
aws_ssm_parameter.smtp_port
aws_ssm_parameter.smtp_user
aws_ssm_parameter.smtp_pass          # migrated from variables.tf (was plaintext)
aws_ssm_parameter.google_credentials # JSON service account key

# Amplify
aws_amplify_app.booking
aws_amplify_branch.main
aws_amplify_domain_association.booking  # booking.happyshisha.co.za

# IAM
aws_iam_role.amplify_ssr             # DynamoDB read/write + SSM read
```

**AWS region:** `eu-west-1`
**AWS profile:** `alex`

### Existing infra
The existing Lambda + API Gateway (`infra/`) remains in place until the new platform is live and verified, then decommissioned via `tofu destroy -target`.

---

## 10. Security

- Admin routes protected by Cognito JWT validation in Next.js middleware
- All API inputs validated server-side (zod)
- SMTP password migrated from plaintext `variables.tf` to SSM SecureString
- Google Calendar service account scoped to calendar read/write only
- Rate limiting on public booking and contact endpoints
- CORS restricted to `booking.happyshisha.co.za`

---

## 11. Branding

- Matches Happy Shisha color palette (charcoal, amber, smoke, soft-white) from existing `tailwind.config.js`
- Premium / luxury feel
- Mobile-first responsive design
- Minimal steps in booking flow

---

## 12. Out of Scope (Phase 1)

- Automated Yoco payment verification
- SMS / WhatsApp notifications
- Customer accounts / portal
- Automated reminders
- Real-time availability calendar UI
- Changes to the existing marketing site

---

## 13. Migration

- Existing AWS Lambda (`happy-shisha-contact`) decommissioned after new `/api/contact` route is live and verified
- SMTP credentials migrated to SSM Parameter Store (no longer in `variables.tf`)
- New Tofu module independent of existing infra module
