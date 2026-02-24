# Hosting theasianova.com — Cloudflare Pages + Cloudflare DNS

## Context
Static Next.js site (output: "export" → `out/`) lives at github.com/raywu/ramen-eggs.
Domain theasianova.com is on GoDaddy. Goal: host for free on the apex domain with SSL and auto-deploy on push.

## Options Comparison

| | Cloudflare Pages | Vercel |
|---|---|---|
| **Free bandwidth** | Unlimited | 100 GB/month |
| **Custom domain** | Free | Free |
| **SSL** | Free (Universal SSL) | Free |
| **GitHub auto-deploy** | Yes | Yes |
| **Preview URLs** | Yes (per branch) | Yes (per branch) |
| **DNS management** | Yes (if nameservers moved) | No (external) |
| **Build time limit** | 20 min | 45 min |
| **Concurrent builds** | 1 (free) | 1 (free) |
| **Next.js SSR support** | Via Workers (paid) | Native (free) |

**Verdict:** Cloudflare Pages wins for this use case — unlimited bandwidth, no vendor lock-in, and DNS+hosting in one place once nameservers are moved. Vercel is the better choice only if you anticipate switching from static export to SSR later (Vercel handles that natively on the free tier via serverless functions).

---

## Recommendation: Cloudflare Pages + Cloudflare DNS

**Why Cloudflare Pages over Vercel/Netlify:**
- Already have a Cloudflare account
- Unlimited bandwidth on free tier (Vercel caps at 100 GB/month)
- DNS + hosting in one dashboard once nameservers are moved
- Auto-deploy from GitHub, preview URLs per branch, free SSL/CDN
- For a pure static export, no adapter needed — just point at the `out/` directory

**Domain migration:** Don't do a full registrar transfer (takes up to 7 days, requires 60-day lock period). Instead, just **change nameservers on GoDaddy to Cloudflare's** — this gives Cloudflare full DNS control in minutes, for free, with no transfer.

---

## Step-by-Step Setup

### Step 1 — Add the domain to Cloudflare

1. Log into Cloudflare → **Add a Site** → enter `theasianova.com`
2. Select the **Free** plan
3. Cloudflare scans existing GoDaddy DNS records — review and confirm them
4. Cloudflare gives you two nameservers, e.g.:
   ```
   xxx.ns.cloudflare.com
   yyy.ns.cloudflare.com
   ```

### Step 2 — Update nameservers on GoDaddy

1. GoDaddy → My Products → theasianova.com → **DNS** → **Nameservers** → **Change**
2. Select **Enter my own nameservers (advanced)**
3. Enter the two Cloudflare nameservers from Step 1
4. Save — GoDaddy propagates in minutes; Cloudflare activates within 1–24 hours (usually <30 min)

### Step 3 — Create Cloudflare Pages project

1. Cloudflare dashboard → **Pages** → **Create a project** → **Connect to Git**
2. Authorize GitHub, select repo: `raywu/ramen-eggs`
3. Build settings:
   | Field | Value |
   |---|---|
   | Framework preset | **None** (it's a static export, not SSR) |
   | Build command | `npm run build` |
   | Build output directory | `out` |
   | Root directory | *(leave blank)* |
4. Click **Save and Deploy** — first deploy runs (~1 min)
5. Cloudflare gives a preview URL like `ramen-eggs.pages.dev` — verify the site loads there first

### Step 4 — Add custom domain to Pages

1. In the Pages project → **Custom domains** tab → **Set up a custom domain**
2. Add `theasianova.com` → Cloudflare auto-creates the DNS record (CNAME or AAAA)
3. Add `www.theasianova.com` → same flow
4. Set up a redirect: `www` → apex (or apex → www, your preference)
   - Cloudflare Pages handles this in the **Custom domains** UI automatically when you add both
5. SSL is provisioned automatically via Cloudflare's Universal SSL (free)

### Step 5 — Verify

- Visit `https://theasianova.com` → site loads, padlock present
- Push a commit to `main` → Cloudflare Pages auto-deploys within ~1 min
- Check **Pages → Deployments** tab for build logs

---

## Ongoing workflow (after setup)

```
git push origin main  →  Cloudflare Pages detects push  →  runs npm run build  →  deploys out/
```

No manual steps needed after initial setup.

---

## Vercel Alternative (if preferred)

If you'd rather use Vercel instead:

1. Go to vercel.com → **Add New Project** → Import `raywu/ramen-eggs` from GitHub
2. Build settings auto-detected (Next.js) — but override output directory to `out` since you're using static export
3. Deploy → get a `*.vercel.app` preview URL
4. **Add domain:** Project → Settings → Domains → add `theasianova.com`
5. Vercel provides DNS records to add — either:
   - Add an `A` record on GoDaddy pointing to Vercel's IP, or
   - Change GoDaddy nameservers to Vercel's (less common) or a third-party DNS
6. SSL auto-provisioned via Let's Encrypt

**Limitation to note:** Vercel's free "Hobby" plan is for personal/non-commercial use. A delivery service business would technically require a Pro plan ($20/mo). Cloudflare Pages has no such restriction.

---

## Notes

- `trailingSlash` is not set in next.config.ts — fine for Cloudflare Pages (serves `index.html` files correctly)
- `images: { unoptimized: true }` is already set — required for static export, no change needed
- If you ever want to do a full registrar transfer to Cloudflare (cleaner, at-cost renewal ~$10/yr): Cloudflare → **Domain Registration** → **Transfer Domain** — but this is optional, nameserver delegation is sufficient
