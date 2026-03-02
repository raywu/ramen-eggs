# Asianova Collective

Weekly ramen egg delivery service, currently in beta in Oakland & Berkeley, CA. This repo powers the landing page (with signup form) and a time-gated order form — both proxied to Google Forms through Cloudflare Pages Functions.

## Stack

- Next.js 15 (App Router, static export)
- TypeScript
- Tailwind CSS v4
- Cloudflare Pages (hosting + serverless functions)
- Vitest + React Testing Library

## Architecture

The site is statically exported (`output: "export"`) so Next.js API routes aren't available. Form submissions are handled by Cloudflare Pages Functions that proxy to Google Forms.

```
Browser POST /api/signup → Cloudflare Pages Function → Google Forms
Browser POST /api/order  → Cloudflare Pages Function → Google Forms
```

No environment variables are needed — Google Forms accepts anonymous POST requests. `.env*` files are gitignored.

## Development

```sh
# Frontend only (no API)
npm run dev

# Build static site to out/
npm run build

# Full local dev with Pages Functions
npm run preview

# Run tests
npm test

# Tests in watch mode
npm run test:watch
```

## Deployment

Hosted on Cloudflare Pages. Deploys automatically on push to `main` via GitHub integration — no manual deploy command or `CLOUDFLARE_API_TOKEN` needed.

- Build command: `npm run build`
- Output directory: `out`
- Custom domains: `theasianova.com`, `www.theasianova.com`

## Project structure

```
app/              Next.js App Router pages and layout
app/order-form/   Time-gated order form page
components/       React components (Nav, Hero, SignupForm, OrderForm, etc.)
functions/        Cloudflare Pages Functions (API proxies)
lib/              Shared utilities (order window logic)
doc/              Product spec and notes
public/           Static assets
```
