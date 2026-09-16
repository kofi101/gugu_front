# Product

<!-- impeccable:product-schema 1 -->

> Recorded without a live interview: this file was written by a build agent from the
> owner's written launch brief (2026-09-16) and the repositories. Facts marked
> _(inferred)_ are the agent's reading of the brief and should be confirmed.

## Platform

web

## Users

- Shoppers in Ghana browsing and buying from many independent merchants, mostly on
  phones over mobile data _(inferred from "mobile-first" in the brief and the mobile app)_.
- Guests who browse and build a cart before signing in; signed-in customers who check out,
  track orders and write reviews.
- Small businesses who want to apply to sell on GUGU ("Sell on GUGU" application).

## Product Purpose

GUGU is a multi-merchant marketplace for Ghana. The web storefront lets people discover
products across categories and merchant stores, pay by cash on delivery, mobile money on
delivery or ExpressPay, and follow their orders. It shares one Firebase backend
(project `gugu2-36268`) with the GUGU mobile app and the merchant dashboard.

## Positioning

Local stores from across Ghana in one place, priced in cedis, with payment on delivery as a
first-class option _(inferred)_.

## Operating Context

- Catalogue, orders, reviews and merchant data live in Firestore; money, stock, order status
  and rating aggregates are written only by Cloud Functions (see
  `gugu_2.0/router/platform_contract.md`).
- Checkout always calls the `placeOrder` callable; any total shown before that is an estimate.
- Merchant and admin tools are a separate dashboard app, not this storefront.

## Capabilities and Constraints

- React + Vite + TypeScript + Tailwind; Firebase Auth/Firestore/Functions/Storage modular SDK.
- Search is prefix-token `array-contains` on `advanceSearchableValues` (no full-text engine).
- Currency is GHS, formatted with `Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' })`.
- Hosting: Firebase Hosting target `storefront` (SPA rewrite).

## Brand Commitments

- Name: GUGU. Logo: `src/assets/gugu.svg` (wordmark).
- Brand blue `#0F96C1` must stay recognisable, but it fails WCAG AA with white text, so an
  accessible scale is derived from it.

## Evidence on Hand

- Real catalogue content comes from Firestore; there are no testimonials, press, customer counts
  or sales figures. Do not invent any.
- No product photography is shipped in the repo; imagery comes from product/merchant/banner URLs.

## Product Principles

1. Truthful money: never present a client-computed total as final.
2. Works on a cheap phone on a slow network first.
3. Guests can shop without friction; sign-in is asked for at checkout, not before.
4. Every store feels like a real local business, not a SKU in a grid.

## Accessibility & Inclusion

WCAG 2.1 AA: contrast, keyboard access, visible focus, reduced motion, semantic HTML.
