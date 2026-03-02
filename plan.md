# Plan: Order Form Page (`/order-form`)

## Overview
Add a self-hosted order form at `/order-form` that mirrors the existing signup form pattern (native form → Cloudflare Pages Function → Google Forms proxy). The form is **time-gated**: only accessible on **Tuesdays from 8:30 AM to 10:00 PM PT** (`America/Los_Angeles`). Outside that window, users see a "closed" message.

---

## Architecture

### New Files
| File | Purpose |
|------|---------|
| `lib/orderWindow.ts` | Pure function: `isOrderWindowOpen(now: Date): boolean` — all timezone/time-gate logic lives here |
| `lib/__tests__/orderWindow.test.ts` | Unit tests for the time-gate logic |
| `components/OrderForm.tsx` | Client component: order form UI + gate wrapper |
| `components/__tests__/OrderForm.test.tsx` | Component tests (rendering, gating, submission) |
| `app/order-form/page.tsx` | Next.js page at `/order-form` |
| `functions/api/order.ts` | Cloudflare Pages Function: validates & proxies to Google Forms |
| `functions/api/__tests__/order.test.ts` | Backend handler tests |

### Modified Files
None — this is an additive feature. The existing signup form and landing page are untouched.

---

## Step-by-Step Implementation (TDD)

### Step 1: Time-Gate Logic (`lib/orderWindow.ts`)

**Write tests first** (`lib/__tests__/orderWindow.test.ts`):

```ts
// isOrderWindowOpen(now: Date): boolean
// - Uses America/Los_Angeles timezone
// - Returns true only on Tuesday between 08:30 and 22:00 PT
```

