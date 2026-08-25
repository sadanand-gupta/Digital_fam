# Digital Fam — Design & Build Reference

A single-shop review site for local businesses. A customer who just ate somewhere
opens the page, picks a prewritten review that matches their visit, copies it in
one tap, and posts it on Google Maps.

First live client: **Chickato Crispy Fried Chicken MMDA**, Arumbakkam, Chennai.

- **Stack:** Vue 3 + Vite + TypeScript, no runtime dependencies beyond `vue`
- **Bundle:** ~106 KB JS (40 KB gzipped), ~35 KB CSS (7 KB gzipped)
- **Source:** ~3,300 lines across 11 components, 5 composables, 3 data modules

---

## 1. The idea

Most people want to leave a good review and never do. Not because they are
unwilling — because the empty text box is work. They open Maps, stare at the
blank field, and close it.

This site removes that friction. It hands them a review that already sounds like
a person, they copy it, and the Maps review box opens with one more tap.

**Design consequence:** the whole page is a funnel to one action. Everything that
does not move a visitor toward *copy → paste → post* was either cut or pushed
down the page.

---

## 2. Product decisions

### 2.1 Single-shop public, directory behind a login

Visitors at `/` see exactly one business. The full directory of every shop is
admin-only, unlocked at `/admin`.

**Why:** each shop gets what feels like its own site. Nobody browsing Chickato's
page sees competitors, and guessing another slug in the URL returns "Store not
found" rather than exposing the list.

**How:** `usePublicStore.ts` holds the chosen shop and persists it to
localStorage, so an admin can switch the live shop from the directory UI without
a code change. `DEFAULT_PUBLIC_STORE_SLUG` in `adminConfig.ts` is the fallback.

> **Known limit:** the admin gate is client-side. Credentials and all shop data
> ship in the JS bundle — this hides the directory from ordinary visitors, it is
> not security. The public-store choice is also per-browser, since it lives in
> localStorage. Both need a backend to become real.

### 2.2 Reviews are retired after use

Once a visitor copies a review, it is removed from their pool
(`useUsedReviews.ts`, localStorage). The next unused one slides into its place.

**Why:** if two customers post identical text, Google's spam detection notices
and the reviews get suppressed. Retiring used text makes duplicates far less
likely.

### 2.3 The sentiment filter protects the rating

Four options — **Great · Good · Pretty good · It was okay** — with 4 reviews
shown per selection.

The lowest tier is a fair **3-star** write-up mentioning one genuine niggle
(a bit oily that day, a fifteen-minute wait). Nothing below 3 stars exists.

**Why:** someone who had a genuinely bad visit should write their own words, not
copy ours. Meanwhile the shop's average stays healthy. Current spread across 18
reviews: six 5-star, eight 4-star, four 3-star — **average 4.11**.

An option only appears if it still has unused reviews behind it, so a chip never
leads to an empty list.

### 2.4 Reviews are written to sound human

Earlier drafts had the AI tell: balanced clauses, tidy summaries, no rough edges.
They were rewritten to read like phone typing.

> "Got the chicken and finished it standing outside because I could not wait."

> "Ordered late, around 9ish, still fresh. Not sitting under a lamp for hours
> like some places."

Every review is specific to *this* shop — the fried chicken, the burgers, MMDA
Main Road, evening crowds, limited seating. Keyword tag chips were removed from
the cards because they were the most machine-generated-looking element on the
page.

---

## 3. Visual design

### 3.1 Palette

Five chosen colours. Everything else is a variant of one of them — there is no
sixth hue anywhere in the system.

| Role | Colour | Hex |
|---|---|---|
| Primary — buttons, header, CTA band | Deep Navy | `#071A41` |
| Background — top of gradient | Warm Ivory | `#F7F2E8` |
| Accent — rules, decoration | Champagne Gold | `#B89B5E` |
| Cards and raised surfaces | Pure Cream | `#FFFDF8` |
| Body text | Charcoal Navy | `#111827` |

**Derived variants (light):**

| Token | Hex | Purpose |
|---|---|---|
| `--c-navy-soft` | `#1B2F57` | Button hover |
| `--c-text-2` | `#3D4657` | Secondary text |
| `--c-text-3` | `#4E5870` | Muted text, captions |
| `--c-gold-ink` | `#6F5A2C` | Gold **text** — see note below |
| `--c-sunken` | `#EFE8D9` | Recessed surfaces |
| `--c-border` | `#E5DED0` | Hairlines |

