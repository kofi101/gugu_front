---
name: GUGU
description: Shops from across Ghana, printed like a cedi note; pay when it arrives.
colors:
  ink-50: "#EEF8FB"
  ink-100: "#D8EFF6"
  ink-200: "#B0DEEC"
  ink-300: "#7CC8E0"
  ink-400: "#56BCDD"
  ink-500: "#0F96C1"
  ink-700: "#0A6A8A"
  ink-800: "#0D526B"
  ink-900: "#0B3F52"
  ink-950: "#062532"
  security-paper: "#F2F6F5"
  paper-deep: "#E4ECEB"
  paper-line: "#C9D8DC"
  note-white: "#FFFFFF"
  text: "#10222B"
  text-muted: "#4A5F68"
  thread-gold: "#F5C04A"
  thread-gold-deep: "#D69E1B"
  thread-text: "#8A5B00"
  serial-red: "#B3261E"
  serial-soft: "#FBE9E7"
  leaf: "#1E6B3A"
  leaf-soft: "#E3F1E7"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.125rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 750
    lineHeight: 1.15
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 115"
  body:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
  microprint:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "0.5625rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 75"
rounded:
  sm: "2px"
  base: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  sheet: "16px"
  full: "9999px"
spacing:
  card: "12px"
  panel: "20px"
  panel-wide: "24px"
  gutter-mobile: "16px"
  gutter-tablet: "24px"
  gutter-desktop: "32px"
  section: "48px"
  section-wide: "64px"
  touch-min: "44px"
components:
  button-primary:
    backgroundColor: "{colors.ink-700}"
    textColor: "{colors.note-white}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.ink-900}"
  button-primary-active:
    backgroundColor: "{colors.ink-950}"
  button-secondary:
    backgroundColor: "{colors.note-white}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.ink-50}"
  button-thread:
    backgroundColor: "{colors.thread-gold}"
    textColor: "{colors.ink-950}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-thread-hover:
    backgroundColor: "{colors.thread-gold-deep}"
  button-ghost:
    textColor: "{colors.ink-800}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.ink-50}"
  button-danger:
    backgroundColor: "{colors.note-white}"
    textColor: "{colors.serial-red}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-danger-hover:
    backgroundColor: "{colors.serial-soft}"
  button-sm:
    padding: "0 12px"
    height: "36px"
  input:
    backgroundColor: "{colors.note-white}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  panel:
    backgroundColor: "{colors.note-white}"
    rounded: "{rounded.lg}"
    padding: "{spacing.panel}"
  product-card:
    backgroundColor: "{colors.note-white}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  status-badge:
    rounded: "{rounded.full}"
    padding: "2px 10px"
    typography: "{typography.label}"
  discount-badge:
    backgroundColor: "{colors.serial-red}"
    textColor: "{colors.note-white}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  site-header:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.note-white}"
    height: "56px"
  site-footer:
    backgroundColor: "{colors.ink-950}"
    textColor: "{colors.ink-100}"
  mobile-menu-sheet:
    backgroundColor: "{colors.note-white}"
    textColor: "{colors.text}"
    rounded: "{rounded.sheet}"
---

# Design System: GUGU

## Overview

**Creative North Star: "The Cedi Note"**

GUGU is printed like Ghana's currency. The ground is deep intaglio ink and cool security paper; money moments carry a gold security thread; order numbers and discounts are stamped in serial red. The engraved vocabulary of banknotes (guilloche rosettes, microprint edges, fine wave underprint) is the only ornament, and it is always decorative, `aria-hidden`, and quiet enough that product photos and cedi prices stay the loudest thing on screen.

Density is retail-practical: two-column product grids on phones, four on desktop, 44px minimum touch targets everywhere. Type does the brand work through Archivo's width axis: denominations and titles are expanded, reading text stays at normal width. Totals are always tabular and treated like denominations, because the product's promise is that the number you see is the number GUGU confirms.

The system rejects the orange-and-white mega-grid of generic e-commerce and the kente-pattern costume. Ghana is expressed through the note, the cedi sign, and the stores themselves, not through borrowed textile motifs.

**Key Characteristics:**
- Intaglio blue ink scale derived from brand blue #0F96C1; light security-paper ground.
- Archivo variable with width axis: 125% for display, 115% for titles, 100% for reading, 75% for microprint.
- Gold thread stripe marks note edges (header, footer) and money surfaces (summaries, receipts, confirmations).
- Engraved ornament only: guilloche, microprint, wave underprint. Always aria-hidden.
- Flat panels with hairline paper-line borders; shadow only for hover lift and bottom sheets.
- One motion moment: the hero rosette draws itself once.