Test cases:
1. **Tuesday 8:30 AM PT** → `true` (exact open boundary)
2. **Tuesday 9:00 AM PT** → `true` (mid-window)
3. **Tuesday 9:59 PM PT** → `true` (just before close)
4. **Tuesday 10:00 PM PT** → `false` (exact close boundary)
5. **Tuesday 8:29 AM PT** → `false` (just before open)
6. **Monday 12:00 PM PT** → `false` (wrong day)
7. **Wednesday 9:00 AM PT** → `false` (wrong day)
8. **Tuesday 8:30 AM in UTC (which is Monday night PT)** → `false` (timezone edge case — verifies we're checking PT, not UTC)
9. **Tuesday 3:00 AM UTC (which is Monday 7pm PT)** → `false` (timezone edge: UTC Tuesday but PT Monday)
10. **Wednesday 5:00 AM UTC (which is Tuesday 9pm PT in PST)** → `true` (timezone edge: UTC Wednesday but PT Tuesday)

**Then implement** `lib/orderWindow.ts`:
- Use `Intl.DateTimeFormat` with `timeZone: "America/Los_Angeles"` to extract day-of-week and time in PT
- Hardcode Tuesday = day 2, open = 08:30, close = 22:00
- Pure function, no side effects, easily testable

Also export a helper `getNextOrderWindow(now: Date): Date` that returns when the next Tuesday 8:30 AM PT is, for display in the closed-state UI.

Test cases for `getNextOrderWindow`:
1. **Monday** → next day (Tuesday 8:30 AM PT)
2. **Tuesday before 8:30 AM PT** → same day 8:30 AM PT
3. **Tuesday after 10:00 PM PT** → next Tuesday 8:30 AM PT
4. **Wednesday** → next Tuesday 8:30 AM PT (6 days later)
5. **Sunday** → next Tuesday 8:30 AM PT (2 days later)

### Step 2: Order Form Component (`components/OrderForm.tsx`)

**Write tests first** (`components/__tests__/OrderForm.test.tsx`):

Test cases — **Gating behavior**:
1. When `isOrderWindowOpen` returns `false`, renders closed message (not the form)
2. When `isOrderWindowOpen` returns `true`, renders the form fields
3. Closed state shows when the next window opens (e.g., "Orders open Tuesday at 8:30 AM PT")

Test cases — **Form rendering** (when open):
4. Renders all form fields with correct labels
5. Has a submit button
6. **[FIELDS TBD — depends on Google Form fields]**

Test cases — **Form submission**:
7. Shows loading state ("Submitting...") while submitting
8. Shows success confirmation after successful submission
9. Shows error message when submission fails
10. "Try again" button resets to form state
11. Sends correct payload to `/api/order`

**Then implement** `components/OrderForm.tsx`:
- Accept `isOpen` prop (or use the `isOrderWindowOpen` function directly with `useState`/`useEffect` for client-side hydration)
- When closed: render a styled "Orders are closed" card with next-open info
- When open: render form fields matching the Google Form (similar structure to `SignupForm.tsx`)
- Reuse the existing `FormField` pattern (inline, same as `SignupForm.tsx` — it's defined inside that file, so we'll either extract it or duplicate the pattern)
- Submit to `/api/order`
- Same status state machine: `idle` → `submitting` → `success` | `error`

**Design decision: FormField reuse**
The `FormField` component is currently defined inside `SignupForm.tsx`. We have two options:
- **Option A**: Extract `FormField` to its own file (`components/FormField.tsx`) and import in both forms
- **Option B**: Define a similar `FormField` inline in `OrderForm.tsx` (duplicate the ~20-line helper)

→ **Choose Option A**: Extract to shared component. It's a small refactor, keeps things DRY, and the component is already referenced in CLAUDE.md as a named concept.

### Step 3: Extract `FormField` to shared component

**Update tests**: Existing `SignupForm.test.tsx` should continue to pass unchanged (no behavioral change).

1. Move `FormField` from `components/SignupForm.tsx` → `components/FormField.tsx`
2. Import in both `SignupForm.tsx` and `OrderForm.tsx`
3. Run existing tests to verify no regression

### Step 4: Order Form Page (`app/order-form/page.tsx`)

Simple page component:
```tsx
import OrderForm from "@/components/OrderForm";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function OrderFormPage() {
  return (
    <>
      <Nav />
      <main>
        <OrderForm />
      </main>
      <Footer />
    </>
  );
}
```

- Reuses Nav and Footer for consistent layout
- SSG-compatible (`"use client"` only on the OrderForm component itself)

### Step 5: Backend API Handler (`functions/api/order.ts`)

**Write tests first** (`functions/api/__tests__/order.test.ts`):

Test cases:
1. Returns 400 for invalid JSON
2. Returns 400 when required fields are missing
3. Returns 400 for invalid email
4. Returns 400 for invalid zip code
5. Returns 400 for invalid phone number
6. Returns 200 and posts to Google Forms on valid input
7. Returns 500 when Google Forms request fails
8. Sets CORS headers on response
9. Returns 403 for disallowed origin
10. OPTIONS returns 204 with CORS headers
11. **[Field-specific validation TBD — depends on Google Form fields]**

**Then implement** `functions/api/order.ts`:
- Same pattern as `functions/api/signup.ts`
- Different `GOOGLE_FORM_ID` and `ENTRY_IDS` mapping (for the order form)
- Validate required fields, email, zip, phone
- POST to Google Forms with mapped entry IDs
- CORS headers (same allowlist)

**Design decision: Shared CORS/validation utilities**
The CORS logic and validation (email regex, zip, phone) are identical between signup and order. Options:
- **Option A**: Extract shared utilities to `functions/lib/cors.ts` and `functions/lib/validation.ts`
- **Option B**: Duplicate in `order.ts` (same as `signup.ts`)

→ **Choose Option B** for now: The duplication is small (~40 lines), the functions are simple, and extracting shared code in Cloudflare Pages Functions can introduce import/bundling complexity. We can refactor later if a third endpoint appears.

---

## Google Form Details

**Published Form URL:** `https://docs.google.com/forms/d/e/1FAIpQLSeKUZ2-OdTxR2wbVUo6-R2XvYZcydXLLelLn5KKbW8xkvc8qA/viewform`
**Google Form ID:** `e/1FAIpQLSeKUZ2-OdTxR2wbVUo6-R2XvYZcydXLLelLn5KKbW8xkvc8qA`

**BLOCKED: Form field mapping (entry IDs)**
The form fields, their types, options, and `entry.XXXXXXX` IDs still need to be provided. These can be obtained from the Google Forms editor via "Get pre-filled link" or by inspecting the form HTML.

Once provided, we will fill in:
- The `ENTRY_IDS` mapping in `functions/api/order.ts`
- The form fields in `components/OrderForm.tsx`
- Field-specific validation and test cases

---

## Test Execution Order

Following TDD red-green-refactor:

1. `lib/__tests__/orderWindow.test.ts` — write tests → implement `lib/orderWindow.ts` → green
2. `components/__tests__/OrderForm.test.tsx` — write gating tests → implement gating in component → green
3. Extract `FormField` → run all existing tests → green (no regression)
4. `functions/api/__tests__/order.test.ts` — write API tests → implement handler → green
5. `components/__tests__/OrderForm.test.tsx` — write form field + submission tests → implement form UI → green
6. Wire up `app/order-form/page.tsx` → manual smoke test
7. Full test suite: `npm test` → all green

---

## Summary of Deliverables

- `/order-form` page with time-gated order form
- Orders only accepted **Tuesday 8:30 AM – 10:00 PM PT**
- Outside the window: friendly "closed" message with next-open time
- Cloudflare Pages Function proxies to Google Forms
- Full test coverage (unit + component + API handler)
- TDD throughout: tests written before implementation
