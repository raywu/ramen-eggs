# Asianova Collective

Weekly ramen egg delivery service, currently in beta in Oakland & Berkeley, CA. This repo is the landing page with a native signup form that writes to Airtable.

## Stack

- Next.js 15 (App Router, static export)
- TypeScript
- Tailwind CSS v4
- Cloudflare Pages (hosting + serverless functions)
- Vitest + React Testing Library

## Architecture

The site is statically exported (`output: "export"`) so Next.js API routes aren't available. The signup form needs to call the Airtable API with a Personal Access Token (PAT), which can't be exposed in the browser.

`functions/api/signup.ts` is a Cloudflare Pages Function — a serverless handler that runs on Cloudflare's edge, holds the PAT, and proxies form submissions to Airtable.

Wrangler is needed locally to serve these functions alongside the static build.

```
Browser POST /api/signup → Cloudflare Pages Function → Airtable API
                            (holds AIRTABLE_PAT)
```

## Environment variables

| Variable | Description | Where to set |
|----------|-------------|--------------|
| `AIRTABLE_PAT` | Airtable Personal Access Token | Cloudflare Pages dashboard (Settings > Environment variables) |

Create the PAT at [airtable.com/create/tokens](https://airtable.com/create/tokens) with scope `data.records:write`, restricted to the base.

`.env*` files are gitignored.

## Development

```sh
# Frontend only (no API)
npm run dev

# Build static site to out/
npm run build

# Full local dev with Pages Functions
npx wrangler pages dev out --binding AIRTABLE_PAT=<token>

# Run tests
npm test

# Tests in watch mode
npm run test:watch
```

## Deployment

Hosted on Cloudflare Pages. Deploys automatically on push to `main` via GitHub integration — no manual deploy command or `CLOUDFLARE_API_TOKEN` needed.

- Build command: `npm run build`
- Output directory: `out`
- Set `AIRTABLE_PAT` in Cloudflare Pages dashboard
- Custom domains: `theasianova.com`, `www.theasianova.com`

## Project structure

```
app/            Next.js App Router pages and layout
components/     React components (Nav, Hero, SignupForm, etc.)
functions/      Cloudflare Pages Functions (API proxy)
doc/            Product spec and notes
public/         Static assets
```
