# Asianova Collective

Weekly ramen egg delivery service, currently in beta in Oakland & Berkeley, CA.

## Stack

- Next.js 15 (App Router, static export)
- TypeScript, Tailwind CSS v4
- Cloudflare Pages (hosting + Pages Functions)
- Vitest + React Testing Library

## Development

```sh
npm install
npm run dev              # frontend only
npm run preview          # Next.js dev + wrangler proxy (HMR + Pages Functions)
npm test
```

To expose the dev server on your local network (e.g. for mobile testing):

```sh
npm run preview -- --ip 0.0.0.0
```

## Deployment

Pushes to `main` auto-deploy to Cloudflare Pages via GitHub integration.
No manual deploy step or API token needed.

## Configuration

No `.env` files are committed or required.
For local Pages Functions development, create a `.dev.vars` file (gitignored) with any needed Cloudflare-side variables.
