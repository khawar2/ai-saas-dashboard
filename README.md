# Nexora AI SaaS Platform

A production-oriented AI SaaS starter built with Next.js, React, TypeScript, Tailwind CSS, MongoDB, Stripe, and OpenAI. It includes authentication, protected workspace pages, AI chat, usage tracking, Stripe billing, admin monitoring, and document upload preparation for future AI Q&A.

## Features

- Modern SaaS landing page and responsive app shell
- Secure signup, login, logout, signed HTTP-only sessions, and role-based access
- AI chat with OpenAI integration, conversation history, loading states, errors, and usage tracking
- MongoDB models for users, conversations, messages, subscriptions, usage logs, admin activity, and uploaded documents
- Stripe checkout, webhook sync, free/pro plans, cancellation, downgrade, and resume flows
- Admin panel for users, subscriptions, usage, conversations, and system activity
- PDF/TXT/Markdown uploads with validation, private storage, and extracted text stored for later document Q&A
- Production hardening: security headers, safe redirects, same-origin checks, route rate limits, and sanitized API responses

## Tech Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS 4
- MongoDB Atlas
- OpenAI API
- Stripe Billing
- Vercel deployment

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Set at minimum:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=...
MONGODB_DB=ai_saas_dashboard
AUTH_SECRET=...
OPENAI_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_PRO_PRICE_ID=...
STRIPE_WEBHOOK_SECRET=...
```

Generate a strong auth secret:

```bash
openssl rand -base64 32
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL. Use the deployed Vercel URL in production. |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string. |
| `MONGODB_DB` | Yes | Database name. |
| `AUTH_SECRET` | Yes | Strong random secret, at least 32 characters. |
| `ADMIN_EMAILS` | No | Comma-separated emails that become admins on signup. |
| `UPLOAD_STORAGE_DIR` | No | Local upload directory. On Vercel, `/tmp/ai-saas-uploads` is recommended for temporary files. |
| `AI_PROVIDER` | Yes | Currently `openai`. |
| `OPENAI_API_KEY` | Yes | OpenAI API key. |
| `OPENAI_MODEL` | Yes | OpenAI model, for example `gpt-4o-mini`. |
| `AI_PROVIDER_MODEL` | No | Optional model override used by internal model metadata. |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key. |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe recurring price id for the Pro plan. |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret. |

## MongoDB Setup

1. Create a MongoDB Atlas cluster.
2. Add a database user and allow your deployment IPs. For Vercel, allow access from `0.0.0.0/0` only if your security model permits it, or use a more restrictive network setup.
3. Set `MONGODB_URI` and `MONGODB_DB` in `.env.local` and Vercel.
4. Indexes are created by the app when collections are first accessed.

## Stripe Setup

1. Create a Stripe product and recurring price for the Pro plan.
2. Set `STRIPE_PRO_PRICE_ID` to the recurring price id.
3. Add a webhook endpoint:

```text
https://your-domain.com/api/billing/webhook
```

4. Subscribe to these events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

5. Set `STRIPE_WEBHOOK_SECRET` from the webhook endpoint settings.

## File Uploads

Uploads support PDF, TXT, and Markdown up to 10MB. Metadata and extracted text are stored in MongoDB.

For local development, files are written to `.storage/uploads`.

For Vercel, use `/tmp/ai-saas-uploads` if you only need temporary binary files. Vercel serverless storage is ephemeral, so use Vercel Blob, S3, or Cloudflare R2 for durable file storage in a production product.

## Deployment on Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set all production environment variables in Vercel Project Settings.
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel production URL.
5. Deploy.

This project includes `vercel.json` with:

- `framework: nextjs`
- `installCommand: npm ci`
- `buildCommand: npm run build`

## Production Checklist

- Use a strong `AUTH_SECRET`; do not reuse the example value.
- Configure MongoDB Atlas credentials and network access.
- Configure Stripe live mode keys and webhook secret.
- Configure `NEXT_PUBLIC_APP_URL` to the production domain.
- Configure `OPENAI_API_KEY` with appropriate account limits.
- Consider durable object storage for uploaded binary files.
- Review `ADMIN_EMAILS` before first production signup.
- Run `npm run check` and `npm run build` before pushing.

## Scripts

```bash
npm run dev        # start local dev server
npm run lint       # run ESLint
npm run typecheck  # run TypeScript type checking
npm run check      # lint and typecheck
npm run build      # production build
npm run start      # start production server
```

## Security Notes

- Sessions use signed HTTP-only cookies.
- Protected app routes are enforced in middleware and server layouts.
- Admin routes are checked by role in middleware and server code.
- State-changing browser routes include same-origin checks.
- High-risk routes include lightweight rate limiting.
- API responses avoid returning password hashes, secrets, raw provider errors, and file paths.

## Portfolio Notes

This project is suitable as a professional portfolio foundation. Before publishing publicly, keep `.env.local`, `.storage`, `.vercel`, and any generated uploads out of Git. The included `.gitignore` already excludes these files.