## Colors

A single-hue intaglio ink scale on cool paper, with gold, red and green reserved for money, identity and success.

### Primary
- **Intaglio Ink** (ink-700): every primary action, links, focus outline, icons that carry meaning. The darkest blue that still reads as "the brand".
- **Note Ground** (ink-900): site header, dark note panels (hero, store banner, sell page, auth art), with `underprint-dark`.
- **Deep Ink** (ink-950): footer, desktop category bar, headline and price text on light surfaces, "Sold out" tag.
- **Brand Blue** (ink-500): the logo's source hue; in the UI it survives only as the underprint stroke. Never a text or button background.
- **Pale Ink** (ink-50 / ink-100 / ink-200 / ink-300 / ink-400): hover washes (50), empty-state icon discs and default banner fill (100), text on dark grounds (100/200), microprint and link underline (300), guilloche stroke on dark (400).

### Secondary
- **Security Thread Gold** (thread-gold, thread-gold-deep): the striped `thread` band; the `btn-thread` hero call to action; cart count badge; skip link; focus outline on dark grounds; the GH₵ denomination in the hero.
- **Thread Text** (thread-text): gold's readable form on light surfaces: "Only 3 left", awaiting-payment badge, pending payment state, pending confirmation icon.

### Tertiary
- **Serial Red** (serial-red, serial-soft): order numbers (expanded, tabular, tracked), discount percentage badge, field errors, error-state titles, destructive actions and failed-payment states.
- **Leaf** (leaf, leaf-soft): delivered status, paid state, discount line in totals, order-placed and payment-received confirmations.

### Neutral
- **Security Paper** (security-paper): page background.
- **Paper Deep** (paper-deep): image placeholders, skeleton base, cancelled badge.
- **Paper Line** (paper-line): every hairline border and divider; secondary button ring.
- **Note White** (note-white): panels, cards, inputs, sheets.
- **Ink Text** (text) and **Muted Text** (text-muted): body copy and secondary copy.

### Named Rules
**The Seven-Hundred Rule.** White text sits only on ink-700 or darker (ink-800, ink-900, ink-950), serial-red, or leaf. Never on ink-500 or lighter; on gold, text is ink-950.

**The Thread Rule.** The gold thread stripe (4px tall, 6px alternating thread-gold-deep / thread-gold) marks the top edge of a note: header, footer, error page, and the top of money panels (cart and checkout summary, payment confirmation, order receipt). It is never a divider inside content or a generic accent bar.

**The Serial Rule.** Serial red identifies and warns: order numbers, discounts, errors. It is never a primary action color.

## Typography

**Display Font:** Archivo Variable (with Archivo, system-ui fallback)
**Body Font:** Archivo Variable, same family at normal width
**Label/Mono Font:** none; numbers use `font-variant-numeric: tabular-nums`

**Character:** One family, voiced by width. Expanded Archivo reads like an engraved denomination; normal width stays plain and legible for shopping.

### Hierarchy
- **Display** (800, width 125%, 2.125rem mobile / 3rem sm / 3.75rem lg, line-height 1.02, -0.02em): hero headline (max 15ch), order total on receipts, the GH₵ denomination.
- **Title** (750, width 115%, 1.5rem to 1.75rem for section headings, 1.25rem to 1.5rem for empty states and page titles, line-height 1.15, -0.01em): section and page headings, all prices (1rem card, 1.25rem md, 1.875rem to 2.25rem product page), estimated totals.
- **Body** (400, 1rem, relaxed 1.625 in hero lede and addresses; ledes max 46ch): reading text.
- **Label** (600 to 700, 0.875rem): field labels, panel subheads ("Payment", "Delivery to") in muted bold, nav links. Sentence case, no tracking.
- **Microprint** (600, width 75%, 0.5625rem, 0.08em, uppercase content): decorative repeated merchant names along note edges. aria-hidden only.

### Named Rules
**The Denomination Rule.** Every cedi amount is set in title or display width with tabular numerals. Struck-through old prices and line totals stay at body width but remain tabular.

**The Width-Not-Case Rule.** Hierarchy comes from the width axis and weight, not uppercase or letter-spacing. The only uppercase text is aria-hidden microprint.

