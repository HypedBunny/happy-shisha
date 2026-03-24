# Happy Shisha Booking Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Next.js 14 booking platform at `booking.happyshisha.co.za` with package selection, Google Calendar availability, DynamoDB persistence, Cognito-protected admin dashboard, and Nodemailer email notifications.

**Architecture:** Separate repo from the existing marketing site. Next.js App Router with API routes handling all backend logic inline (no separate Lambda). OpenTofu manages all AWS resources: DynamoDB, Cognito, SSM, Amplify, WAF, IAM.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, AWS Amplify, DynamoDB (@aws-sdk v3), Cognito (jose JWT), Google Calendar API (googleapis), Nodemailer, Zod, OpenTofu

**Spec:** `docs/superpowers/specs/2026-03-24-happy-shisha-booking-platform-design.md`

---

## File Map

```
happy-shisha-booking-platform/          ← new repo root
├── .env.local.example
├── .gitignore
├── amplify.yml
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── jest.config.ts
├── jest.setup.ts
├── middleware.ts                        ← CORS + Cognito JWT guard
├── types/index.ts                       ← Booking, Package, BookingStatus
├── lib/
│   ├── validation.ts                    ← Zod schemas
│   ├── dynamo.ts                        ← DynamoDB client + CRUD helpers
│   ├── calendar.ts                      ← Google Calendar client
│   ├── email.ts                         ← Nodemailer + send functions
│   └── auth.ts                          ← Cognito JWT verification (jose)
├── email-templates/
│   ├── logo.png                         ← copied from infra/lambda/logo.png
│   ├── bookingAcknowledgement.html
│   ├── adminBookingNotification.html
│   ├── bookingConfirmation.html
│   ├── bookingCancellation.html
│   └── contactAutoResponder.html        ← migrated from Lambda autoResponder.html
├── app/
│   ├── layout.tsx                       ← root layout (fonts, globals)
│   ├── globals.css
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     ← package selection
│   │   ├── book/page.tsx                ← date + form
│   │   └── confirmation/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                   ← admin shell (sidebar, auth check)
│   │   ├── page.tsx                     ← booking list
│   │   ├── bookings/[id]/page.tsx       ← booking detail + actions
│   │   └── packages/page.tsx            ← package CRUD
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
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   └── Spinner.tsx
│   ├── booking/
│   │   ├── PackageCard.tsx
│   │   ├── DatePicker.tsx
│   │   └── BookingForm.tsx
│   └── admin/
│       ├── BookingTable.tsx
│       ├── ConfirmModal.tsx
│       └── PackageForm.tsx
└── infra/
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    ├── dynamo.tf
    ├── cognito.tf
    ├── ssm.tf
    ├── amplify.tf
    ├── waf.tf
    └── iam.tf
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `jest.config.ts`, `jest.setup.ts`, `.gitignore`, `.env.local.example`, `amplify.yml`

- [ ] **Step 1: Initialise Next.js app**

```bash
cd "C:\Users\beuke\Documents\SudoOps\Client Repos"
npx create-next-app@14 happy-shisha-booking-platform \
  --typescript --tailwind --app --no-src-dir \
  --import-alias "@/*" --no-eslint
cd happy-shisha-booking-platform
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb \
  googleapis nodemailer jose uuid zod react-day-picker
npm install -D @types/nodemailer @types/uuid \
  jest @testing-library/react @testing-library/jest-dom \
  jest-environment-jsdom @types/jest ts-jest
```

- [ ] **Step 3: Configure tailwind.config.ts** — replace generated file

```ts
import type { Config } from 'tailwindcss'
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#0E0E0E',
        amber: '#E38B29',
        smoke: '#9A9A9A',
        'soft-white': '#F5F5F5',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
} satisfies Config
```

- [ ] **Step 4: Configure jest.config.ts**

```ts
import type { Config } from 'jest'
const config: Config = {
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }] },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}
export default config
```

- [ ] **Step 5: Create jest.setup.ts**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Create .env.local.example**

```
AWS_REGION=eu-west-1
BOOKINGS_TABLE=happy-shisha-bookings
PACKAGES_TABLE=happy-shisha-packages
COGNITO_USER_POOL_ID=eu-west-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
COGNITO_LOGIN_URL=https://happy-shisha-admin.auth.eu-west-1.amazoncognito.com/login?client_id=XXX&response_type=code&scope=openid+email&redirect_uri=https://booking.happyshisha.co.za/admin
GOOGLE_CREDENTIALS={"type":"service_account",...}
GOOGLE_CALENDAR_ID=XXXXXXX@group.calendar.google.com
SMTP_HOST=www74.cpt1.host-h.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=jaylene@happyevents.co.za
SMTP_PASS=your-smtp-password
```

- [ ] **Step 7: Create amplify.yml**

Sensitive secrets are fetched from SSM at build time and exported so Next.js SSR can read them at runtime via Amplify's environment variable injection:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - export SMTP_PASS=$(aws ssm get-parameter --name /happy-shisha/smtp-pass --with-decryption --query Parameter.Value --output text --region $AWS_REGION)
        - export GOOGLE_CREDENTIALS=$(aws ssm get-parameter --name /happy-shisha/google-credentials --with-decryption --query Parameter.Value --output text --region $AWS_REGION)
        - export GOOGLE_CALENDAR_ID=$(aws ssm get-parameter --name /happy-shisha/google-calendar-id --query Parameter.Value --output text --region $AWS_REGION)
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

- [ ] **Step 8: Create next.config.ts**

```ts
import type { NextConfig } from 'next'
const config: NextConfig = {
  output: 'standalone',
  experimental: { serverActions: { allowedOrigins: ['booking.happyshisha.co.za'] } },
}
export default config
```

- [ ] **Step 9: Initialise git and commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 14 booking platform"
```

---

## Task 2: Types and Validation

**Files:**
- Create: `types/index.ts`
- Create: `lib/validation.ts`
- Create: `__tests__/lib/validation.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/lib/validation.test.ts
import { BookingSchema, ContactSchema, UpdateBookingSchema, PackageSchema } from '@/lib/validation'

test('BookingSchema rejects missing email', () => {
  const result = BookingSchema.safeParse({ packageId: '123e4567-e89b-12d3-a456-426614174000', date: '2026-05-01', preferredTime: '18:00', name: 'Test', phone: '0821234567', address: '1 Main St' })
  expect(result.success).toBe(false)
})

test('BookingSchema accepts valid booking', () => {
  const result = BookingSchema.safeParse({ packageId: '123e4567-e89b-12d3-a456-426614174000', date: '2026-05-01', preferredTime: '18:00', name: 'Test User', email: 'test@example.com', phone: '0821234567', address: '1 Main St Cape Town' })
  expect(result.success).toBe(true)
})

test('UpdateBookingSchema rejects invalid status', () => {
  const result = UpdateBookingSchema.safeParse({ status: 'UNKNOWN' })
  expect(result.success).toBe(false)
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/lib/validation.test.ts --no-coverage
```
Expected: FAIL — `Cannot find module '@/lib/validation'`

- [ ] **Step 3: Create types/index.ts**

```ts
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED'

export interface Booking {
  bookingId: string
  createdAt: string
  name: string
  email: string
  phone: string
  address: string
  packageId: string
  date: string
  preferredTime: string
  notes?: string
  status: BookingStatus
  paymentLink?: string
  calendarEventId?: string
}

export interface Package {
  packageId: string
  name: string
  description: string
  price: number
  duration: string
  includedItems: string[]
  active: boolean
  displayOrder: number
}
```

- [ ] **Step 4: Create lib/validation.ts**

```ts
import { z } from 'zod'

export const BookingSchema = z.object({
  packageId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  address: z.string().min(5).max(500),
  notes: z.string().max(1000).optional(),
})

export const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  eventType: z.string().min(1).max(100),
  date: z.string().optional(),
  message: z.string().max(2000).optional(),
})

export const UpdateBookingSchema = z.object({
  status: z.enum(['CONFIRMED', 'PAID', 'CANCELLED']),
  paymentLink: z.string().url().optional(),
})

export const PackageSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  price: z.number().positive(),
  duration: z.string().min(1).max(50),
  includedItems: z.array(z.string()).min(1),
  active: z.boolean(),
  displayOrder: z.number().int().min(0),
})
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npx jest __tests__/lib/validation.test.ts --no-coverage
```

- [ ] **Step 6: Commit**

```bash
git add types/ lib/validation.ts __tests__/
git commit -m "feat: add types and zod validation schemas"
```

---

## Task 3: OpenTofu Infrastructure

**Files:**
- Create: `infra/main.tf`, `infra/variables.tf`, `infra/outputs.tf`, `infra/dynamo.tf`, `infra/cognito.tf`, `infra/ssm.tf`, `infra/amplify.tf`, `infra/waf.tf`, `infra/iam.tf`

- [ ] **Step 1: Create infra/main.tf**

```hcl
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}
provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}
```

- [ ] **Step 2: Create infra/variables.tf**

```hcl
variable "aws_region"   { default = "eu-west-1" }
variable "aws_profile"  { default = "alex" }
variable "github_token" { sensitive = true }
variable "github_repo"  { description = "e.g. your-org/happy-shisha-booking-platform" }
variable "smtp_pass"    { sensitive = true }
variable "google_credentials" { sensitive = true; description = "Service account JSON" }
variable "google_calendar_id" {}
variable "smtp_host"    { default = "www74.cpt1.host-h.net" }
variable "smtp_port"    { default = "465" }
variable "smtp_secure"  { default = "true" }
variable "smtp_user"    { default = "jaylene@happyevents.co.za" }
```

- [ ] **Step 3: Create infra/dynamo.tf**

