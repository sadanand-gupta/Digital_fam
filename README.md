# Digital Fam

A premium review-copy website built with Vue 3, TypeScript and Vite.

Visitors pick a business, copy a prewritten review that matches their real experience, see the
store's branding kit, and jump straight to Google Maps to paste it — no blank-page hesitation.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle into dist/
npm run preview  # serve the production build locally
```

## How it fits together

| Path | Role |
| --- | --- |
| `src/data/stores.ts` | The dataset — every business, its review library and branding kit |
| `src/data/posters.ts` | Inline-SVG poster generators, tinted per store accent |
| `src/types/index.ts` | `Store`, `Review`, `BrandingAsset` and the category labels |
| `src/composables/useClipboard.ts` | Copy with a fallback for non-secure (plain-http) contexts |
| `src/composables/useRoute.ts` | Minimal hash router — `#/` and `#/store/<slug>` |
| `src/components/` | Header, home view, store view, review card, branding panel, toast |

## Adding a business

Append an entry to the `stores` array in `src/data/stores.ts`:

```ts
{
  id: 's7',
  slug: 'your-store',                     // becomes #/store/your-store
  name: 'Your Store',
  category: 'clinic',                     // see StoreCategory in src/types
  tagline: 'What you do, in one line',
  address: '...', phone: '...', hours: '...',
  rating: 4.8, reviewCount: 210,
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Your+Store+Area',
  accent: ['#0ea5e9', '#4f46e5'],         // drives cards, buttons and posters
  logoMark: 'Y',
  reviews: [
    r('Review text a visitor can copy as-is.', 5, 'warm', ['staff', 'value']),
  ],
  branding: branding('Your Store', '#0ea5e9', '#4f46e5',
    ['scan', 'badge', 'stars', 'quote'],
    ['Counter card.', 'Social post.', 'Waiting-room poster.', 'Exit frame.']),
}
```

The `r(text, rating, tone, tags)` helper assigns review ids automatically. Tones are
`warm | concise | detailed | enthusiastic` and drive the tone filter; tags drive the topic
filter. Both filter lists are derived from the data, so new values appear on their own.

### Getting a real Maps link

Open the business on Google Maps → Share → Copy link, and use that as `mapsUrl`. The
`?api=1&query=` search form used in the sample data works as a fallback when you don't have the
canonical place link yet.

## Notes

- **Posters** are inline SVG, so they stay sharp at any size and need no network requests.
  Each is downloadable as a standalone `.svg` from the store page.
- **Theme** follows the OS by default and the toggle persists to `localStorage` under
  `df-theme`. All colours are CSS custom properties defined in `src/style.css`.
- **Reviews are templates.** The UI tells visitors to edit them so they reflect a genuine
  visit — worth keeping, since platforms penalise identical review text.
