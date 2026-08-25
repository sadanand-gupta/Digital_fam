/**
 * Branding posters are inline SVG so they stay crisp, theme-aware and need no
 * network requests. Each takes the store's two accent colours.
 */
type PosterFn = (a: string, b: string, name: string) => string

const shell = (a: string, b: string, body: string) => `
<svg viewBox="0 0 320 400" xmlns="http://www.w3.org/2000/svg" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.45"/>
    </linearGradient>
  </defs>
  <rect width="320" height="400" rx="18" fill="url(#g)"/>
  ${body}
  <rect width="320" height="400" rx="18" fill="url(#fade)"/>
</svg>`

const wrap = (name: string, max = 18) => {
  const words = name.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w }
    else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines
}

const titleBlock = (name: string, y: number) =>
  wrap(name).map((l, i) =>
    `<text x="28" y="${y + i * 26}" fill="#fff" font-size="22" font-weight="700" font-family="Georgia, serif">${l}</text>`
  ).join('')

export const posters: Record<string, PosterFn> = {
  stars: (a, b, name) => shell(a, b, `
    <circle cx="252" cy="72" r="58" fill="#fff" fill-opacity="0.12"/>
    <g transform="translate(28,52)">
      ${[0, 1, 2, 3, 4].map(i => `<path transform="translate(${i * 32},0) scale(1.15)" d="M12 2l3 6.5 7 .9-5 4.9 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.4l7-.9z" fill="#fff"/>`).join('')}
    </g>
    ${titleBlock(name, 130)}
    <text x="28" y="226" fill="#fff" fill-opacity="0.85" font-size="13" font-family="system-ui">Loved by our community</text>
    <rect x="28" y="252" width="264" height="1" fill="#fff" fill-opacity="0.3"/>
    <text x="28" y="292" fill="#fff" font-size="34" font-weight="700" font-family="system-ui">Rate us</text>
    <text x="28" y="318" fill="#fff" font-size="34" font-weight="700" font-family="system-ui">5 stars</text>
    <text x="28" y="358" fill="#fff" fill-opacity="0.8" font-size="12" font-family="system-ui">Scan · Copy · Post — takes 20 seconds</text>
  `),

  scan: (a, b, name) => shell(a, b, `
    <rect x="86" y="48" width="148" height="148" rx="16" fill="#fff"/>
    <g fill="${a}">
      ${Array.from({ length: 36 }).map((_, i) => {
        const x = 100 + (i % 6) * 22, y = 62 + Math.floor(i / 6) * 22
        return (i * 7) % 3 === 0 ? `<rect x="${x}" y="${y}" width="16" height="16" rx="3"/>` : ''
      }).join('')}
      <rect x="100" y="62" width="38" height="38" rx="8" fill="none" stroke="${a}" stroke-width="8"/>
      <rect x="182" y="62" width="38" height="38" rx="8" fill="none" stroke="${a}" stroke-width="8"/>
      <rect x="100" y="144" width="38" height="38" rx="8" fill="none" stroke="${a}" stroke-width="8"/>
    </g>
    ${titleBlock(name, 240)}
    <text x="28" y="312" fill="#fff" fill-opacity="0.9" font-size="14" font-family="system-ui">Scan to leave a Google review</text>
    <text x="28" y="352" fill="#fff" fill-opacity="0.7" font-size="12" font-family="system-ui">Your words help neighbours find us</text>
  `),

  quote: (a, b, name) => shell(a, b, `
    <text x="26" y="110" fill="#fff" fill-opacity="0.25" font-size="130" font-weight="700" font-family="Georgia, serif">“</text>
    <text x="28" y="150" fill="#fff" font-size="19" font-weight="600" font-family="Georgia, serif">Genuinely the best</text>
    <text x="28" y="178" fill="#fff" font-size="19" font-weight="600" font-family="Georgia, serif">experience I've had.</text>
    <rect x="28" y="204" width="52" height="3" rx="1.5" fill="#fff" fill-opacity="0.6"/>
    <text x="28" y="234" fill="#fff" fill-opacity="0.8" font-size="12" font-family="system-ui">— A verified visitor</text>
    ${titleBlock(name, 300)}
    <text x="28" y="360" fill="#fff" fill-opacity="0.75" font-size="12" font-family="system-ui">Share yours in one tap</text>
  `),

  badge: (a, b, name) => shell(a, b, `
    <circle cx="160" cy="128" r="72" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="2"/>
    <circle cx="160" cy="128" r="60" fill="#fff" fill-opacity="0.14"/>
    <text x="160" y="122" fill="#fff" font-size="40" font-weight="700" text-anchor="middle" font-family="system-ui">4.9</text>
    <text x="160" y="146" fill="#fff" fill-opacity="0.85" font-size="11" text-anchor="middle" font-family="system-ui" letter-spacing="2">RATED</text>
    ${titleBlock(name, 246)}
    <text x="28" y="318" fill="#fff" fill-opacity="0.85" font-size="13" font-family="system-ui">Thank you for trusting us</text>
    <text x="28" y="356" fill="#fff" fill-opacity="0.7" font-size="12" font-family="system-ui">Add your review — it takes a moment</text>
  `),
}