```hcl
resource "aws_dynamodb_table" "bookings" {
  name         = "happy-shisha-bookings"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "bookingId"

  attribute { name = "bookingId"; type = "S" }
  attribute { name = "status";    type = "S" }
  attribute { name = "createdAt"; type = "S" }

  global_secondary_index {
    name            = "status-createdAt-index"
    hash_key        = "status"
    range_key       = "createdAt"
    projection_type = "ALL"
  }
}

resource "aws_dynamodb_table" "packages" {
  name         = "happy-shisha-packages"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "packageId"
  attribute { name = "packageId"; type = "S" }
}
```

- [ ] **Step 4: Create infra/cognito.tf**

```hcl
resource "aws_cognito_user_pool" "admin" {
  name = "happy-shisha-admin"
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }
  admin_create_user_config { allow_admin_create_user_only = true }
}

resource "aws_cognito_user_pool_domain" "admin" {
  domain       = "happy-shisha-admin"
  user_pool_id = aws_cognito_user_pool.admin.id
}

resource "aws_cognito_user_pool_client" "nextjs" {
  name         = "happy-shisha-nextjs"
  user_pool_id = aws_cognito_user_pool.admin.id
  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  callback_urls                = ["https://booking.happyshisha.co.za/admin"]
  logout_urls                  = ["https://booking.happyshisha.co.za"]
  supported_identity_providers = ["COGNITO"]
  allowed_oauth_flows          = ["code"]
  allowed_oauth_scopes         = ["openid", "email", "profile"]
  generate_secret              = false
}
```

- [ ] **Step 5: Create infra/ssm.tf**

```hcl
resource "aws_ssm_parameter" "smtp_host"  { name = "/happy-shisha/smtp-host";  type = "String";       value = var.smtp_host }
resource "aws_ssm_parameter" "smtp_port"  { name = "/happy-shisha/smtp-port";  type = "String";       value = var.smtp_port }
resource "aws_ssm_parameter" "smtp_user"  { name = "/happy-shisha/smtp-user";  type = "String";       value = var.smtp_user }
resource "aws_ssm_parameter" "smtp_pass"  { name = "/happy-shisha/smtp-pass";  type = "SecureString"; value = var.smtp_pass }
resource "aws_ssm_parameter" "google_creds"    { name = "/happy-shisha/google-credentials"; type = "SecureString"; value = var.google_credentials }
resource "aws_ssm_parameter" "google_cal_id"   { name = "/happy-shisha/google-calendar-id"; type = "String";       value = var.google_calendar_id }
```

- [ ] **Step 6: Create infra/iam.tf**

```hcl
data "aws_iam_policy_document" "amplify_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals { type = "Service"; identifiers = ["amplify.amazonaws.com"] }
  }
}

resource "aws_iam_role" "amplify_ssr" {
  name               = "happy-shisha-amplify-ssr"
  assume_role_policy = data.aws_iam_policy_document.amplify_assume.json
}

resource "aws_iam_role_policy" "amplify_ssr" {
  role = aws_iam_role.amplify_ssr.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem","dynamodb:PutItem","dynamodb:UpdateItem","dynamodb:DeleteItem","dynamodb:Query","dynamodb:Scan"]
        Resource = ["${aws_dynamodb_table.bookings.arn}","${aws_dynamodb_table.bookings.arn}/index/*","${aws_dynamodb_table.packages.arn}"]
      },
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameter","ssm:GetParameters"]
        Resource = "arn:aws:ssm:${var.aws_region}:*:parameter/happy-shisha/*"
      }
    ]
  })
}
```

- [ ] **Step 7: Create infra/amplify.tf**

> **Note on secrets:** Non-sensitive vars are set directly on the Amplify app. Sensitive vars (`SMTP_PASS`, `GOOGLE_CREDENTIALS`) are injected via SSM in `amplify.yml` preBuild commands so they are never stored in plaintext Amplify env vars. The SSM IAM role (`amplify_ssr`) already grants `ssm:GetParameter` access.

```hcl
resource "aws_amplify_app" "booking" {
  name         = "happy-shisha-booking"
  repository   = "https://github.com/${var.github_repo}"
  access_token = var.github_token
  iam_service_role_arn = aws_iam_role.amplify_ssr.arn

  build_spec = file("${path.module}/../amplify.yml")

  environment_variables = {
    AWS_REGION           = var.aws_region
    BOOKINGS_TABLE       = aws_dynamodb_table.bookings.name
    PACKAGES_TABLE       = aws_dynamodb_table.packages.name
    COGNITO_USER_POOL_ID = aws_cognito_user_pool.admin.id
    COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.nextjs.id
    COGNITO_LOGIN_URL    = "https://${aws_cognito_user_pool_domain.admin.domain}.auth.${var.aws_region}.amazoncognito.com/login?client_id=${aws_cognito_user_pool_client.nextjs.id}&response_type=code&scope=openid+email+profile&redirect_uri=https://booking.happyshisha.co.za/admin"
    SMTP_HOST            = var.smtp_host
    SMTP_PORT            = var.smtp_port
    SMTP_SECURE          = var.smtp_secure
    SMTP_USER            = var.smtp_user
    # SMTP_PASS and GOOGLE_CREDENTIALS injected from SSM in amplify.yml preBuild
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.booking.id
  branch_name = "main"
  framework   = "Next.js - SSR"
  stage       = "PRODUCTION"
}

resource "aws_amplify_domain_association" "booking" {
  app_id      = aws_amplify_app.booking.id
  domain_name = "happyshisha.co.za"
  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = "booking"
  }
}
```

- [ ] **Step 8: Create infra/waf.tf**

```hcl
resource "aws_wafv2_web_acl" "booking" {
  name  = "happy-shisha-rate-limit"
  scope = "REGIONAL"

  default_action { allow {} }

  rule {
    name     = "rate-limit-public-api"
    priority = 1
    action   { block {} }
    statement {
      rate_based_statement {
        limit              = 20    # per 5-minute window per IP (spec: 20 req/IP/5min)
        aggregate_key_type = "IP"
        scope_down_statement {
          or_statement {
            statement {
              byte_match_statement {
                field_to_match { uri_path {} }
                positional_constraint = "STARTS_WITH"
                search_string         = "/api/book"
                text_transformation { priority = 0; type = "NONE" }
              }
            }
            statement {
              byte_match_statement {
                field_to_match { uri_path {} }
                positional_constraint = "STARTS_WITH"
                search_string         = "/api/contact"
                text_transformation { priority = 0; type = "NONE" }
              }
            }
          }
        }
      }
    }
    visibility_config { cloudwatch_metrics_enabled = true; metric_name = "RateLimitPublicApi"; sampled_requests_enabled = true }
  }

  visibility_config { cloudwatch_metrics_enabled = true; metric_name = "HappyShishaWAF"; sampled_requests_enabled = true }
}

# Associate WAF with Amplify app via CLI (no direct TF resource for Amplify WAF)
resource "null_resource" "amplify_waf" {
  depends_on = [aws_amplify_app.booking, aws_wafv2_web_acl.booking]
  provisioner "local-exec" {
    command = "aws amplify update-app --app-id ${aws_amplify_app.booking.id} --waf-configuration webAclArn=${aws_wafv2_web_acl.booking.arn} --region ${var.aws_region} --profile ${var.aws_profile}"
  }
}
```

- [ ] **Step 9: Create infra/outputs.tf**

```hcl
output "amplify_app_id"      { value = aws_amplify_app.booking.id }
output "amplify_default_url" { value = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.booking.default_domain}" }
output "cognito_user_pool_id" { value = aws_cognito_user_pool.admin.id }
output "cognito_client_id"    { value = aws_cognito_user_pool_client.nextjs.id }
output "bookings_table"       { value = aws_dynamodb_table.bookings.name }
output "packages_table"       { value = aws_dynamodb_table.packages.name }
```

- [ ] **Step 10: Validate and apply infra**

```bash
cd infra
tofu init
tofu validate
# Review plan before applying:
tofu plan -var="github_token=YOUR_TOKEN" -var="github_repo=YOUR_ORG/happy-shisha-booking-platform" -var="smtp_pass=1m5p07N34W3j30" -var="google_credentials=$(cat service-account.json)" -var="google_calendar_id=YOUR_CAL_ID"
tofu apply  # only after reviewing plan output
```

- [ ] **Step 11: Commit**

```bash
cd ..
git add infra/
git commit -m "feat: add OpenTofu infrastructure (DynamoDB, Cognito, Amplify, WAF)"
```

---

## Task 4: DynamoDB Client

**Files:**
- Create: `lib/dynamo.ts`
- Create: `__tests__/lib/dynamo.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/lib/dynamo.test.ts
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: { from: jest.fn(() => ({ send: jest.fn() })) },
  GetCommand: jest.fn(),
  PutCommand: jest.fn(),
  QueryCommand: jest.fn(),
  ScanCommand: jest.fn(),
  UpdateCommand: jest.fn(),
  DeleteCommand: jest.fn(),
}))
jest.mock('@aws-sdk/client-dynamodb', () => ({ DynamoDBClient: jest.fn() }))

import { getBooking, listBookingsByStatus, isDateBooked } from '@/lib/dynamo'

test('isDateBooked returns false when no bookings exist for date', async () => {
  const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')
  DynamoDBDocumentClient.from.mockReturnValue({
    send: jest.fn().mockResolvedValue({ Items: [] }),
  })
  const result = await isDateBooked('2026-05-01')
  expect(result).toBe(false)
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx jest __tests__/lib/dynamo.test.ts --no-coverage
```

- [ ] **Step 3: Create lib/dynamo.ts**

```ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient, GetCommand, PutCommand,
  QueryCommand, ScanCommand, UpdateCommand, DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import type { Booking, Package } from '@/types'

const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'eu-west-1' })
export const ddb = DynamoDBDocumentClient.from(client)

export const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE ?? 'happy-shisha-bookings'
export const PACKAGES_TABLE = process.env.PACKAGES_TABLE ?? 'happy-shisha-packages'

export async function getBooking(bookingId: string): Promise<Booking | null> {
  const res = await ddb.send(new GetCommand({ TableName: BOOKINGS_TABLE, Key: { bookingId } }))
  return (res.Item as Booking) ?? null
}

export async function putBooking(booking: Booking): Promise<void> {
  await ddb.send(new PutCommand({ TableName: BOOKINGS_TABLE, Item: booking }))
}

export async function updateBooking(bookingId: string, updates: Partial<Booking>): Promise<void> {
  const entries = Object.entries(updates)
  const expr = entries.map((_, i) => `#k${i} = :v${i}`).join(', ')
  const names = Object.fromEntries(entries.map(([k], i) => [`#k${i}`, k]))
  const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))
  await ddb.send(new UpdateCommand({
    TableName: BOOKINGS_TABLE,
    Key: { bookingId },
    UpdateExpression: `SET ${expr}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  }))
}

export async function listBookingsByStatus(status: string): Promise<Booking[]> {
  const res = await ddb.send(new QueryCommand({
    TableName: BOOKINGS_TABLE,
    IndexName: 'status-createdAt-index',
    KeyConditionExpression: '#s = :s',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':s': status },
    ScanIndexForward: false,
  }))
  return (res.Items ?? []) as Booking[]
}

export async function listAllBookings(): Promise<Booking[]> {
  const res = await ddb.send(new ScanCommand({ TableName: BOOKINGS_TABLE }))
  const items = (res.Items ?? []) as Booking[]
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function isDateBooked(date: string): Promise<boolean> {
  const res = await ddb.send(new ScanCommand({
    TableName: BOOKINGS_TABLE,
    FilterExpression: '#d = :d AND #s IN (:p, :c)',
    ExpressionAttributeNames: { '#d': 'date', '#s': 'status' },
    ExpressionAttributeValues: { ':d': date, ':p': 'PENDING', ':c': 'CONFIRMED' },
  }))
  return (res.Items?.length ?? 0) > 0
}

export async function getPackage(packageId: string): Promise<Package | null> {
  const res = await ddb.send(new GetCommand({ TableName: PACKAGES_TABLE, Key: { packageId } }))
  return (res.Item as Package) ?? null
}

export async function listActivePackages(): Promise<Package[]> {
  const res = await ddb.send(new ScanCommand({
    TableName: PACKAGES_TABLE,
    FilterExpression: '#a = :a',
    ExpressionAttributeNames: { '#a': 'active' },
    ExpressionAttributeValues: { ':a': true },
  }))
  return ((res.Items ?? []) as Package[]).sort((a, b) => a.displayOrder - b.displayOrder)
}

export async function listAllPackages(): Promise<Package[]> {
  const res = await ddb.send(new ScanCommand({ TableName: PACKAGES_TABLE }))
  return ((res.Items ?? []) as Package[]).sort((a, b) => a.displayOrder - b.displayOrder)
}

export async function putPackage(pkg: Package): Promise<void> {
  await ddb.send(new PutCommand({ TableName: PACKAGES_TABLE, Item: pkg }))
}

export async function updatePackage(packageId: string, updates: Partial<Package>): Promise<void> {
  const entries = Object.entries(updates)
  const expr = entries.map((_, i) => `#k${i} = :v${i}`).join(', ')
  const names = Object.fromEntries(entries.map(([k], i) => [`#k${i}`, k]))
  const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))
  await ddb.send(new UpdateCommand({
    TableName: PACKAGES_TABLE,
    Key: { packageId },
    UpdateExpression: `SET ${expr}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  }))
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx jest __tests__/lib/dynamo.test.ts --no-coverage
```

- [ ] **Step 5: Commit**

```bash
git add lib/dynamo.ts __tests__/lib/dynamo.test.ts
git commit -m "feat: add DynamoDB client and typed CRUD helpers"
```

---

## Task 5: Google Calendar Client

**Files:**
- Create: `lib/calendar.ts`
- Create: `__tests__/lib/calendar.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/lib/calendar.test.ts
jest.mock('googleapis', () => ({
  google: {
    auth: { GoogleAuth: jest.fn() },
    calendar: jest.fn(() => ({
      events: {
        list: jest.fn(),
        insert: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      },
    })),
  },
}))

import { isDateAvailableOnCalendar, createTentativeEvent } from '@/lib/calendar'

test('isDateAvailableOnCalendar returns true when no events', async () => {
  const { google } = require('googleapis')
  google.calendar().events.list.mockResolvedValue({ data: { items: [] } })
  const result = await isDateAvailableOnCalendar('2026-05-01')
  expect(result).toBe(true)
})

test('isDateAvailableOnCalendar throws on API error', async () => {
  const { google } = require('googleapis')
  google.calendar().events.list.mockRejectedValue(new Error('API error'))
  await expect(isDateAvailableOnCalendar('2026-05-01')).rejects.toThrow('API error')
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx jest __tests__/lib/calendar.test.ts --no-coverage
```

- [ ] **Step 3: Create lib/calendar.ts**

```ts
import { google } from 'googleapis'

function getCalendarClient() {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS!)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
  return google.calendar({ version: 'v3', auth })
}

const CALENDAR_ID = () => process.env.GOOGLE_CALENDAR_ID!

// Throws on error — caller decides fallback
export async function isDateAvailableOnCalendar(date: string): Promise<boolean> {
  const cal = getCalendarClient()
  const res = await cal.events.list({
    calendarId: CALENDAR_ID(),
    timeMin: `${date}T00:00:00Z`,
    timeMax: `${date}T23:59:59Z`,
    singleEvents: true,
  })
  return (res.data.items?.length ?? 0) === 0
}

// Returns event ID or null on error
export async function createTentativeEvent(
  date: string, bookingId: string, customerName: string, packageName: string,
): Promise<string | null> {
  try {
    const cal = getCalendarClient()
    const res = await cal.events.insert({
      calendarId: CALENDAR_ID(),
      requestBody: {
        summary: `[PENDING] ${customerName} — ${packageName}`,
        description: `Booking ID: ${bookingId}`,
        start: { date },
        end: { date },
        status: 'tentative',
      },
    })
    return res.data.id ?? null
  } catch (err) {
    console.error('Calendar createTentativeEvent failed:', err)
    return null
  }
}

export async function confirmCalendarEvent(
  calendarEventId: string, customerName: string, packageName: string,
): Promise<void> {
  try {
    const cal = getCalendarClient()
    await cal.events.patch({
      calendarId: CALENDAR_ID(),
      eventId: calendarEventId,
      requestBody: { summary: `[CONFIRMED] ${customerName} — ${packageName}`, status: 'confirmed' },
    })
  } catch (err) {
    console.error('Calendar confirmEvent failed:', err)
  }
}

export async function deleteCalendarEvent(calendarEventId: string): Promise<void> {
  try {
    const cal = getCalendarClient()
    await cal.events.delete({ calendarId: CALENDAR_ID(), eventId: calendarEventId })
  } catch (err) {
    console.error('Calendar deleteEvent failed:', err)
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx jest __tests__/lib/calendar.test.ts --no-coverage
```

- [ ] **Step 5: Commit**

```bash
git add lib/calendar.ts __tests__/lib/calendar.test.ts
git commit -m "feat: add Google Calendar client with graceful fallback"
```

---

## Task 6: Email Templates and Service

**Files:**
- Create: `email-templates/bookingAcknowledgement.html`
- Create: `email-templates/adminBookingNotification.html`
- Create: `email-templates/bookingConfirmation.html`
- Create: `email-templates/bookingCancellation.html`
- Create: `email-templates/contactAutoResponder.html`
- Copy: `email-templates/logo.png` (from existing Lambda)
- Create: `lib/email.ts`

- [ ] **Step 1: Copy logo**

```bash
cp "../Happy Shisha/infra/lambda/logo.png" email-templates/logo.png
```

- [ ] **Step 2: Create email-templates/bookingAcknowledgement.html**

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><style>
body{font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;background:#1a1a1a;color:#f7f7f7;text-align:center}
.container{max-width:600px;margin:40px auto;background:#242424;padding:40px;border-radius:12px;border:1px solid rgba(227,139,41,0.2);box-shadow:0 10px 30px rgba(0,0,0,0.5)}
h1{color:#E38B29;font-weight:300;letter-spacing:1px}
p{color:#d1d5db;line-height:1.6;font-weight:300}
.accent{color:#E38B29;font-weight:400}
.divider{height:1px;background:linear-gradient(to right,transparent,rgba(227,139,41,0.5),transparent);margin:30px 0}
.detail{background:#1a1a1a;border-radius:8px;padding:16px;margin:8px 0;text-align:left}
.footer{font-size:12px;color:rgba(209,213,219,0.5)}
</style></head>
<body>
<div class="container">
  <div><img src="cid:happyshishalogo" alt="Happy Shisha" style="max-width:150px"></div>
  <h1>Booking Request Received</h1>
  <p>Hi <span class="accent">{{name}}</span>,</p>
  <p>We've received your booking request. Our team will review it and confirm within 24 hours.</p>
  <div class="divider"></div>
  <div class="detail"><p><strong>Package:</strong> <span class="accent">{{packageName}}</span></p>
  <p><strong>Date:</strong> {{date}}</p>
  <p><strong>Preferred Time:</strong> {{preferredTime}}</p>
  <p><strong>Booking Reference:</strong> {{bookingId}}</p></div>
  <div class="divider"></div>
  <p>Questions? Reply to this email or reach us on WhatsApp.</p>
  <p>— <span class="accent">The Happy Shisha Team</span></p>
  <div class="footer"><p>&copy; Happy Events Presents Happy Shisha. All rights reserved.</p></div>
</div>
</body></html>
```

- [ ] **Step 3: Create email-templates/adminBookingNotification.html**

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><style>
body{font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;background:#1a1a1a;color:#f7f7f7}
.container{max-width:600px;margin:40px auto;background:#242424;padding:40px;border-radius:12px;border:1px solid rgba(227,139,41,0.2)}
h1{color:#E38B29;font-weight:300}
p{color:#d1d5db;line-height:1.6}
.accent{color:#E38B29}
.field{margin:8px 0}
.divider{height:1px;background:linear-gradient(to right,transparent,rgba(227,139,41,0.5),transparent);margin:20px 0}
</style></head>
<body>
<div class="container">
  <h1>New Booking Request</h1>
  <div class="divider"></div>
  <p class="field"><strong>Name:</strong> {{name}}</p>
  <p class="field"><strong>Email:</strong> {{email}}</p>
  <p class="field"><strong>Phone:</strong> {{phone}}</p>
  <p class="field"><strong>Address:</strong> {{address}}</p>
  <p class="field"><strong>Package:</strong> <span class="accent">{{packageName}}</span></p>
  <p class="field"><strong>Date:</strong> {{date}}</p>
  <p class="field"><strong>Preferred Time:</strong> {{preferredTime}}</p>
  <p class="field"><strong>Notes:</strong> {{notes}}</p>
  <p class="field"><strong>Booking ID:</strong> {{bookingId}}</p>
  <div class="divider"></div>
  <p>Review this booking in the <a href="https://booking.happyshisha.co.za/admin" style="color:#E38B29">admin dashboard</a>.</p>
</div>
</body></html>
```

- [ ] **Step 4: Create email-templates/bookingConfirmation.html**

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><style>
body{font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;background:#1a1a1a;color:#f7f7f7;text-align:center}
.container{max-width:600px;margin:40px auto;background:#242424;padding:40px;border-radius:12px;border:1px solid rgba(227,139,41,0.2);box-shadow:0 10px 30px rgba(0,0,0,0.5)}
h1{color:#E38B29;font-weight:300;letter-spacing:1px}
p{color:#d1d5db;line-height:1.6;font-weight:300}
.accent{color:#E38B29;font-weight:400}
.btn{display:inline-block;margin:24px 0;padding:16px 40px;background:#E38B29;color:#0E0E0E;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px}
.divider{height:1px;background:linear-gradient(to right,transparent,rgba(227,139,41,0.5),transparent);margin:30px 0}
.footer{font-size:12px;color:rgba(209,213,219,0.5)}
</style></head>
<body>
<div class="container">
  <div><img src="cid:happyshishalogo" alt="Happy Shisha" style="max-width:150px"></div>
  <h1>Your Booking is Confirmed!</h1>
  <p>Hi <span class="accent">{{name}}</span>,</p>
  <p>Great news — your <span class="accent">{{packageName}}</span> booking for <span class="accent">{{date}}</span> at <span class="accent">{{preferredTime}}</span> is confirmed!</p>
  <div class="divider"></div>
  <p>To secure your booking, please complete payment via the link below:</p>
  <a href="{{paymentLink}}" class="btn">Pay Now</a>
  <div class="divider"></div>
  <p>Questions? Reply to this email.</p>
  <p>— <span class="accent">The Happy Shisha Team</span></p>
  <div class="footer"><p>&copy; Happy Events Presents Happy Shisha. All rights reserved.</p></div>
</div>
</body></html>
```

- [ ] **Step 5: Create email-templates/bookingCancellation.html**

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><style>
body{font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;background:#1a1a1a;color:#f7f7f7;text-align:center}
.container{max-width:600px;margin:40px auto;background:#242424;padding:40px;border-radius:12px;border:1px solid rgba(227,139,41,0.2)}
h1{color:#E38B29;font-weight:300}p{color:#d1d5db;line-height:1.6;font-weight:300}
.accent{color:#E38B29;font-weight:400}
.divider{height:1px;background:linear-gradient(to right,transparent,rgba(227,139,41,0.5),transparent);margin:30px 0}
.footer{font-size:12px;color:rgba(209,213,219,0.5)}
</style></head>
<body>
<div class="container">
  <div><img src="cid:happyshishalogo" alt="Happy Shisha" style="max-width:150px"></div>
  <h1>Booking Cancelled</h1>
  <p>Hi <span class="accent">{{name}}</span>,</p>
  <p>Your booking for <span class="accent">{{packageName}}</span> on <span class="accent">{{date}}</span> has been cancelled.</p>
  <div class="divider"></div>
  <p>If this was a mistake or you'd like to rebook, please reach out to us.</p>
  <p>— <span class="accent">The Happy Shisha Team</span></p>
  <div class="footer"><p>&copy; Happy Events Presents Happy Shisha. All rights reserved.</p></div>
</div>
</body></html>
```

- [ ] **Step 6: Create email-templates/contactAutoResponder.html** (copy adapted from Lambda)

Copy content from `../Happy Shisha/infra/lambda/email-templates/autoResponder.html` — it already uses `{{name}}` and `{{eventType}}` placeholders. No changes needed.

```bash
cp "../Happy Shisha/infra/lambda/email-templates/autoResponder.html" email-templates/contactAutoResponder.html
```

- [ ] **Step 7: Create lib/email.ts**

```ts
import nodemailer from 'nodemailer'
import path from 'path'
import fs from 'fs/promises'
import type { Booking, Package } from '@/types'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  })
}

const LOGO = {
  filename: 'logo.png',
  path: path.join(process.cwd(), 'email-templates', 'logo.png'),
  cid: 'happyshishalogo',
}

async function render(name: string, vars: Record<string, string>): Promise<string> {
  let html = await fs.readFile(path.join(process.cwd(), 'email-templates', `${name}.html`), 'utf8')
  for (const [k, v] of Object.entries(vars)) html = html.replaceAll(`{{${k}}}`, v)
  return html
}

function fireAndForget(promise: Promise<unknown>, label: string) {
  promise.catch(err => console.error(`[email] ${label} failed:`, err))
}

export function sendBookingAcknowledgement(booking: Booking, pkg: Package) {
  fireAndForget((async () => {
    const html = await render('bookingAcknowledgement', {
      name: booking.name, packageName: pkg.name,
      date: booking.date, preferredTime: booking.preferredTime, bookingId: booking.bookingId,
    })
    await createTransporter().sendMail({
      from: `"Happy Shisha" <${process.env.SMTP_USER}>`,
      to: booking.email,
      subject: 'Booking Request Received – Happy Shisha',
      html, attachments: [LOGO],
    })
  })(), 'sendBookingAcknowledgement')
}

export function sendAdminBookingNotification(booking: Booking, pkg: Package) {
  fireAndForget((async () => {
    const html = await render('adminBookingNotification', {
      name: booking.name, email: booking.email, phone: booking.phone,
      address: booking.address, packageName: pkg.name, date: booking.date,
      preferredTime: booking.preferredTime, notes: booking.notes ?? 'None',
      bookingId: booking.bookingId,
    })
    await createTransporter().sendMail({
      from: process.env.SMTP_USER!,
      to: process.env.SMTP_USER!,
      replyTo: booking.email,
      subject: `New Booking Request – ${booking.name} – ${pkg.name}`,
      html,
    })
  })(), 'sendAdminBookingNotification')
}

export function sendBookingConfirmation(booking: Booking, pkg: Package) {
  fireAndForget((async () => {
    const html = await render('bookingConfirmation', {
      name: booking.name, packageName: pkg.name,
      date: booking.date, preferredTime: booking.preferredTime,
      paymentLink: booking.paymentLink!,
    })
    await createTransporter().sendMail({
      from: `"Happy Shisha" <${process.env.SMTP_USER}>`,
      to: booking.email,
      subject: 'Your Booking is Confirmed – Happy Shisha',
      html, attachments: [LOGO],
    })
  })(), 'sendBookingConfirmation')
}

export function sendBookingCancellation(booking: Booking, pkg: Package) {
  fireAndForget((async () => {
    const html = await render('bookingCancellation', {
      name: booking.name, packageName: pkg.name, date: booking.date,
    })
    await createTransporter().sendMail({
      from: `"Happy Shisha" <${process.env.SMTP_USER}>`,
      to: booking.email,
      subject: 'Booking Cancelled – Happy Shisha',
      html, attachments: [LOGO],
    })
  })(), 'sendBookingCancellation')
}

export function sendContactAutoResponder(name: string, email: string, eventType: string) {
  fireAndForget((async () => {
    const html = await render('contactAutoResponder', { name, eventType })
    await createTransporter().sendMail({
      from: `"Happy Shisha" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `We've received your ${eventType} enquiry! – Happy Shisha`,
      html, attachments: [LOGO],
    })
  })(), 'sendContactAutoResponder')
}

export function sendContactAdminNotification(data: { name: string; email: string; phone: string; eventType: string; date?: string; message?: string }) {
  fireAndForget((async () => {
    await createTransporter().sendMail({
      from: process.env.SMTP_USER!,
      to: process.env.SMTP_USER!,
      replyTo: data.email,
      subject: `New Enquiry from ${data.name} – ${data.eventType}`,
      html: `<h2>New Enquiry</h2><p><b>Name:</b> ${data.name}</p><p><b>Email:</b> ${data.email}</p><p><b>Phone:</b> ${data.phone}</p><p><b>Event Type:</b> ${data.eventType}</p><p><b>Date:</b> ${data.date ?? 'Not specified'}</p><p><b>Message:</b> ${data.message ?? 'None'}</p>`,
    })
  })(), 'sendContactAdminNotification')
}
```

- [ ] **Step 8: Commit**

```bash
git add email-templates/ lib/email.ts
git commit -m "feat: add email templates and nodemailer service"
```

---

## Task 7: Auth and Middleware

**Files:**
- Create: `lib/auth.ts`
- Create: `middleware.ts`
- Create: `__tests__/lib/auth.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// __tests__/lib/auth.test.ts
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  createRemoteJWKSet: jest.fn(() => 'mock-jwks'),
}))

import { verifyCognitoToken } from '@/lib/auth'
import { jwtVerify } from 'jose'

test('verifyCognitoToken returns payload on valid token', async () => {
  ;(jwtVerify as jest.Mock).mockResolvedValue({ payload: { sub: 'user-123' } })
  process.env.AWS_REGION = 'eu-west-1'
  process.env.COGNITO_USER_POOL_ID = 'eu-west-1_TEST'
  const payload = await verifyCognitoToken('valid-token')
  expect(payload).toEqual({ sub: 'user-123' })
})

test('verifyCognitoToken throws on invalid token', async () => {
  ;(jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid'))
  await expect(verifyCognitoToken('bad-token')).rejects.toThrow('Invalid')
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest __tests__/lib/auth.test.ts --no-coverage
```

- [ ] **Step 3: Create lib/auth.ts**

```ts
import { jwtVerify, createRemoteJWKSet } from 'jose'

function getJwks() {
  const region = process.env.AWS_REGION ?? 'eu-west-1'
  const poolId = process.env.COGNITO_USER_POOL_ID!
  return createRemoteJWKSet(
    new URL(`https://cognito-idp.${region}.amazonaws.com/${poolId}/.well-known/jwks.json`)
  )
}

export async function verifyCognitoToken(token: string) {
  const region = process.env.AWS_REGION ?? 'eu-west-1'
  const poolId = process.env.COGNITO_USER_POOL_ID!
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer: `https://cognito-idp.${region}.amazonaws.com/${poolId}`,
  })
  return payload
}
```

- [ ] **Step 4: Create middleware.ts**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { verifyCognitoToken } from '@/lib/auth'

const CORS_ORIGIN = 'https://booking.happyshisha.co.za'
const PUBLIC_API = ['/api/packages', '/api/availability', '/api/book', '/api/contact']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CORS preflight for public API routes
  const isPublicApi = PUBLIC_API.some(p => pathname.startsWith(p))
  if (isPublicApi && request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': CORS_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '300',
      },
    })
  }

  // Protect /admin pages and /api/admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token =
      request.cookies.get('id_token')?.value ??
      request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return NextResponse.redirect(new URL(process.env.COGNITO_LOGIN_URL!, request.url))
    }

    try {
      await verifyCognitoToken(token)
    } catch {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return NextResponse.redirect(new URL(process.env.COGNITO_LOGIN_URL!, request.url))
    }
  }

  const response = NextResponse.next()
  if (isPublicApi) response.headers.set('Access-Control-Allow-Origin', CORS_ORIGIN)
  return response
}

export const config = { matcher: ['/admin/:path*', '/api/:path*'] }
```

- [ ] **Step 5: Run auth test — expect PASS**

```bash
npx jest __tests__/lib/auth.test.ts --no-coverage
```

- [ ] **Step 6: Commit**

```bash
git add lib/auth.ts middleware.ts __tests__/lib/auth.test.ts
git commit -m "feat: add Cognito JWT auth and middleware (CORS + route protection)"
```

---

## Task 8: Public API Routes

**Files:**
- Create: `app/api/packages/route.ts`
- Create: `app/api/availability/route.ts`
- Create: `app/api/book/route.ts`
- Create: `app/api/contact/route.ts`
- Create: `__tests__/api/packages.test.ts`
- Create: `__tests__/api/availability.test.ts`
- Create: `__tests__/api/book.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/api/packages.test.ts
jest.mock('@/lib/dynamo', () => ({ listActivePackages: jest.fn() }))
import { GET } from '@/app/api/packages/route'
import { listActivePackages } from '@/lib/dynamo'
import { NextRequest } from 'next/server'

test('GET /api/packages returns sorted active packages', async () => {
  ;(listActivePackages as jest.Mock).mockResolvedValue([
    { packageId: '1', name: 'Basic', price: 1500, displayOrder: 1, active: true },
  ])
  const res = await GET(new NextRequest('http://localhost/api/packages'))
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(body).toHaveLength(1)
})
```

```ts
// __tests__/api/availability.test.ts
jest.mock('@/lib/dynamo', () => ({ isDateBooked: jest.fn() }))
jest.mock('@/lib/calendar', () => ({ isDateAvailableOnCalendar: jest.fn() }))
import { GET } from '@/app/api/availability/route'
import { isDateBooked } from '@/lib/dynamo'
import { isDateAvailableOnCalendar } from '@/lib/calendar'
import { NextRequest } from 'next/server'

test('GET /api/availability returns available=true when free', async () => {
  ;(isDateBooked as jest.Mock).mockResolvedValue(false)
  ;(isDateAvailableOnCalendar as jest.Mock).mockResolvedValue(true)
  const req = new NextRequest('http://localhost/api/availability?date=2026-05-01')
  const res = await GET(req)
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual({ available: true })
})

test('GET /api/availability returns available=false when DynamoDB has booking', async () => {
  ;(isDateBooked as jest.Mock).mockResolvedValue(true)
  const req = new NextRequest('http://localhost/api/availability?date=2026-05-01')
  const res = await GET(req)
  expect(await res.json()).toEqual({ available: false })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx jest __tests__/api/packages.test.ts __tests__/api/availability.test.ts --no-coverage
```

- [ ] **Step 3: Create app/api/packages/route.ts**

```ts
import { NextResponse } from 'next/server'
import { listActivePackages } from '@/lib/dynamo'

export async function GET() {
  const packages = await listActivePackages()
  return NextResponse.json(packages)
}
```

- [ ] **Step 4: Create app/api/availability/route.ts**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { isDateBooked } from '@/lib/dynamo'
import { isDateAvailableOnCalendar } from '@/lib/calendar'

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })

  // DynamoDB is always checked — Calendar is best-effort
  const dbBooked = await isDateBooked(date)
  if (dbBooked) return NextResponse.json({ available: false })

  try {
    const calFree = await isDateAvailableOnCalendar(date)
    return NextResponse.json({ available: calFree })
  } catch {
    // Calendar unreachable — fall back to DB result (not booked = available)
    return NextResponse.json({ available: true })
  }
}
```

- [ ] **Step 5: Create app/api/book/route.ts**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { BookingSchema } from '@/lib/validation'
import { isDateBooked, putBooking, getPackage } from '@/lib/dynamo'
import { isDateAvailableOnCalendar, createTentativeEvent } from '@/lib/calendar'
import { sendBookingAcknowledgement, sendAdminBookingNotification } from '@/lib/email'
import type { Booking } from '@/types'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const parse = BookingSchema.safeParse(body)
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 422 })

  const data = parse.data

  // Re-check availability server-side
  const dbBooked = await isDateBooked(data.date)
  if (dbBooked) return NextResponse.json({ error: 'This date is no longer available.' }, { status: 409 })

  try {
    const calFree = await isDateAvailableOnCalendar(data.date)
    if (!calFree) return NextResponse.json({ error: 'This date is no longer available.' }, { status: 409 })
  } catch { /* calendar unreachable — proceed with DB check only */ }

  const pkg = await getPackage(data.packageId)
  if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

  const booking: Booking = {
    bookingId: uuidv4(),
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    ...data,
  }

  await putBooking(booking)

  // Calendar event — fire and forget
  createTentativeEvent(data.date, booking.bookingId, data.name, pkg.name)
    .then(eventId => {
      if (eventId) {
        // Update calendarEventId async — best effort
        import('@/lib/dynamo').then(({ updateBooking }) =>
          updateBooking(booking.bookingId, { calendarEventId: eventId })
        )
      }
    })
    .catch(err => console.error('Calendar event creation failed:', err))

  sendBookingAcknowledgement(booking, pkg)
  sendAdminBookingNotification(booking, pkg)

  return NextResponse.json({ bookingId: booking.bookingId }, { status: 201 })
}
```

- [ ] **Step 6: Create app/api/contact/route.ts**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { ContactSchema } from '@/lib/validation'
import { sendContactAutoResponder, sendContactAdminNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 })

  const parse = ContactSchema.safeParse(body)
  if (!parse.success) return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 422 })

  const data = parse.data
  sendContactAdminNotification(data)
  sendContactAutoResponder(data.name, data.email, data.eventType)

  return NextResponse.json({ success: true, message: 'Email sent successfully' })
}
```

- [ ] **Step 7: Run all API tests — expect PASS**

```bash
npx jest __tests__/api/ --no-coverage
```

- [ ] **Step 8: Commit**

```bash
git add app/api/ __tests__/api/
git commit -m "feat: add public API routes (packages, availability, book, contact)"
```

---

## Task 9: Admin API Routes

**Files:**
- Create: `app/api/admin/bookings/route.ts`
- Create: `app/api/admin/bookings/[id]/route.ts`
- Create: `app/api/admin/packages/route.ts`
- Create: `__tests__/api/admin/bookings.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// __tests__/api/admin/bookings.test.ts
jest.mock('@/lib/dynamo', () => ({
  listAllBookings: jest.fn(),
  getBooking: jest.fn(),
  updateBooking: jest.fn(),
  getPackage: jest.fn(),
}))
jest.mock('@/lib/email', () => ({
  sendBookingConfirmation: jest.fn(),
  sendBookingCancellation: jest.fn(),
}))
jest.mock('@/lib/calendar', () => ({
  confirmCalendarEvent: jest.fn(),
  deleteCalendarEvent: jest.fn(),
}))

import { GET } from '@/app/api/admin/bookings/route'
import { listAllBookings } from '@/lib/dynamo'
import { NextRequest } from 'next/server'

test('GET /api/admin/bookings returns bookings list', async () => {
  ;(listAllBookings as jest.Mock).mockResolvedValue([
    { bookingId: '1', name: 'Test', status: 'PENDING' },
  ])
  const res = await GET(new NextRequest('http://localhost/api/admin/bookings'))
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(body).toHaveLength(1)
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest __tests__/api/admin/bookings.test.ts --no-coverage
```

- [ ] **Step 3: Create app/api/admin/bookings/route.ts**

```ts
import { NextResponse } from 'next/server'
import { listAllBookings } from '@/lib/dynamo'

export async function GET() {
  const bookings = await listAllBookings()
  return NextResponse.json(bookings)
}
```

- [ ] **Step 4: Create app/api/admin/bookings/[id]/route.ts**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { UpdateBookingSchema } from '@/lib/validation'
import { getBooking, updateBooking, getPackage } from '@/lib/dynamo'
import { confirmCalendarEvent, deleteCalendarEvent } from '@/lib/calendar'
import { sendBookingConfirmation, sendBookingCancellation } from '@/lib/email'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const parse = UpdateBookingSchema.safeParse(body)
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 422 })

  const booking = await getBooking(params.id)
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const { status, paymentLink } = parse.data
  const updates: Record<string, string> = { status }
  if (paymentLink) updates.paymentLink = paymentLink

  await updateBooking(params.id, updates)

  const pkg = booking.packageId ? await getPackage(booking.packageId) : null

  if (status === 'CONFIRMED') {
    if (pkg) sendBookingConfirmation({ ...booking, ...updates }, pkg)
    if (booking.calendarEventId && pkg)
      confirmCalendarEvent(booking.calendarEventId, booking.name, pkg.name)
  }

  if (status === 'CANCELLED') {
    // Only email customer if booking was previously confirmed
    if (booking.status === 'CONFIRMED' && pkg)
      sendBookingCancellation({ ...booking, status: 'CANCELLED' }, pkg)
    if (booking.calendarEventId)
      deleteCalendarEvent(booking.calendarEventId)
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 5: Create app/api/admin/packages/route.ts**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { PackageSchema } from '@/lib/validation'
import { listAllPackages, putPackage, updatePackage } from '@/lib/dynamo'

export async function GET() {
  return NextResponse.json(await listAllPackages())
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parse = PackageSchema.safeParse(body)
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 422 })
  const pkg = { packageId: uuidv4(), ...parse.data }
  await putPackage(pkg)
  return NextResponse.json(pkg, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.packageId) return NextResponse.json({ error: 'packageId required' }, { status: 400 })
  const { packageId, ...updates } = body
  await updatePackage(packageId, updates)
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 6: Run all tests — expect PASS**

```bash
npx jest --no-coverage
```

- [ ] **Step 7: Commit**

```bash
git add app/api/admin/ __tests__/api/admin/
git commit -m "feat: add admin API routes (bookings CRUD, packages CRUD)"
```

---

## Task 10: Shared UI Components

**Files:**
- Create: `app/layout.tsx`, `app/globals.css`
- Create: `components/ui/Button.tsx`, `Badge.tsx`, `Modal.tsx`, `Spinner.tsx`

- [ ] **Step 1: Create app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

body {
  background-color: #0E0E0E;
  color: #F5F5F5;
  font-family: 'Inter', system-ui, sans-serif;
}
```

- [ ] **Step 2: Create app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Happy Shisha – Book Your Experience',
  description: 'Book your premium mobile shisha experience.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-charcoal text-soft-white antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create components/ui/Button.tsx**

```tsx
import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: 'bg-amber text-charcoal hover:bg-amber/90 font-semibold',
  outline: 'border border-amber text-amber hover:bg-amber/10',
  ghost: 'text-smoke hover:text-soft-white hover:bg-white/5',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}
const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5', lg: 'px-8 py-3.5 text-lg' }

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn('rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="animate-pulse">Loading…</span> : children}
    </button>
  )
}
```

- [ ] **Step 4: Create lib/utils.ts** (needed by Button)

```ts
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}
```

- [ ] **Step 5: Create components/ui/Badge.tsx**

```tsx
import { cn } from '@/lib/utils'
type Status = 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED'
const styles: Record<Status, string> = {
  PENDING:   'bg-amber/20 text-amber border-amber/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PAID:      'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-smoke/20 text-smoke border-smoke/30',
}
export function Badge({ status }: { status: Status }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', styles[status])}>
      {status}
    </span>
  )
}
```

- [ ] **Step 6: Create components/ui/Modal.tsx**

```tsx
'use client'
import { useEffect } from 'react'

interface ModalProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode }

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-[#242424] rounded-xl border border-amber/20 p-6 shadow-2xl">
        <h2 className="text-lg font-medium text-soft-white mb-4">{title}</h2>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create components/ui/Spinner.tsx**

```tsx
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg className="animate-spin text-amber" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add app/layout.tsx app/globals.css components/ui/ lib/utils.ts
git commit -m "feat: add root layout, globals, and shared UI components"
```

---

## Task 11: Customer Booking Flow UI

**Files:**
- Create: `components/booking/PackageCard.tsx`
- Create: `components/booking/DatePicker.tsx`
- Create: `components/booking/BookingForm.tsx`
- Create: `app/(public)/layout.tsx`
- Create: `app/(public)/page.tsx`
- Create: `app/(public)/book/page.tsx`
- Create: `app/(public)/confirmation/page.tsx`

- [ ] **Step 1: Create app/(public)/layout.tsx**

```tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-charcoal">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <span className="text-amber font-semibold tracking-wider text-lg">HAPPY SHISHA</span>
      </nav>
      {children}
    </main>
  )
}
```

- [ ] **Step 2: Create components/booking/PackageCard.tsx**

The card is wrapped in a `<Link>` on the page, so no `onSelect` prop or internal button needed — the entire card is the clickable element:

```tsx
import { Package } from '@/types'

export function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <div className="group relative flex flex-col bg-[#1a1a1a] border border-white/10 hover:border-amber/40 rounded-xl p-6 transition-all duration-300 cursor-pointer h-full">
      <div className="absolute inset-0 rounded-xl bg-amber/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <h3 className="text-lg font-medium text-soft-white mb-1">{pkg.name}</h3>
      <p className="text-smoke text-sm mb-4 flex-1">{pkg.description}</p>
      <p className="text-2xl font-light text-amber mb-1">R{pkg.price.toLocaleString()}</p>
      <p className="text-smoke text-xs mb-4">{pkg.duration}</p>
      <ul className="mb-6 space-y-1">
        {pkg.includedItems.map(item => (
          <li key={item} className="flex items-center gap-2 text-sm text-smoke">
            <span className="text-amber">✓</span> {item}
          </li>
        ))}
      </ul>
      <span className="inline-block w-full text-center border border-amber text-amber rounded-lg py-2 text-sm group-hover:bg-amber/10 transition-colors">
        Select Package →
      </span>
    </div>
  )
}
```

- [ ] **Step 3: Create app/(public)/page.tsx**

```tsx
import { listActivePackages } from '@/lib/dynamo'
import { PackageCard } from '@/components/booking/PackageCard'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const packages = await listActivePackages()
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-soft-white mb-3 tracking-wide">Choose Your Experience</h1>
        <p className="text-smoke">Select a package to begin your booking</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <form key={pkg.packageId} action={`/book?package=${pkg.packageId}`} method="GET">
            <PackageCard pkg={pkg} onSelect={() => {}} />
            <button type="submit" className="sr-only">Select</button>
          </form>
        ))}
      </div>
    </div>
  )
}
```

> Note: `PackageCard` needs to be a client component with a link wrapper OR use a server-side form. Simplest approach: make the entire card a Next.js `<Link>` wrapping the card markup, not the PackageCard component.

Replace the page with this cleaner version:

```tsx
import { listActivePackages } from '@/lib/dynamo'
import Link from 'next/link'
import { PackageCard } from '@/components/booking/PackageCard'

