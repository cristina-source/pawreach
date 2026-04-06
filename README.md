# PawReach

Email marketing and CRM platform built for the pet industry. Manage contacts, build segments, create AI-powered email campaigns, and automate outreach -- all tailored for pet shops, groomers, vet clinics, and other pet businesses.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL via Prisma (with `@prisma/adapter-pg`)
- **Auth:** NextAuth v5 (Google OAuth + Resend magic links)
- **Email:** Resend
- **Payments:** Stripe (Free / Solo / Growth plans)
- **AI:** Anthropic Claude (email template generation)
- **Styling:** Tailwind CSS v4

## Prerequisites

- Node.js 20+
- PostgreSQL database (e.g. Neon, Supabase, Railway)
- Stripe account with two price IDs configured (Solo and Growth)
- Google OAuth credentials
- Resend API key
- Anthropic API key

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Fill in all values in `.env.local`. See `.env.example` for the full list.

3. **Push the database schema:**

   ```bash
   npx prisma db push
   ```

4. **Seed the database (optional):**

   ```bash
   npm run db:seed
   ```

5. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3001](http://localhost:3001) in your browser.

## Deploy to Vercel

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add all environment variables from `.env.example` in the Vercel project settings.
   - Set `AUTH_URL` and `NEXTAUTH_URL` to your production domain (e.g. `https://pawreach.vercel.app`).
4. Deploy. Prisma Client is generated automatically during the build (`prisma generate && next build`).
5. Configure the Stripe webhook endpoint to point to `https://your-domain.vercel.app/api/webhooks/stripe`.

## Key Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start dev server on port 3001     |
| `npm run build`  | Generate Prisma Client and build   |
| `npm run start`  | Start production server            |
| `npm run db:push`| Push Prisma schema to database     |
| `npm run db:seed`| Seed database with sample data     |
| `npm run lint`   | Run ESLint                         |