**Background gradient:** ivory `#F7F2E8` → pale blue `#E3EBF6` at 170°, fixed
attachment so it spans the page as one wash.

**Ambient orbs:** `#BCD4EF` blue, `#E6DCC2` gold, `#CFE2F5` pale blue.

**Rating stars:** `#F5B301` amber fill, `#A06F00` outline.

**Dark theme:** ground `#060F22` → `#0A1A38`, cards `#101F3C`, ivory text,
gold lifts to `#CBB078`, stars to `#FFC42E`.

### 3.2 Why gold needs two values

Champagne Gold sits at **54% lightness** — the middle of the range. That makes it
excellent as a surface (navy on gold is 6.4:1) and as decoration, but:

- as small text on ivory it reads **2.4:1** — unreadable
- it cannot carry white text either — **2.7:1**

So `--c-gold-ink` (`#6F5A2C`) is the same hue darkened for the text case.
Everything decorative uses the exact `#B89B5E`.

### 3.3 Why the stars are amber, not gold

Champagne Gold on stars measured **2.39:1**, below the **3:1** WCAG requires of
non-text graphics. The intuitive fix — a brighter, more saturated gold — makes it
*worse* (`#C9A227` is 2.17:1), because brighter means less contrast on a light
ground.

Checking what real platforms use settled it:

| Platform | Hex | Contrast on a light card |
|---|---|---|
| Google Maps | `#FBBC04` | 1.68:1 |
| Amazon | `#FFA41C` | 1.95:1 |
| IMDb | `#F5C518` | 1.60:1 |

**None of them reach 3:1.** They work because the star *shape* carries the
meaning. So the stars use amber `#F5B301` with an `#A06F00` outline — the
outline clears 3:1 (4.33:1 on cards), and the accessible name states the score
in words.

Stars also render **fractionally**: 4.3 shows four full stars and a 30%-filled
fifth, via an SVG gradient stop — not rounded up to something unearned.

### 3.4 Typography

- **Playfair Display** — business names, section headings. High-contrast
  editorial serif, the lineage luxury magazines built mastheads on.
- **Instrument Sans** — navigation, body, buttons, metadata.

Hierarchy comes from size, weight and colour together. Weight alone flattens
into "everything is bold". Display type gets `-0.015em` tracking because Playfair
is wide and high-contrast.

Type scale: `--t-eyebrow` `0.7rem` → `--t-h1` `clamp(2rem, 5vw, 3.1rem)`.

### 3.5 Spacing

One scale, `--sp-1` (4px) through `--sp-10` (128px). During the QA pass, **47
ad-hoc pixel values and 32 drifting font sizes** were snapped onto these scales.

Premium look comes from spacing and restraint, not decoration — radii cap at
18px, shadows are neutral and soft, and there are **zero gradients** on any
component surface.

### 3.6 Motion

| Element | Behaviour |
|---|---|
| Ambient orbs | 34s / 43s / 52s loops, mismatched so the pattern never repeats |
| Cards | 2px lift on hover, 0.45s settle |
| Buttons | 1px lift, deeper ground |
| Copy button | Switches to a "Copied" tick |
| Sections | 0.7s opacity + translate settle |

All motion is `transform`/`opacity` only — GPU-composited, never triggering
layout. `prefers-reduced-motion: reduce` disables it. Mobile gets a cheaper blur
radius on the orbs.

---

## 4. Accessibility

Every text/background pair is verified at **4.5:1**, graphics at **3:1**.

Findings that changed the design:

| Problem | Measured | Fix |
|---|---|---|
| Ambient orbs darkening text beneath them | 3.46:1 worst case | Lightened orb colours, deepened two text tones. Worst case now **4.84:1** |
| Gradient's blue end left no contrast headroom | 4.53:1 | Capped the blue at `#E3EBF6` — one step darker and gold eyebrows fail |
| Empty stars nearly invisible | 1.72:1 | Outlined at `#8E846F` — the gap between 4 and 5 stars is information |
| Gold text on ivory | 2.4:1 | Separate `--c-gold-ink` |