## Layout

A centered shell (max 80rem) with gutters of 16px, 24px at 640px, 32px at 1024px. Breakpoints: 640, 768, 1024, 1280. Home sections are separated by 48px (64px from 640px), each opening with a title row that carries a right-aligned "see more" link.

- **Product grid:** 2 columns (12px gap) → 3 at 768px → 4 at 1024px (16px gap from 640px). Rails are horizontal snap scrollers bleeding to the viewport edge, cards at 46% / 31% / 23.5% width.
- **Header:** sticky; 56px bar (72px from 1024px) under the thread; search sits in the bar on desktop and as a full-width second row on mobile; desktop adds a 44px ink-950 category bar.
- **Checkout:** form column plus a summary aside that is sticky (top 10rem) from 1024px. Below 1024px, the final step shows a sticky bottom bar with estimated total and the place-order button, padded for the safe-area inset and lifted with the sheet shadow.
- **Mobile menu:** a native `<dialog>` bottom sheet (max 88dvh, 16px top corners, slides up), ink-900 top bar, a 3-up quick grid (Account, Orders, Saved), then 48px category rows with chevrons.
- **Toasts:** top-center so they never cover the mobile checkout bar; auto-close no sooner than 6s, pause on hover and focus loss, close button hit area 44px.
- **Scroll offset:** `scroll-padding-top: 7rem` clears the sticky header.

## Elevation & Depth

