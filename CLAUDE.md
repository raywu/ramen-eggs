# Asianova Collective, LLC — Project Context

## Business
Weekly ramen egg delivery service, currently in beta in Oakland & Berkeley, CA.
Sign-ups via native form, proxied to Airtable through Cloudflare Pages Functions.

## Stack
- Next.js 15 (App Router, SSG via `output: "export"`)
- TypeScript
- Tailwind CSS v4
- Cloudflare Pages (hosting + serverless functions)
- Vitest + React Testing Library

## Key URLs
- Live site: `https://theasianova.com` / `https://www.theasianova.com`
- Airtable form: `https://airtable.com/app0reAWbVwTy2hZQ/pagUFxDCJ9cuGJtGz/form`

## Brand Palette
- Background: `#111111` (dark)
- Text: `#EDEDED` (light gray)
- Accent: `#FF5C38` (red-orange)
- Borders: `#2A2A2A`

## Environment Variables
- `AIRTABLE_PAT` — set in Cloudflare Pages dashboard; `.env*` files are gitignored

## Development
```sh
npm run dev                # Next.js dev server (frontend only)
npm run preview            # Build + serve with Pages Functions (reads .dev.vars)
npm test                   # Run tests
```

## Spec
Full spec in `doc/spec.md`.