The orb check covers **18 combinations** — 3 orbs × 2 gradient stops × 3 text
tones — because a drifting element can sit under any text at any time.

---

## 5. Technical notes

### 5.1 The Google review deep link

Getting a customer straight into the review box, not just the listing.

| URL form | Result |
|---|---|
| `writereview?placeid=ChIJ…` | Works — but needs a real Place ID |
| `writereview?cid=…` | **HTTP 400** — CID is not a valid parameter |
| `maps/place//data=!4m3!3m2!1s<featureId>!12e1` | **200** — Maps' native review action |

An earlier build used the CID form, which silently 400'd and dumped users on the
plain listing. `mapsLinks.ts` now prefers a `placeId`, falls back to `featureId`
(the `!1s0x…:0x…` value from any Maps listing URL), then to the plain listing.

### 5.2 Why the hero shows a map, not a photo

Google Maps photos **cannot** be used. Verified across four approaches — the
place-photo RPC, the Maps preview endpoint, the UGC posts endpoint, and the full
place page with a consent cookie. All returned empty payloads or 403. The photo
URLs are built by JavaScript at runtime; even the paid Places Photo API returns
short-lived redirects that the terms forbid caching beyond 30 days.

So the banner falls back to an OpenStreetMap embed (free, no key), desaturated
and faded into the page so it reads as context rather than the subject.

> **This is the biggest remaining gap.** A real storefront photo would do more
> for the premium feel than any palette change. Drop a file in `public/shops/`
> and set `bannerImage` on the store.

### 5.3 Dynamic ratings

Not currently wired. Google sends no CORS header, so the browser cannot fetch
Maps data directly — it needs the Places API, which requires a billing account
and a server-side proxy to hide the key.

For one shop it is not worth it: `rating` and `reviewCount` are two lines in
`stores.ts`. It becomes worthwhile around 10–20 shops.

---

## 6. File map

```
src/
├── theme.css              ← ALL colour, spacing and type tokens
├── style.css              Base styles, typography, buttons
├── types/index.ts         Store, Review, Sentiment
├── data/
│   ├── stores.ts          Shop data + reviews
│   ├── adminConfig.ts     Credentials, default public shop
│   └── mapsLinks.ts       Review deep-link builder
├── composables/
│   ├── useAdmin.ts        Sign-in state
│   ├── usePublicStore.ts  Which shop the public sees
│   ├── useUsedReviews.ts  Retires copied reviews
│   ├── useClipboard.ts    Copy with fallback
│   └── useRoute.ts        Minimal history router
└── components/
    ├── StoreView.vue      The shop page
    ├── StoreBanner.vue    Map/photo hero
    ├── ReviewCard.vue     One copyable review
    ├── StarRating.vue     Fractional amber stars
    ├── AmbientBackdrop.vue Drifting orbs
    ├── HomeView.vue       Admin directory
    ├── AdminLogin.vue     /admin gate
    └── …
```

**To restyle the entire site**, edit the RAW PALETTE block at the top of
`theme.css`. No component hardcodes a colour.

---

## 7. Adding the next shop

1. Append a `Store` to `stores.ts`.
2. Get the Maps link. Resolve a `maps.app.goo.gl` short link first:
   `curl -sSL -o /dev/null -w '%{url_effective}' <link>`
3. Take the `!1s0x…:0x…` value from that URL → `featureId`. Prefer a real
   `ChIJ…` `placeId` if you can get one.
4. Coordinates from **Nominatim**, not Google's meta tags — Google's were wrong
   for Chickato by roughly 6 km.
5. Set `PUBLIC_STORE_SLUG` for that deployment, or switch it from the admin UI.
6. Photo optional — `public/shops/<slug>.jpg` then `bannerImage`.

Fields the owner may not supply (phone, hours) can be left empty; the phone row
is conditional.

---

## 8. Open items

| Item | Notes |
|---|---|
| **Storefront photo** | Highest impact remaining change |
| Server-side admin auth | Current gate is client-side only |
| Shared public-store setting | localStorage is per-browser |
| Dynamic ratings | Needs Places API + billing + proxy |
| Flaticon attribution | Free-tier use of the Maps icon requires a visible credit line |
