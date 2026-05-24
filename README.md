# Nexora AI SaaS Platform

A production-oriented AI SaaS platform built with Next.js App Router, React, TypeScript, Tailwind CSS, MongoDB, Stripe, OpenAI, and Playwright. It includes authentication, role-based access, AI chat, document uploads, usage tracking, billing flows, admin monitoring, and a polished responsive SaaS UI.

![Nexora AI landing page](public/screenshots/landing.png)

## Highlights

- Modern premium SaaS landing page and authenticated app shell
- Secure signup, login, logout, signed HTTP-only sessions, and protected routes
- Role-based user/admin access with admin-only routes and API checks
- AI chat workspace with conversation history, loading states, prompt shortcuts, and provider abstraction
- MongoDB-backed models for users, subscriptions, conversations, messages, usage logs, documents, and admin activity
- Stripe-ready billing flows for checkout, downgrade, cancellation, resume, and webhook sync
- Usage tracking for messages, tokens, daily/monthly limits, remaining credits, and upgrade messaging
- PDF/TXT/Markdown upload flow with validation, extracted text storage, and document listing
- Playwright E2E suite covering public, auth, protected, dashboard, chat, documents, billing, admin, settings, and API behavior
- Local development mode with temporary in-memory MongoDB for easy portfolio demos

## Screenshots

### Landing Page

![Landing page](public/screenshots/landing.png)

### Mobile Landing

![Mobile landing page](public/screenshots/landing-mobile.png)

### Dashboard

![Dashboard](public/screenshots/dashboard.png)

### AI Chat

![AI chat](public/screenshots/chat.png)

### Billing

![Billing page](public/screenshots/billing.png)

### Documents

![Documents page](public/screenshots/documents.png)

### Admin

![Admin panel](public/screenshots/admin.png)

## Tech Stack

Frontend:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

Backend and data:

- Next.js API routes
- MongoDB native driver
- Signed HTTP-only cookie sessions
- Zod validation

Integrations and tooling:

- OpenAI SDK
- Stripe SDK
- PDF parsing for document uploads
- Playwright E2E testing
- Vercel-ready deployment config

## Project Structure

```text
src/
  app/
    (app)/          Authenticated dashboard routes
    (auth)/         Login, signup, auth pages
    api/            API route handlers
  components/
    auth/           Login and signup form components
    chat/           AI chat UI
    documents/      Document upload UI
    ui/             Shared UI primitives
  lib/              Auth, AI, billing, uploads, env, utilities
  models/           MongoDB data access and schemas
tests/
  e2e/              Playwright specs by module
  fixtures/         Playwright fixtures and files
  utils/            Auth and test-user helpers
scripts/
  dev-with-memory-mongo.mjs
  e2e-with-memory-mongo.mjs
```

## Getting Started

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Run the app with temporary in-memory MongoDB:

```bash
npm run dev:local
```

Open [http://localhost:3000](http://localhost:3000).

Use `dev:local` for local demos when you do not want to install MongoDB or configure MongoDB Atlas. Data resets when the process stops.

## Environment Variables

For a persistent local or production setup, create `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.example.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=ai_saas_dashboard

AUTH_SECRET=replace-with-a-strong-32-plus-character-secret
ADMIN_EMAILS=admin@example.com

UPLOAD_STORAGE_DIR=.storage/uploads

AI_PROVIDER=openai
OPENAI_API_KEY=sk_replace_me
OPENAI_MODEL=gpt-4o-mini
AI_PROVIDER_MODEL=gpt-4o-mini

STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_PRO_PRICE_ID=price_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
```

Generate a strong auth secret:

```bash
openssl rand -base64 32
```

## Scripts

```bash
npm run dev           # Start Next.js with your configured environment
npm run dev:local     # Start Next.js with temporary in-memory MongoDB
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run typecheck     # Run TypeScript checks
npm run check         # Run lint and typecheck
npm run test:e2e      # Run Playwright tests against configured env
npm run test:e2e:local # Run complete E2E flow with in-memory MongoDB
npm run test:e2e:ui   # Open Playwright UI mode
```

## Testing

Run the complete local E2E flow:

```bash
npm run test:e2e:local
```

This starts an isolated in-memory MongoDB instance, injects test-only auth/admin credentials, starts Next.js on `http://localhost:3100`, and runs the Playwright suite serially for reliability.

The tests cover:

- Landing page and responsive navigation
- Signup, login, logout, invalid credentials, and auth redirects
- Protected route access rules
- Dashboard usage cards, plan limits, and upgrade messaging
- AI chat success, error, history, and prompt shortcut flows
- Document upload validation and listing
- Billing plans and subscription actions
- Admin route protection and admin tables
- Settings form behavior
- Protected and admin API behavior

## Deployment

The project is ready for Vercel deployment.

Before deploying:

- Set all production environment variables in Vercel
- Use a strong `AUTH_SECRET`
- Configure MongoDB Atlas
- Configure Stripe products, prices, and webhook secret
- Configure `NEXT_PUBLIC_APP_URL` to your production domain
- Use durable object storage such as Vercel Blob, S3, or Cloudflare R2 for production binary uploads
- Run `npm run check` and `npm run build`

## Security Notes

- Sessions use signed HTTP-only cookies
- Protected routes are enforced through middleware and server layouts
- Admin access is checked in middleware and API routes
- API input is validated with Zod
- Browser state-changing routes include same-origin checks
- Auth, chat, and upload routes include rate limiting
- API responses avoid exposing password hashes, raw provider errors, secrets, and file paths

## Portfolio Notes

This project demonstrates full-stack SaaS architecture, production-focused UI design, secure authentication, role-based access, database modeling, AI integration, billing workflows, file uploads, admin monitoring, and automated E2E testing.

## Author

Khawar Saeed

- GitHub: https://github.com/khawar2
- LinkedIn: https://www.linkedin.com/in/khawar-saeed096/
- Email: khawarsaeed26@gmail.com
