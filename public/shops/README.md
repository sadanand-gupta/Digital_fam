# Shop photos

Drop storefront images here and reference them from `src/data/stores.ts`:

```ts
bannerImage: '/shops/chickato-mmda.jpg',
bannerAlt: 'Chickato Crispy Fried Chicken storefront at night',
```

Guidance:
- Wide crop (roughly 3:1), at least 1200px across. It renders ~180–320px tall.
- Keep it under ~300KB — JPEG or WebP.
- Without `bannerImage`, the page shows a map of the shop's `coords` instead.

Google Maps photos cannot be linked directly: they sit behind signed URLs that
expire, and reusing them raises licensing questions since the photographer (often
a customer) holds the copyright. Use the owner's own photo, or one you take.
