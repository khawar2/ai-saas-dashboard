# Deployment Guide

## Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Use the default Next.js framework preset.
4. Add all production environment variables from `.env.example`.
5. Deploy.

## Required Production Environment

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://...
MONGODB_DB=ai_saas_dashboard
AUTH_SECRET=<strong 32+ character secret>
ADMIN_EMAILS=founder@your-domain.com
UPLOAD_STORAGE_DIR=/tmp/ai-saas-uploads

AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
AI_PROVIDER_MODEL=gpt-4o-mini

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Verification Commands

Run these before pushing or deploying:

```bash
npm run check
npm run build
```

## Stripe Webhook

Endpoint:

```text
https://your-domain.com/api/billing/webhook
```

Events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## Upload Storage Note

On Vercel, `/tmp` is temporary serverless storage. The app persists extracted document text in MongoDB, but durable binary file storage should use Vercel Blob, S3, or R2 for a real production deployment.
