# Architecture

## Overview

PeopleReview is a Next.js 15 PWA with Supabase backend. The architecture follows a service-oriented pattern with clear separation of concerns.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State**: React hooks + Supabase realtime
- **Payments**: Abstracted via PaymentProvider interface
- **Cache**: In-memory (Redis-ready)
- **Storage**: Supabase Storage (S3/R2-ready)

## Project Structure

```
src/
├── app/           # Next.js App Router pages
│   ├── admin/     # Admin panel
│   ├── balance/   # User balance
│   ├── feed/      # Review feed
│   ├── login/     # Authentication
│   ├── profile/   # User profiles
│   ├── register/  # Registration
│   ├── scan/      # QR scanner
│   ├── search/    # User search
│   ├── settings/  # Profile settings
│   └── topup/     # Credit purchase
├── components/    # Shared components
├── hooks/         # Custom hooks
├── lib/           # Core libraries
├── middleware.ts  # Security & routing
├── services/      # Business logic
│   ├── payments/  # Payment layer
│   │   └── providers/  # Payment provider stubs
│   ├── ai.ts      # AI service (stub)
│   ├── audit.ts   # Audit logging
│   ├── cache.ts   # Cache service
│   ├── monitoring.ts # Monitoring (stub)
│   ├── notifications.ts # Notifications
│   ├── profiles.ts # Profile CRUD
│   ├── purchaseHistory.ts # Purchase records
│   ├── reviews.ts # Review CRUD
│   ├── roles.ts   # Role management
│   ├── storage.ts # File storage
│   └── wallet.ts  # Credit wallet
├── types/         # TypeScript types
└── payment/       # Legacy payment (migrating)
```

## Data Flow

1. Client → Next.js Page → Service → Supabase
2. All balance changes go through wallet.ts (server-side)
3. Payments go through PaymentService → PaymentProvider
4. Audit events are logged for all critical operations

## Security

- RLS policies on all Supabase tables
- Role-based access (USER, BUSINESS, MODERATOR, ADMIN, SUPER_ADMIN)
- Security headers via middleware
- No client-side balance manipulation