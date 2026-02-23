# Spec: Sausage Cloud, Inc. Landing Page

## Context

Build a landing page for Sausage Cloud, Inc., a fresh ramen egg weekly delivery service running a beta in Oakland and Berkeley, CA. The page must communicate the product clearly, drive sign-ups via an embedded Airtable form, and explain how the beta program works.

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
- Logo/wordmark: "Sausage Cloud" (left-aligned, small)
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
| Check | Gluten-free | Marinated in gluten-free soy sauce, mirin, and sugar. Nothing hidden. |
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

1. **Sign up below** — we'll add you to our WhatsApp group, "Sausage Cloud Ramen Egg Beta."
2. **Get the weekly ping** — every week you'll receive a message with that week's pricing and an order reminder.
3. **Confirm your order** — fill out the order form to lock in your quantity. Pricing is visible before you confirm.
4. **Pick up your eggs** — collect your order throughout the week, or catch us at the **South Berkeley Farmers' Market** (Tuesdays on Adeline).

Note: Since we're in beta, pricing may vary week to week.

---

### 6. Sign-Up Form (embedded Airtable)
**Section heading:**
> Join the beta

**Subtext:**
> We're currently accepting sign-ups in Oakland and Berkeley, CA.

**Embedded form** (full-width iframe):
```
https://airtable.com/app0reAWbVwTy2hZQ/pagUFxDCJ9cuGJtGz/form
```
- Embed via `<iframe>` with `width="100%"` and adequate height (min `600px`)
- Section has `id="signup"` for anchor scrolling
- Airtable embed params: append `?backgroundColor=transparent&viewControls=on` if supported

---

### 7. Footer
```
© 2026 Sausage Cloud, Inc. All rights reserved.
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
- Airtable iframe: test at mobile widths; may need `min-height` and `overflow` handling
- No analytics, no cookies banner, no backend
- `next/image` for hero photo
- Responsive: mobile-first, single-column stack on small screens
