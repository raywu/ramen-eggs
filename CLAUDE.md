# Asianova Collective, LLC — Project Context

## Business
Weekly ramen egg delivery service, currently in beta in Oakland & Berkeley, CA.
Sign-ups and orders via native forms, proxied to Google Forms through Cloudflare Pages Functions.

## Stack
- Next.js 15 (App Router, SSG via `output: "export"`)
- TypeScript
- Tailwind CSS v4
- Cloudflare Pages (hosting + serverless functions)
- Vitest + React Testing Library

## Key URLs
- Live site: `https://theasianova.com` / `https://www.theasianova.com`
- Signup Google Form: `https://docs.google.com/forms/d/e/1FAIpQLSc7c6kP2Bi0HXMM8-vtrsg-rMK5NeVaiNlM1i3UfEdakYkUvA/viewform`
- Order Google Form: `https://docs.google.com/forms/d/e/1FAIpQLSeKUZ2-OdTxR2wbVUo6-R2XvYZcydXLLelLn5KKbW8xkvc8qA/viewform`

## Order Form (`/order-form`)
- Time-gated: open Tuesdays 8:30 AM – 10 PM PT only
- Outside the window, shows a "closed" message with next opening time
- Preview mode: append `?preview=true` on localhost only to bypass the time gate
- Quantities: 5, 10, 15
- `sitemap.xml` intentionally omits `/order-form` (time-gated page)

## Brand Palette
- Background: `#111111` (dark)
- Text: `#EDEDED` (light gray)
- Accent: `#FF5C38` (red-orange)
- Borders: `#2A2A2A`

## Environment Variables
- None required (Google Forms accepts anonymous POST); `.env*` files are gitignored

## Security
- CORS restricted to `theasianova.com`, `www.theasianova.com`, `http://localhost` (with port)
- Signup backend validation: email format, 5-digit zip, phone >= 10 digits
- Order backend validation: required name/phone/quantity, phone >= 10 digits, quantity in [5, 10, 15]

## SEO
- `public/robots.txt` and `public/sitemap.xml` present
- OpenGraph + Twitter card meta in `app/layout.tsx`
- Font `display: "swap"` on both fonts

## Accessibility
- `FormField` component uses `useId()` + `htmlFor` + `cloneElement` for label-input association

## Development
```sh
npm run dev                # Next.js dev server (frontend only)
npm run preview            # Next.js dev + wrangler proxy (HMR + Pages Functions, reads .dev.vars)
npm test                   # Run tests
```

## Deployment
Deploys automatically to Cloudflare Pages on push to `main` via GitHub integration.
No manual deploy or `CLOUDFLARE_API_TOKEN` needed.

## Spec
Full spec in `doc/spec.md`.