export default async function HomePage() {
  const packages = await listActivePackages()
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-soft-white mb-3 tracking-wide">Choose Your Experience</h1>
        <p className="text-smoke">Select a package to begin your booking</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <Link key={pkg.packageId} href={`/book?package=${pkg.packageId}`} className="block h-full">
            <PackageCard pkg={pkg} />
          </Link>
        ))}
      </div>
    </div>
  )
}
```

The `PackageCard` in Step 2 is already the correct final version (no `onSelect` prop, no Button import).

- [ ] **Step 4: Create app/(public)/book/page.tsx** (date + form)

```tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

export default function BookPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const packageId = searchParams.get('package') ?? ''

  const [step, setStep] = useState<'date' | 'details'>('date')
  const [selectedDate, setSelectedDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' })

  async function checkDate(date: string) {
    setChecking(true)
    try {
      const res = await fetch(`/api/availability?date=${date}`)
      const data = await res.json()
      setAvailability(prev => ({ ...prev, [date]: data.available }))
    } finally { setChecking(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, date: selectedDate, preferredTime, ...form }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Booking failed. Please try again.'); return }
      router.push(`/confirmation?id=${data.bookingId}`)
    } finally { setSubmitting(false) }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="text-3xl font-light text-soft-white mb-8 tracking-wide">
        {step === 'date' ? 'Select a Date' : 'Your Details'}
      </h1>

      {step === 'date' && (
        <div className="space-y-6">
          <div>
            <label className="block text-smoke text-sm mb-2">Choose your event date</label>
            <input
              type="date"
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              value={selectedDate}
              onChange={e => { setSelectedDate(e.target.value); checkDate(e.target.value) }}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-soft-white focus:outline-none focus:border-amber/60 transition-colors"
            />
            {checking && <p className="text-smoke text-sm mt-2 flex items-center gap-2"><Spinner size={14} /> Checking availability…</p>}
            {selectedDate && !checking && availability[selectedDate] === false && (
              <p className="text-red-400 text-sm mt-2">This date is unavailable. Please choose another.</p>
            )}
            {selectedDate && !checking && availability[selectedDate] === true && (
              <p className="text-green-400 text-sm mt-2">✓ This date is available!</p>
            )}
          </div>
          <div>
            <label className="block text-smoke text-sm mb-2">Preferred start time</label>
            <input
              type="time"
              value={preferredTime}
              onChange={e => setPreferredTime(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-soft-white focus:outline-none focus:border-amber/60 transition-colors"
            />
          </div>
          <Button
            className="w-full"
            disabled={!selectedDate || !preferredTime || availability[selectedDate] === false || checking}
            onClick={() => setStep('details')}
          >
            Continue
          </Button>
        </div>
      )}

      {step === 'details' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {(['name', 'email', 'phone', 'address'] as const).map(field => (
            <div key={field}>
              <label className="block text-smoke text-sm mb-1 capitalize">{field === 'address' ? 'Event Address' : field}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                required
                value={form[field]}
                onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-soft-white focus:outline-none focus:border-amber/60 transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block text-smoke text-sm mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-soft-white focus:outline-none focus:border-amber/60 transition-colors resize-none"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setStep('date')}>Back</Button>
            <Button type="submit" className="flex-1" loading={submitting}>Confirm Booking</Button>
          </div>
        </form>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Create app/(public)/confirmation/page.tsx**

```tsx
import { getBooking, getPackage } from '@/lib/dynamo'
import Link from 'next/link'

export default async function ConfirmationPage({ searchParams }: { searchParams: { id?: string } }) {
  const booking = searchParams.id ? await getBooking(searchParams.id) : null

  if (!booking) return (
    <div className="max-w-lg mx-auto px-6 py-16 text-center">
      <p className="text-smoke">Booking not found.</p>
      <Link href="/" className="text-amber mt-4 block">← Back to packages</Link>
    </div>
  )

  const pkg = await getPackage(booking.packageId)

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-amber/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-amber text-2xl">✓</span>
        </div>
        <h1 className="text-3xl font-light text-soft-white mb-2">Request Received!</h1>
        <p className="text-smoke">We'll confirm your booking within 24 hours.</p>
      </div>
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-3">
        <div className="flex justify-between"><span className="text-smoke text-sm">Package</span><span className="text-soft-white">{pkg?.name}</span></div>
        <div className="flex justify-between"><span className="text-smoke text-sm">Date</span><span className="text-soft-white">{booking.date}</span></div>
        <div className="flex justify-between"><span className="text-smoke text-sm">Time</span><span className="text-soft-white">{booking.preferredTime}</span></div>
        <div className="flex justify-between"><span className="text-smoke text-sm">Status</span><span className="text-amber text-sm font-medium">Pending Confirmation</span></div>
        <div className="flex justify-between"><span className="text-smoke text-sm">Reference</span><span className="text-soft-white font-mono text-xs">{booking.bookingId}</span></div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add app/\(public\)/ components/booking/
git commit -m "feat: add customer booking flow (package selection, date/form, confirmation)"
```

---

## Task 12: Admin UI

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/bookings/[id]/page.tsx`
- Create: `app/admin/packages/page.tsx`
- Create: `components/admin/BookingTable.tsx`
- Create: `components/admin/ConfirmModal.tsx`
- Create: `components/admin/PackageForm.tsx`

- [ ] **Step 1: Create app/admin/layout.tsx**

```tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-charcoal">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141414]">
        <span className="text-amber font-semibold tracking-wider">HAPPY SHISHA <span className="text-smoke font-normal text-sm ml-2">Admin</span></span>
        <div className="flex gap-6">
          <a href="/admin" className="text-smoke hover:text-soft-white text-sm transition-colors">Bookings</a>
          <a href="/admin/packages" className="text-smoke hover:text-soft-white text-sm transition-colors">Packages</a>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: Create components/admin/BookingTable.tsx**

```tsx
'use client'
import { useState } from 'react'
import type { Booking, BookingStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

const TABS: (BookingStatus | 'ALL')[] = ['ALL', 'PENDING', 'CONFIRMED', 'PAID', 'CANCELLED']

export function BookingTable({ bookings }: { bookings: Booking[] }) {
  const [filter, setFilter] = useState<BookingStatus | 'ALL'>('ALL')
  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b border-white/10">
        {TABS.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${filter === t ? 'border-amber text-amber' : 'border-transparent text-smoke hover:text-soft-white'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-smoke text-left border-b border-white/10">
              {['Customer', 'Package ID', 'Date', 'Time', 'Status', ''].map(h => (
                <th key={h} className="pb-3 pr-4 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(b => (
              <tr key={b.bookingId} className="hover:bg-white/[0.02]">
                <td className="py-3 pr-4">
                  <p className="text-soft-white">{b.name}</p>
                  <p className="text-smoke text-xs">{b.email}</p>
                </td>
                <td className="py-3 pr-4 text-smoke font-mono text-xs">{b.packageId.slice(0, 8)}…</td>
                <td className="py-3 pr-4 text-soft-white">{b.date}</td>
                <td className="py-3 pr-4 text-soft-white">{b.preferredTime}</td>
                <td className="py-3 pr-4"><Badge status={b.status} /></td>
                <td className="py-3">
                  <Link href={`/admin/bookings/${b.bookingId}`} className="text-amber text-xs hover:underline">View →</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-smoke">No bookings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create app/admin/page.tsx**

```tsx
import { listAllBookings } from '@/lib/dynamo'
import { BookingTable } from '@/components/admin/BookingTable'

export default async function AdminPage() {
  const bookings = await listAllBookings()
  return (
    <div>
      <h1 className="text-2xl font-light text-soft-white mb-6">Bookings</h1>
      <BookingTable bookings={bookings} />
    </div>
  )
}
```

- [ ] **Step 4: Create components/admin/ConfirmModal.tsx**

```tsx
'use client'
import { useState, useTransition } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface ConfirmModalProps { bookingId: string; open: boolean; onClose: () => void }

export function ConfirmModal({ bookingId, open, onClose }: ConfirmModalProps) {
  const [paymentLink, setPaymentLink] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleConfirm() {
    setError('')
    if (!paymentLink) { setError('Payment link is required'); return }
    startTransition(async () => {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED', paymentLink }),
      })
      if (!res.ok) { setError('Failed to confirm booking'); return }
      onClose()
      router.refresh()
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Confirm Booking">
      <p className="text-smoke text-sm mb-4">Paste the Yoco payment link below. It will be emailed to the customer.</p>
      <input
        type="url"
        placeholder="https://pay.yoco.com/..."
        value={paymentLink}
        onChange={e => setPaymentLink(e.target.value)}
        className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-soft-white focus:outline-none focus:border-amber/60 mb-3 transition-colors text-sm"
      />
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
        <Button className="flex-1" loading={isPending} onClick={handleConfirm}>Send Confirmation</Button>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 5: Create app/admin/bookings/[id]/page.tsx**

```tsx
import { getBooking, getPackage } from '@/lib/dynamo'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { BookingActions } from '@/components/admin/BookingActions'

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const booking = await getBooking(params.id)
  if (!booking) notFound()
  const pkg = await getPackage(booking.packageId)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light text-soft-white">Booking Detail</h1>
        <Badge status={booking.status} />
      </div>
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 mb-6 space-y-3">
        {[
          ['Customer', booking.name],
          ['Email', booking.email],
          ['Phone', booking.phone],
          ['Address', booking.address],
          ['Package', pkg?.name ?? booking.packageId],
          ['Date', booking.date],
          ['Preferred Time', booking.preferredTime],
          ['Notes', booking.notes ?? '—'],
          ['Booking ID', booking.bookingId],
          ['Created', new Date(booking.createdAt).toLocaleString('en-ZA')],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-4">
            <span className="text-smoke text-sm w-36 shrink-0">{label}</span>
            <span className="text-soft-white text-sm">{value}</span>
          </div>
        ))}
        {booking.paymentLink && (
          <div className="flex gap-4">
            <span className="text-smoke text-sm w-36 shrink-0">Payment Link</span>
            <a href={booking.paymentLink} className="text-amber text-sm hover:underline truncate">{booking.paymentLink}</a>
          </div>
        )}
      </div>
      <BookingActions booking={booking} />
    </div>
  )
}
```

- [ ] **Step 6: Create components/admin/BookingActions.tsx**

```tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Booking } from '@/types'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from './ConfirmModal'

export function BookingActions({ booking }: { booking: Booking }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function updateStatus(status: 'PAID' | 'CANCELLED') {
    if (!confirm(`Are you sure you want to mark this booking as ${status}?`)) return
    startTransition(async () => {
      await fetch(`/api/admin/bookings/${booking.bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap gap-3">
      {booking.status === 'PENDING' && (
        <Button onClick={() => setConfirmOpen(true)}>Confirm Booking</Button>
      )}
      {booking.status === 'CONFIRMED' && (
        <Button variant="outline" onClick={() => updateStatus('PAID')} loading={isPending}>Mark as Paid</Button>
      )}
      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
        <Button variant="danger" onClick={() => updateStatus('CANCELLED')} loading={isPending}>Cancel Booking</Button>
      )}
      <ConfirmModal bookingId={booking.bookingId} open={confirmOpen} onClose={() => setConfirmOpen(false)} />
    </div>
  )
}
```

- [ ] **Step 7: Create app/admin/packages/page.tsx**

```tsx
import { listAllPackages } from '@/lib/dynamo'
import { PackageManager } from '@/components/admin/PackageManager'

export default async function PackagesPage() {
  const packages = await listAllPackages()
  return (
    <div>
      <h1 className="text-2xl font-light text-soft-white mb-6">Packages</h1>
      <PackageManager packages={packages} />
    </div>
  )
}
```

- [ ] **Step 8: Create components/admin/PackageManager.tsx**

```tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Package } from '@/types'
import { Button } from '@/components/ui/Button'

export function PackageManager({ packages }: { packages: Package[] }) {
  const [editing, setEditing] = useState<Package | null>(null)
  const [creating, setCreating] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const emptyForm = { name: '', description: '', price: 0, duration: '', includedItems: [''], active: true, displayOrder: packages.length }

  async function save(data: Omit<Package, 'packageId'> | Package) {
    const isNew = !('packageId' in data)
    const res = await fetch('/api/admin/packages', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) { setEditing(null); setCreating(false); router.refresh() }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => setCreating(true)}>+ New Package</Button>
      </div>
      <div className="space-y-3">
        {packages.map(pkg => (
          <div key={pkg.packageId} className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
            <div>
              <p className="text-soft-white font-medium">{pkg.name} <span className="text-amber ml-2">R{pkg.price.toLocaleString()}</span></p>
              <p className="text-smoke text-sm">{pkg.duration} · {pkg.active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(pkg)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => save({ ...pkg, active: !pkg.active })}>
                {pkg.active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        ))}
      </div>
      {(creating || editing) && (
        <PackageForm
          initial={editing ?? emptyForm as any}
          onSave={save}
          onCancel={() => { setEditing(null); setCreating(false) }}
        />
      )}
    </div>
  )
}

function PackageForm({ initial, onSave, onCancel }: { initial: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial)
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-[#242424] rounded-xl border border-amber/20 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-medium text-soft-white mb-4">{form.packageId ? 'Edit' : 'New'} Package</h2>
        <div className="space-y-3">
          {['name', 'description', 'duration'].map(f => (
            <div key={f}><label className="text-smoke text-sm capitalize">{f}</label>
              <input value={form[f]} onChange={e => set(f, e.target.value)} className="w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-soft-white text-sm focus:outline-none focus:border-amber/60" />
            </div>
          ))}
          <div><label className="text-smoke text-sm">Price (ZAR)</label>
            <input type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} className="w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-soft-white text-sm focus:outline-none focus:border-amber/60" />
          </div>
          <div><label className="text-smoke text-sm">Included Items (one per line)</label>
            <textarea value={form.includedItems.join('\n')} onChange={e => set('includedItems', e.target.value.split('\n').filter(Boolean))} rows={4} className="w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-soft-white text-sm focus:outline-none focus:border-amber/60 resize-none" />
          </div>
          <div><label className="text-smoke text-sm">Display Order</label>
            <input type="number" value={form.displayOrder} onChange={e => set('displayOrder', Number(e.target.value))} className="w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-soft-white text-sm focus:outline-none focus:border-amber/60" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button className="flex-1" onClick={() => onSave(form)}>Save</Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Commit**

```bash
git add app/admin/ components/admin/
git commit -m "feat: add admin dashboard (booking list, detail, confirm/cancel, packages)"
```

---

## Task 13: Seed Initial Packages

**Files:**
- Create: `scripts/seed-packages.ts`

- [ ] **Step 1: Create scripts/seed-packages.ts**

```ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'eu-west-1' }))
const TABLE = process.env.PACKAGES_TABLE ?? 'happy-shisha-packages'

const packages = [
  {
    packageId: uuidv4(),
    name: 'Basic Package',
    description: 'Perfect for intimate gatherings and small events.',
    price: 1500,
    duration: '3 hours',
    includedItems: ['1 shisha pipe', '3 flavour options', 'Coal service', 'Setup & pack-down'],
    active: true,
    displayOrder: 1,
  },
  {
    packageId: uuidv4(),
    name: 'Premium Package',
    description: 'The full Happy Shisha experience for larger events.',
    price: 2500,
    duration: '5 hours',
    includedItems: ['2 shisha pipes', '6 flavour options', 'Dedicated attendant', 'Coal service', 'Premium accessories', 'Setup & pack-down'],
    active: true,
    displayOrder: 2,
  },
]

async function seed() {
  for (const pkg of packages) {
    await client.send(new PutCommand({ TableName: TABLE, Item: pkg }))
    console.log(`Seeded: ${pkg.name}`)
  }
}

seed().catch(console.error)
```

- [ ] **Step 2: Run seed (after infra is applied)**

```bash
AWS_PROFILE=alex npx ts-node --esm scripts/seed-packages.ts
```

- [ ] **Step 3: Commit**

```bash
git add scripts/
git commit -m "feat: add package seed script"
```

---

## Task 14: Local Dev Verification

- [ ] **Step 1: Copy `.env.local.example` to `.env.local` and fill in values**

Values from `Happy Shisha/infra/variables.tf` and Tofu outputs:
```
SMTP_HOST=www74.cpt1.host-h.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=jaylene@happyevents.co.za
SMTP_PASS=1m5p07N34W3j30
# Fill in from tofu output:
COGNITO_USER_POOL_ID=...
COGNITO_CLIENT_ID=...
GOOGLE_CALENDAR_ID=...
GOOGLE_CREDENTIALS=...
BOOKINGS_TABLE=happy-shisha-bookings
PACKAGES_TABLE=happy-shisha-packages
AWS_REGION=eu-west-1
```

- [ ] **Step 2: Run dev server**

```bash
npm run dev
```

Expected: App runs at `http://localhost:3000`. Package selection page loads (empty if not seeded).

- [ ] **Step 3: Run seed against local AWS profile**

```bash
AWS_PROFILE=alex npx ts-node scripts/seed-packages.ts
```

Reload `http://localhost:3000` — packages should appear.

- [ ] **Step 4: Test booking flow end-to-end**

1. Select a package
2. Pick a date 2+ days out
3. Fill in details
4. Submit → redirected to `/confirmation?id=...`
5. Check `jaylene@happyevents.co.za` — two emails received (customer acknowledgement + admin notification)

- [ ] **Step 5: Test contact form** (using a REST client like Bruno or Postman)

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"0821234567","eventType":"Birthday","message":"Test message"}'
```

Expected: `{"success":true,"message":"Email sent successfully"}`
Check inbox for both admin notification and auto-responder.

- [ ] **Step 6: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: All tests PASS.

---

## Task 15: Deploy to Amplify

- [ ] **Step 0: Create the Google Calendar (prerequisite)**

This must be done before applying Tofu infra.

1. Go to [calendar.google.com](https://calendar.google.com) → Settings → Add calendar → Create new calendar
2. Name it: `Happy Shisha Bookings`
3. Go to calendar settings → Share with specific people → add the service account email (from `service-account.json`, the `client_email` field) with **Make changes to events** permission
4. Copy the **Calendar ID** (found under Integrate calendar → Calendar ID, looks like `abc123@group.calendar.google.com`)
5. Use this as `google_calendar_id` in `tofu apply`

- [ ] **Step 1: Create GitHub repo and push**

```bash
git remote add origin https://github.com/YOUR_ORG/happy-shisha-booking-platform.git
git push -u origin main
```

- [ ] **Step 2: Apply Tofu infra** (if not already done in Task 3)

```bash
cd infra
tofu apply \
  -var="github_token=YOUR_TOKEN" \
  -var="github_repo=YOUR_ORG/happy-shisha-booking-platform" \
  -var="smtp_pass=1m5p07N34W3j30" \
  -var="google_credentials=$(cat service-account.json)" \
  -var="google_calendar_id=YOUR_CAL_ID"
```

- [ ] **Step 3: Check Amplify deployment**

```bash
aws amplify list-jobs --app-id $(tofu output -raw amplify_app_id) --branch-name main --profile alex
```

Wait for `SUCCEED` status.

- [ ] **Step 4: Verify domain**

```bash
aws amplify get-domain-association \
  --app-id $(tofu output -raw amplify_app_id) \
  --domain-name happyshisha.co.za \
  --profile alex
```

Check DNS CNAME record is correctly pointing `booking.happyshisha.co.za` to the Amplify URL.

- [ ] **Step 5: Create Cognito admin user**

```bash
aws cognito-idp admin-create-user \
  --user-pool-id $(tofu output -raw cognito_user_pool_id) \
  --username jaylene@happyevents.co.za \
  --temporary-password "TempPass123!" \
  --region eu-west-1 \
  --profile alex
```

- [ ] **Step 6: Smoke test production**

1. Visit `https://booking.happyshisha.co.za` — packages load
2. Complete a test booking — emails arrive
3. Visit `https://booking.happyshisha.co.za/admin` — redirects to Cognito login
4. Log in → booking list loads
5. Confirm a test booking, paste a fake Yoco link → confirmation email sent

---

## Task 16: Migrate Contact Form Lambda

- [ ] **Step 1: Verify new `/api/contact` end-to-end in production**

```bash
curl -X POST https://booking.happyshisha.co.za/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"jaylene@happyevents.co.za","phone":"0821234567","eventType":"Test"}'
```

Confirm email receipt at `jaylene@happyevents.co.za`.

- [ ] **Step 2: Update marketing site to point to new contact API**

In `../Happy Shisha/src/`, find usages of the old Lambda API Gateway URL and update to `https://booking.happyshisha.co.za/api/contact`.

```bash
grep -r "execute-api" "../Happy Shisha/src/"
```

Update the URL in the component(s) found.

- [ ] **Step 3: Monitor for 48 hours**

Check Amplify CloudWatch logs — zero errors on `/api/contact`.

- [ ] **Step 4: Decommission old Lambda**

```bash
cd "../Happy Shisha/infra"
tofu destroy \
  -target aws_lambda_function.contact \
  -target aws_apigatewayv2_api.api \
  -target aws_apigatewayv2_integration.lambda \
  -target aws_apigatewayv2_route.contact \
  -target aws_apigatewayv2_stage.default \
  -target aws_lambda_permission.apigw
```

- [ ] **Step 5: Remove SMTP password from variables.tf**

In `../Happy Shisha/infra/variables.tf`, remove the `default` value from `smtp_pass`. Credentials now live only in SSM.

- [ ] **Step 6: Commit marketing site changes**

```bash
cd "../Happy Shisha"
git add src/
git commit -m "fix: update contact API URL to new booking platform endpoint"
```

---

## Run All Tests

```bash
npx jest --coverage
```

Expected: All test suites pass. Coverage report generated.

---

## Done

The platform is live at `booking.happyshisha.co.za`. The old Lambda contact handler is decommissioned. The admin dashboard is accessible at `/admin` via Cognito login.
