# Resurgence full-stack marketplace

Node.js + Express + PostgreSQL marketplace. Includes user registration/login, one environment-configured admin, A/B/C listings, approval moderation, basic orders, seller metrics and optional AI product catalogue Q&A.

## Deploy with GitHub + Render
1. Create a **private** GitHub repository (e.g. `resurgence`). Upload the contents of this folder to the repository root. `package.json`, `render.yaml`, `src/` and `public/` must be at the root.
2. In Render choose **New + → Blueprint**, connect GitHub and select the repository. Render reads `render.yaml` and provisions the Node service and PostgreSQL database.
3. In the Render web service Environment settings, set `ADMIN_EMAIL` and a strong unique `ADMIN_PASSWORD` (10+ characters). Optionally set `OPENAI_API_KEY` for the assistant. Never put the key in frontend files or commit it.
4. Deploy. Your public URL will be similar to `https://resurgence-marketplace.onrender.com` (Render may change the name if already taken).
5. Log in through the normal login portal with the configured admin email/password. The account menu opens the admin dashboard.

## Local run
Node 20+ and PostgreSQL required. `cp .env.example .env`, fill in database URL, JWT secret and admin credentials, then `npm install && npm start`; open http://localhost:3000.

## Scope and production caveats
This is a functional starter/demo, not a fully audited commerce platform. Orders do not take payment, calculate shipping or connect to couriers. Buyer/seller live chat, photo uploads, email verification, password reset, refunds, delivery tracking, charity integration, CSRF hardening, backups and monitoring still need implementation before real commercial use. C-Type listings are hidden from buyers and sent to recycling/donation review. AI uses the current approved A/B catalogue only and cannot access private order tracking. Admin account is created from environment variables at startup; public registration cannot select the admin role.