Flat by default. Depth comes from tonal contrast (dark ink notes on light paper, white panels on paper) and hairline paper-line borders. Two shadows exist and both respond to state or overlay.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 1px 2px rgba(11,63,82,.08), 0 8px 24px -12px rgba(11,63,82,.25)`): product card hover only.
- **Sheet** (`box-shadow: 0 -8px 32px -8px rgba(6,37,50,.35)`): upward-casting shadow for the mobile menu sheet and the sticky checkout bar.
- **Dialog backdrop** (`rgb(6 37 50 / 0.55)`): ink-950 scrim behind any `<dialog>`.

### Named Rules
**The Flat Note Rule.** Panels and cards rest flat with a 1px paper-line border. Shadows appear only on hover lift or on surfaces that sit above the page from the bottom edge.

## Shapes

Gently rounded, never pill-shaped except badges and counters. Controls use 6px corners, panels and cards 8px, large note panels (hero, promo band, auth shell) 12px, the bottom sheet 16px on top corners only. Small stamps (Sold out, discount percentage) use 2px, like a printed tag. Status badges, cart count and empty-state icon discs are fully round. Borders are 1px paper-line; secondary and danger buttons use an inset 1px ring instead of a border.

## Components

### Buttons
Solid, compact and legible; the ink is the button.
- **Shape:** gently rounded (6px), min height 44px, 20px horizontal padding, 15px semibold, 8px icon gap.
- **Primary:** ink-700 fill, white text; hover ink-900, active ink-950. The default action.
- **Thread:** thread-gold fill, ink-950 text, hover thread-gold-deep. Reserved for the lead call to action on a dark note panel.
- **Secondary:** white with inset paper-line ring, ink-900 text, hover ink-50.
- **Ghost:** transparent, ink-800 text, hover ink-50.
- **Danger:** white with inset serial-red/40 ring, serial-red text, hover serial-soft. The confirmation step uses a solid serial-red small button.
- **Small:** 36px height, 12px padding, 14px text.
- **Focus / Disabled:** 3px ink-700 outline at 2px offset (thread-gold on dark grounds); disabled at 60% opacity with not-allowed cursor. Color transitions 150ms.

### Status Badges
- **Style:** full-round, 2px 10px padding, 12px bold, inset 1px ring.
- **Mapping:** awaiting payment gold (thread-gold/40 fill, thread-text); placed and processing ink-100 / ink-900; shipped solid ink-700 / white; delivered leaf-soft / leaf; cancelled paper-deep / muted; payment failed serial-soft / serial-red. Payment state beside it is plain 14px semibold text in leaf, serial-red, thread-text or muted.

### Cards / Containers
- **Panel:** white, 8px corners, 1px paper-line border, 20px padding (24px from 640px). Money panels add the thread stripe at the top edge and clip overflow.
- **Product card:** white panel with square cover image on paper-deep, 12px body padding, 15px medium name clamped to two lines, stars, price pinned to the bottom. Whole card is the link via a stretched pseudo-element; hover lifts with the Lift shadow and scales the image to 1.03 over 500ms (disabled under reduced motion). Missing photos show a centered image-off icon on paper-deep.

### Inputs / Fields
- **Style:** white, 1px paper-line border, 6px corners, 44px min height, 16px text (prevents mobile zoom), 12px padding, muted placeholder.
- **Focus:** border ink-700 plus a 2px ink-700/30 ring.
- **Error:** border serial-red via `aria-invalid`, 14px medium serial-red message below; hints are 14px muted.
- **Header search:** borderless white field on ink-900 with a 3px thread-gold focus ring and an inset 40px ink-700 submit button.

### Navigation
- **Header:** ink-900 with thread stripe, white icons with 14px semibold labels from 1024px, hover white/10 wash. Cart count is a thread-gold round counter with ink-950 text.
- **Category bar (desktop):** ink-950, 14px medium ink-100 links, active white on white/15; "All stores" in thread-gold.
- **Footer:** ink-950 with thread stripe, 14px ink-100 links, white bold group headings.
- **Mobile:** bottom sheet dialog described in Layout; focus returns to the menu button on close.

### Order Receipt
The signature component. A panel whose header is an `underprint` band topped by the thread: a muted "Order number" label, the order number in title width, tabular, tracked, serial red; status badge and the order total in display width on the right. Below: a two-column payment / delivery section, then actions. Line items follow in a separate panel with paper-line dividers, 64px thumbnails, tabular unit and line totals, and a subtotal / delivery / discount (leaf) / total definition list.

### Engraved Ornament
- **Guilloche rosette:** four layered hypotrochoid SVG paths in `currentColor` (ink-400 on dark), varying stroke opacity 0.5 to 0.9 and width 0.7 to 0.9. On the hero it frames the GH₵ denomination in thread-gold; on mobile it sits behind the headline at 30% opacity.
- **Underprint:** 120×16 repeating sine wave. Light: ink-50 ground, ink-500 stroke at 16%. Dark: ink-900 ground, ink-300 stroke at 14%. Used on note panels, promo band and the receipt header.
- **Microprint:** repeated merchant names along the top and bottom edges of the hero note, ink-300, with white/10 hairlines.
- **Thread stripe:** see The Thread Rule.

### States
- **Skeleton:** paper-deep blocks with a white 65% shimmer sweeping every 1.6s, shaped like the content they replace (square image plus three text bars).
- **Spinner:** 16px ring, ink-200 track with ink-700 head, with a screen-reader label; static under reduced motion.
- **Empty:** centered, 64px ink-100 icon disc with ink-800 icon, title-width heading in ink-900, muted text max 28rem, one action below.
- **Error:** `role="alert"` panel, serial-red alert icon and bold title, muted plain-language message, small secondary "Try again" button with refresh icon when retry is possible.

### Motion
One expressive moment: the hero guilloche draws itself once (2.4s, `cubic-bezier(.16,1,.3,1)`, layers staggered 180ms). Everything else is functional: 150ms color transitions, sheet slide-up 320ms on the same curve, 200ms backdrop fade, card image scale. Under `prefers-reduced-motion`, all animations and transitions collapse to 0.01ms and the rosette renders fully drawn.

## Do's and Don'ts

### Do:
- **Do** put white text only on ink-700 or darker, serial-red or leaf; use ink-950 text on thread-gold.
- **Do** set every cedi amount in title or display width with tabular numerals.
- **Do** mark note edges and money panels with the 4px thread stripe.
- **Do** keep engraved ornament (guilloche, underprint, microprint) decorative and aria-hidden.
- **Do** keep touch targets at 44px minimum (48px for sheet rows) and inputs at 16px text.
- **Do** place toasts top-center with at least 6s on screen.
- **Do** give every data surface a skeleton, an empty state, and an error state with retry.

### Don't:
- **Don't** use ink-500 (#0F96C1) or lighter as a text color or as a background under white text.
- **Don't** use the orange-and-white mega-grid of generic e-commerce or kente pattern as decoration.
- **Don't** use serial red for primary actions; it identifies and warns.
- **Don't** create hierarchy with uppercase or wide tracking outside aria-hidden microprint.
- **Don't** add shadows to resting panels or cards.
- **Don't** add looping or scroll-triggered motion; the rosette draw is the single expressive animation.
