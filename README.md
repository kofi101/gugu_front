# GUGU storefront (web)

Customer-facing web shop for GUGU, the multi-store marketplace for Ghana. It runs on the GUGU 2.0 Firebase
backend (project `gugu2-36268`), shared with the mobile app (`gugu_2.0`) and the merchant dashboard.
The backend rules, collections and Cloud Functions are defined in
[`gugu_2.0/router/platform_contract.md`](../gugu_2.0/router/platform_contract.md).

Stack: React 19, React Router 7, Vite 7, TypeScript, Tailwind CSS 3, Firebase JS SDK 12 (modular
Auth, Firestore, Functions, Storage), react-helmet-async for per-route SEO tags.

## Quick start

```sh
npm ci
cp .env.example .env.local   # fill in the VITE_FIREBASE_* values
npm run dev                  # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check, production build to `dist/`, then `scripts/generate-sitemap.mjs` |
| `npm run build:app` | Type-check and build without the sitemap step |
| `npm run sitemap` | Regenerate `dist/sitemap.xml` and `dist/robots.txt` |
| `npm run lint` | ESLint (zero warnings allowed) |
| `npm run preview` | Serve `dist/` locally |

## Environment

All config is read from `VITE_*` variables (`.env.local`, `.env.production.local`, or the CI environment).
Only `.env.example` is committed.

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | yes (prod) | From the **web app** registered in `gugu2-36268` (Project settings → Your apps → Add app → Web). Not registered yet. |
| `VITE_SITE_URL` | yes (prod) | Public origin, e.g. `https://gugumarket.web.app`. Used for canonical URLs, Open Graph, JSON-LD and the sitemap. |
| `VITE_USE_EMULATORS` | dev only | `true` connects to the Emulator Suite (auth 9099, firestore 8080, functions 5001, storage 9199); project id defaults to `demo-gugu`. |
| `VITE_EMULATOR_HOST` | no | Defaults to `127.0.0.1`. |
| `VITE_SUPPORT_EMAIL`, `VITE_SUPPORT_PHONE` | recommended | Shown on `/contact` only when set. |

## Local development against the emulators

The backend lives in `../gugu_2.0`. firebase-tools 15 needs Java 21 for the emulators; with Java 17 use v13:

```sh
# terminal 1 (gugu_2.0)
cd ../gugu_2.0
npx firebase-tools@13 emulators:start --project demo-gugu
# (if other emulators already use the default ports: --config firebase.test.json, and set
#  VITE_EMULATOR_PORTS=auth:29099,firestore:28080,functions:25001,storage:29199 in gugu_front/.env.local)

# terminal 2 (gugu_2.0) — idempotent seed
node functions/scripts/seed-emulator.js

# terminal 3 (gugu_front)
printf 'VITE_USE_EMULATORS=true\nVITE_SITE_URL=http://localhost:5173\n' > .env.local
npm run dev
```

Seeded accounts (password `password123`, emails verified): `customer@gugu.test` (has a delivered order, so it can
review `p_th_4`), `merchant@gugu.test`, `admin@gugu.test`, `applicant@gugu.test`. New sign-ups are unverified. Verification and password-reset emails appear in the Auth emulator UI
(http://127.0.0.1:4000/auth).

## How it works

- **Auth**: state comes only from `onAuthStateChanged` (Firebase keeps its own session). The app never
  persists user objects or tokens. On first sign-in it creates `users/{uid}` with contract-allowed fields
  (it never writes `role`).
- **Cart**: guests keep a cart in `localStorage` (`gugu.cart.v1`). On sign-in it is merged into
  `users/{uid}/cart` in one transaction using `max(existing, guest)` per line, so a repeated merge cannot
  inflate quantities; the local cart is cleared only after the merge commits.
- **Money**: prices in the cart and checkout are labelled estimates. Checkout calls the `placeOrder` callable
  (server cart, no `lines`), which prices, reserves stock and clears the cart. The button is disabled and
  guarded against double submits. For ExpressPay the browser is sent to the returned `checkoutUrl`;
  ExpressPay redirects back to `/checkout/confirm?orderId=…`, which calls `confirmExpressPayPayment` and
  shows paid / pending / failed exactly as the server reports.
- **Catalogue queries** always include `where('isActive', '==', true)` (required by the rules). Listing
  pages keep sort, price range, subcategory and the pagination cursor (`after=<productId>`) in the URL.
- **Search** uses `advanceSearchableValues array-contains <longest query word>` and then requires every
  query word to be present (the field holds lowercased words and all their prefixes).
- **Callable errors** (`OUT_OF_STOCK`, `PAYMENT_INIT_FAILED`, …) are mapped to customer messages in
  `src/lib/errors.ts`.

### Firestore indexes

The emulator does not enforce composite indexes; production does. All indexes the storefront's queries need
(listings by category/subcategory/store sorted by price, newest or rating; popular; price drops; search) are
defined in the backend repo: [`gugu_2.0/firestore.indexes.json`](../gugu_2.0/firestore.indexes.json). Deploy them
with `firebase deploy --only firestore:indexes` from `gugu_2.0` (runbook step 1). Add any new storefront query's
index there.

### Checkout rules the UI enforces (see the contract's "Changes after security review")

- A delivery option is required whenever active `shipping_options` exist; its fee is included in the estimate.
- Each checkout attempt sends a `clientRequestId` (UUID) that is reused on retries, so a retried call returns the
  same order instead of creating a duplicate.
- Pay on delivery needs a verified email (or phone sign-in): the review step offers "Resend verification email"
  and "I've verified" (reloads the user and refreshes the ID token). Limits: 20 per line, 3 open orders.
- Reviews are offered only for products with a delivered purchase (`users/{uid}/purchased/{productId}`).

## SEO

- Per-route `<title>`, description, canonical, Open Graph and Twitter tags via `src/components/Seo.tsx`.
  Account, cart, checkout, auth and search pages are `noindex`.
- JSON-LD: `WebSite` + `SearchAction` on the home page, `Product` (offer, availability, aggregate rating) on
  product pages, `Store` on store pages.
- `scripts/generate-sitemap.mjs` runs after `vite build`. It reads active products, categories and merchants
  with the Firebase web SDK (so only public data), and writes `dist/sitemap.xml` plus a `dist/robots.txt`
  pointing at `VITE_SITE_URL`. If Firebase config is missing or unreachable it writes the static pages only
  and never fails the build. Rebuild (or run `npm run sitemap`) when the catalogue changes a lot.
- The SPA returns HTTP 200 for unknown routes (Hosting rewrite); the 404 page sets `noindex`.

## Deploying (Firebase Hosting)

Hosting is configured in the backend repo (`gugu_2.0/firebase.json`, target `storefront`); see
`gugu_2.0/router/deploy_runbook.md` step 8. There is no `vercel.json` any more.

```sh
# in gugu_front, with .env.production.local holding the production VITE_* values
npm ci && npm run build

# in gugu_2.0
rm -rf hosting/storefront && mkdir -p hosting && cp -R ../gugu_front/dist hosting/storefront
firebase deploy --only hosting:storefront --project prod
```

The `storefront` target serves `hosting/storefront` with:

- `/api/expresspay/webhook` → Cloud Function `expressPayWebhook` (ExpressPay `post-url`);
- SPA rewrite `!/assets/**` → `/index.html` (missing hashed assets return a real 404);
- `Cache-Control: public, max-age=31536000, immutable` on `/assets/**`.

After the first deploy add the Hosting domain (and any custom domain) to Firebase Auth → Settings →
Authorized domains, and set the Functions param `WEB_BASE_URL` to the same origin as `VITE_SITE_URL`.
