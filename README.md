<h1 align="center">AI SaaS Platform</h1>

<h3 align="center">
Modern AI Powered SaaS Platform built with Next.js React Node.js MongoDB and OpenAI
</h3>

<p align="center">
A production-style AI SaaS application with authentication, AI chat, subscription billing, dashboards, admin panel, usage tracking, and scalable architecture.
</p>

<p align="center">
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" />
<img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

---

# 🚀 Overview

This project is a modern AI SaaS platform designed to simulate a real production-grade software product.

The application allows users to:

- Create accounts and authenticate securely
- Interact with AI powered chat
- Manage conversations and history
- Upload files and documents
- Track usage and subscription limits
- Manage billing and subscriptions
- Access dashboards and analytics
- Use a responsive modern UI across devices

The goal of this project is to demonstrate scalable full stack architecture, AI integration, SaaS workflows, and production-level engineering practices.

---

# ✨ Features

## Authentication
- Secure login and signup
- Protected routes
- Session handling
- Role based access

---

## AI Chat System
- OpenAI integration
- Real-time chat interface
- Conversation history
- Persistent chat storage
- Streaming AI responses

---

## Dashboard
- User analytics
- Usage tracking
- Recent conversations
- Subscription overview
- Responsive dashboard UI

---

## Billing & Subscription
- Stripe integration
- Free and Pro plans
- Subscription management
- Usage limits

---

## File Upload Support
- PDF upload
- Document handling
- AI document processing foundation

---

## Admin Panel
- User management
- Usage monitoring
- Subscription overview
- Activity tracking

---

# 🛠 Tech Stack

## Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand / Redux Toolkit

---

## Backend
- Node.js
- Next.js API Routes
- REST APIs
- Authentication Middleware

---

## Database
- MongoDB
- Mongoose

---

## AI & Automation
- OpenAI API
- AI Chat Workflows

---

## DevOps & Deployment
- Vercel
- GitHub Actions
- Environment Configuration

---

# 📂 Project Structure

```bash
src/
│
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── services/
├── store/
├── models/
├── api/
├── styles/
└── utils/
```

---

# 📸 Screenshots

## Landing Page
Modern SaaS landing page with hero section, pricing, and features.

---

## Dashboard
Analytics dashboard with usage tracking and AI activity.

---

## AI Chat
Responsive AI chat interface with conversation history.

---

## Admin Panel
Admin dashboard for monitoring users and subscriptions.

---

# ⚡ Performance Optimizations

- Lazy loading
- Optimized API calls
- Component memoization
- Responsive rendering
- Reusable component architecture
- Efficient state management

---

# 🔐 Security Features

- Protected API routes
- Secure authentication flow
- Environment variable management
- Role-based authorization
- Input validation

---

# 🌱 Future Improvements

- Multi-model AI support
- RAG integrations
- Vector database support
- AI document analysis
- Team collaboration
- Real-time notifications

---

# 🧠 What This Project Demonstrates

This project demonstrates experience with:

- Full Stack Development
- SaaS Architecture
- AI Integration
- Authentication Systems
- Dashboard Development
- API Integration
- State Management
- Production-Ready Frontend Architecture
- Scalable Backend Design

---

# 🚀 Getting Started

## Install Dependencies

```bash
npm install
```

---

## Start Development Server

```bash
npm run dev
```

---

## Run Quality Checks

```bash
npm run lint
npm run typecheck
npm run check
npm run build
```

---

## Playwright E2E Tests

Install browser binaries once:

```bash
npx playwright install
```

Run the full suite:

```bash
npm run test:e2e
```

Run with the Playwright UI:

```bash
npm run test:e2e:ui
```

Public and unauthenticated security tests can run without external services. Authenticated tests require:

```env
MONGODB_URI=
MONGODB_DB=ai_saas_dashboard
AUTH_SECRET=generate-a-strong-32-plus-character-secret
```

Admin tests additionally require:

```env
PLAYWRIGHT_ADMIN_EMAIL=
PLAYWRIGHT_ADMIN_PASSWORD=
```

The E2E suite mocks OpenAI and Stripe flows where appropriate, so tests do not use real AI credits or process real payments.

---

## Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=
OPENAI_API_KEY=
AUTH_SECRET=
STRIPE_SECRET_KEY=
STRIPE_PRO_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

---

# 🌐 Deployment

Frontend deployment supported on:

- Vercel
- Netlify

Backend and database can be deployed using:

- Railway
- Render
- MongoDB Atlas

---

# 👨‍💻 Author

### Khawar Saeed

- GitHub: https://github.com/khawar2
- LinkedIn: https://www.linkedin.com/in/khawar-saeed096/
- Email: khawarsaeed26@gmail.com

---

# ⭐ Project Goal

The goal of this project is to showcase modern AI SaaS architecture, scalable frontend engineering, and production-level full stack development practices using the MERN ecosystem and AI integrations.
