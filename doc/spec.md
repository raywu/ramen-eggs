# Spec: Asianova Collective, LLC Landing Page

## Context

Build a landing page for Asianova Collective, LLC, a fresh ramen egg weekly delivery service running a beta in Oakland and Berkeley, CA. The page must communicate the product clearly, drive sign-ups via a native form (proxied to Google Forms), and explain how the beta program works.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, SSG)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **No backend** — pure static site

---

## Brand / Visual Direction

- **Palette**: Clean minimal
  - Background: `#FFFDF7` (warm cream)
  - Text: `#1A1A1A` (near-black)
  - Accent: `#C4903C` (amber/gold — evokes the golden yolk)
  - Borders/dividers: `#E8E4DC`
- **Typography**: System serif for headings (or `font-serif`), system sans for body
- **Tone**: Simple, direct, no fluff. Food-artisan without being precious.
- **Imagery**: Above-the-fold art should be a single, beautiful close-up of a ramen egg cross-section showing the golden gooey yolk. Use a placeholder (`/public/hero-egg.jpg`) to be replaced with real photography.

---

## Page Structure

### 1. Nav
- Logo/wordmark: "Asianova Collective" (left-aligned, small)
- Single CTA button (right): "Join the Beta" → `#signup` anchor

---

### 2. Hero (above the fold)
**Headline:**
> Fresh ramen eggs, made to order.

**Sub-headline:**
> Gluten-free, marinated in-house, and delivered weekly. Now in beta in Oakland & Berkeley.

**CTA button:**
> Join the Beta ↓

- Button scrolls to `#signup` section
- Hero art: full-width or half-width image of ramen egg cross-section (golden gooey yolk visible)

---

### 3. Value Props (3-column grid or icon row)
Three concise callouts below the hero fold:

| Icon | Headline | Body |
|------|----------|------|
| Egg | Made to order | Never pre-made. Each batch is crafted fresh after you place your order. |
| Check | Gluten-free | Marinated in gluten-free soy sauce, mirin, and sugar. |
| Calendar | Eat within a week | These eggs are genuinely fresh. Best consumed within 7 days of pickup. |

---

### 4. The Egg (product detail section)
**Section heading:**
> Golden. Gooey. Good for you.

**Body copy:**
> Our ramen eggs are marinated in a house-made teriyaki sauce — gluten-free soy sauce, mirin, and sugar. The whites are tender and deeply savory. The yolk is golden, soft, and just barely set. High in protein and made with care.

Short feature list:
- Gluten-free marinade
- Golden, gooey yolk
- High protein
- No additives

---

### 5. How It Works (numbered steps)
**Section heading:**
> How it works

**Steps:**

1. **Sign up below** — we'll add you to our WhatsApp group, "Ramen Eggs Beta (Oakland / Berkeley)."
2. **Get the weekly ping** — every week you'll receive a message with that week's pricing and an order reminder.
3. **Confirm your order** — fill out the order form to lock in your quantity. Pricing is visible before you confirm.
4. **Pick up your eggs** — collect your order on Saturday between 1pm - 3pm at a designated pickup location. (e.g. San Pablo Park)

Note: Since we're in beta, pricing may vary week to week.

---

### 6. Sign-Up Form (native, proxied to Google Forms)
**Section heading:**
> Join the beta

**Subtext:**
> We're currently accepting sign-ups in Oakland and Berkeley, CA.

**Native form** styled to match the dark theme:
- Custom `SignupForm` component with fields: name, email, phone, zip, eggs currently, eggs desired, why not
- Submits via `/api/signup` Cloudflare Pages Function, which proxies to Google Forms
- Section has `id="signup"` for anchor scrolling
- No auth required (Google Forms accepts anonymous POST)

---

### 7. Footer
```
© 2026 Asianova Collective, LLC All rights reserved.
```
- Minimal, centered or left-aligned
- No extra links needed unless added later

---

## File Structure

```
ramen-eggs/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── ValueProps.tsx
│   ├── TheEgg.tsx
│   ├── HowItWorks.tsx
│   ├── SignupForm.tsx
│   └── Footer.tsx
├── public/
│   └── hero-egg.jpg
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## Critical Implementation Notes

- All sections in single `page.tsx`, assembled from components
- "Join the Beta" CTA in Nav and Hero both use `href="#signup"` smooth scroll
- No analytics, no cookies banner
- `next/image` for hero photo
- Responsive: mobile-first, single-column stack on small screens

---

## Order Form — Future Implementation Notes

### Google Sheets Environment Config (Option 2: Client-Side Fetch)
- Publish a Google Sheet as CSV containing form config (field IDs, product list, pricing, etc.)
- Client fetches the sheet at page load to hydrate the order form
- No server-side env vars needed; config changes only require editing the Google Sheet
- Keeps the current static export (`output: "export"`) and Cloudflare Pages setup intact
