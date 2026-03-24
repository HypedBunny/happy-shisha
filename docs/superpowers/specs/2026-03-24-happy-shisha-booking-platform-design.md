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
| `bookingId` | String (PK) | UUID — sole key, no SK |
| `createdAt` | String | ISO 8601 timestamp (regular attribute) |
| `name` | String | Customer full name |
| `email` | String | Customer email |
| `phone` | String | Customer phone |
| `address` | String | Event location |
| `packageId` | String | Reference to packages table |
| `date` | String | YYYY-MM-DD |
| `preferredTime` | String | e.g. "18:00" |
| `notes` | String? | Optional |
| `status` | String | `PENDING` \| `CONFIRMED` \| `PAID` \| `CANCELLED` |
| `paymentLink` | String? | Yoco link, set on confirmation |
| `calendarEventId` | String? | Google Calendar event ID |

**GSI:** `status-createdAt-index` — for admin dashboard filtering by status.

Single-item lookup uses `GetItem` with `bookingId` as the sole PK. `createdAt` is stored as a regular attribute, not part of the key.

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
| `displayOrder` | Number | Controls display order in customer UI and admin list |

No users table — Cognito manages admin identity. No customer accounts.

---

## 4. Customer Booking Flow

### Step 1 — Package Selection (`/`)
- Grid of active packages fetched from `GET /api/packages`, sorted by `displayOrder`
- Each card: name, description, price, duration, included items
- Clicking a package proceeds to booking

### Step 2 — Date & Time (`/book?package=xxx`)
- Date picker; on selection calls `GET /api/availability?date=YYYY-MM-DD`
- Unavailable dates (blocked in Google Calendar **or** with existing `PENDING`/`CONFIRMED` booking in DynamoDB) are disabled
- Customer enters preferred start time

### Step 3 — Details Form (`/book?package=xxx&date=xxx`)
- Fields: name, email, phone, address (event location), optional notes
- Submit calls `POST /api/book`

### On submit (server-side)
1. Validate all inputs (zod)
2. Re-check availability server-side: query DynamoDB for existing `PENDING`/`CONFIRMED` bookings on the date **and** check Google Calendar (if Calendar is unreachable, fall back to DynamoDB check alone and proceed)
3. If date is taken → return 409 with user-facing message: "Sorry, this date is no longer available."
4. Write booking to DynamoDB with status `PENDING`
5. Create tentative full-day Google Calendar event (if Calendar unreachable, log error, continue — event can be added manually)
6. Send acknowledgement email to customer (fire-and-forget: booking proceeds regardless of email success; failures logged server-side)
7. Send booking notification email to admin (fire-and-forget)
8. Redirect to `/confirmation?id=xxx`

### Step 4 — Confirmation Page (`/confirmation?id=xxx`)
- "Booking request received" with booking summary
- No payment at this stage

---

## 5. Admin Dashboard (`/admin`)

### Auth
- Cognito User Pool (email/password, admin users only)
- Next.js middleware protects all `/admin/*` routes — Cognito JWT validated on every request
- Unauthenticated requests redirect to Cognito hosted UI

### Pages

**`/admin`** — Booking list
- All bookings sorted by date, newest first
- Filter tabs: All / Pending / Confirmed / Paid / Cancelled
- Status badges: `PENDING` (amber), `CONFIRMED` (blue), `PAID` (green), `CANCELLED` (grey)
- Columns: customer name, package, date, preferred time, status, actions

**`/admin/bookings/[id]`** — Booking detail
- Full customer info + package summary
- Actions by status:
  - `PENDING` → "Confirm Booking" (modal to paste Yoco link)
  - `CONFIRMED` → "Mark as Paid"
  - `PENDING` or `CONFIRMED` → "Cancel Booking"

**Confirm flow:**
1. Staff clicks "Confirm Booking"
2. Modal: paste Yoco payment link
3. Submit → `PUT /api/admin/bookings/[id]` with `{ status: "CONFIRMED", paymentLink: "..." }`
4. DynamoDB status → `CONFIRMED`, payment link stored
5. Confirmation + payment link email sent to customer (fire-and-forget)
6. Google Calendar event title updated to reflect confirmed status

**Cancel flow:**
1. Staff clicks "Cancel Booking"
2. Confirmation prompt: "Are you sure?"
3. Submit → `PUT /api/admin/bookings/[id]` with `{ status: "CANCELLED" }`
4. DynamoDB status → `CANCELLED`
5. Google Calendar event deleted (if `calendarEventId` exists; if Calendar unreachable, log error)
6. Cancellation email sent to customer (fire-and-forget, only if status was `CONFIRMED`)

**`/admin/packages`** — Package management
- List all packages sorted by `displayOrder` (including inactive)
- Create / edit / toggle active / reorder (`displayOrder`)

---

## 6. API Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/packages` | GET | Public | List active packages, sorted by `displayOrder` |
| `/api/availability` | GET | Public | Check availability for a date (Calendar + DynamoDB) |
| `/api/book` | POST | Public | Create booking, send emails, block calendar |
| `/api/contact` | POST | Public | Contact form (migrated from existing Lambda) |
| `/api/admin/packages` | GET/POST/PUT | Cognito | Package CRUD |
| `/api/admin/bookings` | GET | Cognito | List all bookings |
| `/api/admin/bookings/[id]` | PUT | Cognito | Update booking status (confirm, mark paid, cancel) |

All status transitions (confirm, mark paid, cancel) go through `PUT /api/admin/bookings/[id]`. No separate `/api/confirm` route — the `PUT` endpoint handles all booking state changes with the appropriate side-effects (email, calendar update) based on the target status in the request body.

