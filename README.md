# PeopleReview - PWA Reviews Service

A modern Progressive Web App for collecting and sharing reviews about people. Built with Next.js, React, TypeScript, TailwindCSS, and Supabase.

## Features

- ✅ User registration (email + password)
- ✅ User profiles with photo, description, hashtags
- ✅ Personal QR code for each profile
- ✅ Leave reviews with 1-5 star rating
- ✅ Feed with recent reviews
- ✅ Search users by name or hashtags
- ✅ Profile settings (edit photo, name, description, hashtags)
- ✅ Download QR code
- ✅ Fully responsive design
- ✅ PWA support (manifest, offline-ready)

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, TailwindCSS 4
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Icons:** react-icons
- **QR Code:** qrcode.react

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration from `supabase/migrations/00001_init.sql`
3. Copy your project URL and anon key from Settings → API

### 3. Configure environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/           # Pages (Next.js App Router)
│   ├── feed/      # Review feed
│   ├── login/     # Sign in
│   ├── register/  # Sign up
│   ├── profile/   # User profile with QR code
│   ├── search/    # User search
│   └── settings/  # Profile settings
├── components/    # Reusable components
│   ├── Navbar.tsx
│   └── ReviewCard.tsx
├── hooks/         # Custom hooks
│   └── useAuth.ts
├── lib/           # Client setup
│   └── supabase.ts
├── services/      # API calls
│   ├── auth.ts
│   ├── profiles.ts
│   └── reviews.ts
└── types/         # TypeScript types
    └── index.ts
```

## Future Features (not implemented)

- Payment for reviews
- AI analysis of reviews
- Moderation system
- Complaints/reports
- Business accounts
- Notifications
- Internal balance