**Rate limiting:** `/api/book` and `/api/contact` rate-limited via AWS WAF rule on the Amplify app (WAF WebACL attached to the Amplify distribution). Rate limit: 20 requests per IP per 5-minute window. Violations return HTTP 429. WAF resource managed in OpenTofu.

---

## 7. Email (Nodemailer / SMTP)

Replaces the existing AWS Lambda contact handler. All email sent inline from Next.js API routes. All email sends are **fire-and-forget**: the booking/confirm action completes regardless of email delivery success. SMTP failures are logged server-side (Amplify CloudWatch logs).

**SMTP credentials (from SSM Parameter Store):**
- Host: `www74.cpt1.host-h.net`
- Port: `465`
- Secure: `true` (SSL)
- User: `jaylene@happyevents.co.za`

### Email triggers

| Trigger | Recipients | Content |
|---|---|---|
| Booking submitted | Customer | Acknowledgement, booking details, pending status |
| Booking submitted | Admin | Full booking details |
| Booking confirmed | Customer | Confirmation message + Yoco payment link |
| Booking cancelled | Customer | Cancellation notice (only if booking was `CONFIRMED`) |
| Contact form submitted | Admin | Enquiry details |
| Contact form submitted | Customer | Auto-responder (preserved from Lambda) |

Email templates use HTML with the Happy Shisha logo (inline CID attachment), matching existing Lambda template style.

---

## 8. Google Calendar Integration

- **New dedicated calendar** created for bookings (calendar ID stored in SSM)
- **Service account** credentials stored in SSM Parameter Store as JSON
- **Full-day events** — each booking blocks the entire day

### Logic

| Action | Calendar operation |
|---|---|
| `GET /api/availability?date=` | Check for full-day events on date |
| `POST /api/book` | Create tentative full-day event |
| Booking confirmed | Update event title to include `[CONFIRMED]` |
| Booking cancelled | Delete event by `calendarEventId` |

### Fallback behaviour

- **Availability check**: If Google Calendar is unreachable, fall back to DynamoDB-only check (dates with `PENDING`/`CONFIRMED` bookings are blocked). Customer sees no error; the check degrades gracefully.
- **Calendar write (book/confirm/cancel)**: If Google Calendar is unreachable, log the error and continue — the booking state in DynamoDB is the source of truth. Staff can manually update the calendar.

---

## 9. Infrastructure (OpenTofu)

**New module: `infra/booking-platform/`** (separate from existing `infra/` contact Lambda)

### Resources

```hcl
# DynamoDB
aws_dynamodb_table.bookings          # PK: bookingId. GSI: status-createdAt
aws_dynamodb_table.packages          # PK: packageId

# Cognito
aws_cognito_user_pool.admin
aws_cognito_user_pool_client.nextjs

# SSM Parameter Store
aws_ssm_parameter.smtp_host
aws_ssm_parameter.smtp_port
aws_ssm_parameter.smtp_user
aws_ssm_parameter.smtp_pass          # migrated from variables.tf (was plaintext)
aws_ssm_parameter.google_credentials # JSON service account key
aws_ssm_parameter.google_calendar_id # Calendar ID

# Amplify
aws_amplify_app.booking
aws_amplify_branch.main
aws_amplify_domain_association.booking  # booking.happyshisha.co.za

# WAF
aws_wafv2_web_acl.booking            # Rate limiting for /api/book, /api/contact
aws_wafv2_web_acl_association.amplify

# IAM
aws_iam_role.amplify_ssr             # DynamoDB read/write + SSM read
```

**AWS region:** `eu-west-1`
**AWS profile:** `alex`

### Existing infra
The existing Lambda + API Gateway (`infra/`) remains in place until the new platform is live and verified, then decommissioned via `tofu destroy -target`.

---

## 10. Security

- Admin routes protected by Cognito JWT validation in Next.js middleware (`middleware.ts` at app root)
- All API inputs validated server-side (zod)
- SMTP password migrated from plaintext `variables.tf` to SSM SecureString
- Google Calendar service account scoped to calendar read/write only
- Rate limiting on public booking and contact endpoints via AWS WAF (managed in Tofu)
- CORS: public API routes (`/api/book`, `/api/availability`, `/api/packages`, `/api/contact`) set `Access-Control-Allow-Origin: https://booking.happyshisha.co.za` via a shared Next.js middleware helper. Admin API routes (`/api/admin/*`) require same-origin requests only (no CORS header needed — admin UI is on the same origin).

---

## 11. Local Development

Secrets are loaded from a `.env.local` file (git-ignored) during local development. SSM Parameter Store is only used in the Amplify deployed environment. The `.env.local` file mirrors the SSM parameter names as environment variables.

---

## 12. Branding

- Matches Happy Shisha color palette (charcoal, amber, smoke, soft-white) from existing `tailwind.config.js`
- Premium / luxury feel
- Mobile-first responsive design
- Minimal steps in booking flow

---

## 13. Out of Scope (Phase 1)

- Automated Yoco payment verification
- SMS / WhatsApp notifications
- Customer accounts / portal
- Automated reminders
- Real-time availability calendar UI
- Changes to the existing marketing site

---

## 14. Migration

### Plan
1. Deploy new booking platform to `booking.happyshisha.co.za`
2. Verify `/api/contact` by submitting a test contact form and confirming email receipt at `jaylene@happyevents.co.za`
3. Monitor Amplify CloudWatch logs for 48 hours — zero SMTP errors
4. Decommission existing Lambda via `tofu destroy -target aws_lambda_function.contact -target aws_apigatewayv2_api.api` in the `infra/` module
5. SMTP credentials removed from `infra/variables.tf`

### Acceptance criteria before decommission
- At least one successful contact form submission confirmed via email receipt
- No errors in Amplify CloudWatch logs over a 48-hour window
- Admin dashboard shows bookings correctly in DynamoDB
