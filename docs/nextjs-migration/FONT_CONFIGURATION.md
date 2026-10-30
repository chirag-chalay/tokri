# Tokriii Font Configuration & Verification Plan

## 1. Source Font Requirements

Both the original React/Vite baseline and the Next.js App Router layout load **Plus Jakarta Sans** via Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
  rel="stylesheet"
/>
```

### Exact Styles and Weights Required
| Font Family | Style | Weight | PostScript / Descriptor | Typical Storefront Usage |
| --- | --- | --- | --- | --- |
| Plus Jakarta Sans | Normal (Roman) | `400` | Regular | Body text, descriptions, disclaimers, input fields |
| Plus Jakarta Sans | Normal (Roman) | `500` | Medium | Navigation links, badge labels, metadata items |
| Plus Jakarta Sans | Normal (Roman) | `600` | SemiBold | Subheadings, price labels, card titles, button labels |
| Plus Jakarta Sans | Normal (Roman) | `700` | Bold | H1 page titles, section hero banners, modal titles |
| Plus Jakarta Sans | Italic | `400` | Italic | Testimonial quotes, editorial subtitles |

---

## 2. Local Font Fixture Setup (For Offline Visual Verification)

Because strict test isolation blocks external requests to `fonts.googleapis.com` and `fonts.gstatic.com`, offline visual verification requires local WOFF2 font files placed under `public/fonts/`.

### Target Directory Structure
```
public/fonts/
├── plus-jakarta-sans-latin-400-normal.woff2
├── plus-jakarta-sans-latin-500-normal.woff2
├── plus-jakarta-sans-latin-600-normal.woff2
├── plus-jakarta-sans-latin-700-normal.woff2
├── plus-jakarta-sans-latin-400-italic.woff2
└── fonts.css
```

### Local `@font-face` Fixture Definition (`public/fonts/fonts.css`)
```css
/* Plus Jakarta Sans - 400 (Regular) */
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/plus-jakarta-sans-latin-400-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Plus Jakarta Sans - 500 (Medium) */
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/plus-jakarta-sans-latin-500-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Plus Jakarta Sans - 600 (SemiBold) */
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/plus-jakarta-sans-latin-600-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Plus Jakarta Sans - 700 (Bold) */
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/plus-jakarta-sans-latin-700-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Plus Jakarta Sans - 400 (Italic) */
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/plus-jakarta-sans-latin-400-italic.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

---

## 3. Parity Status Assessment

- **Font Matching:** **EXACT.** No font substitution or CSS family modification has been introduced. The CSS font family in `src/index.css` remains `--font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;`.
- **Local Availability:** **BLOCKED.** Local WOFF2 font files have not yet been provided by the administrator in `public/fonts/`.
- **Offline Rendering:** Under local network isolation, the browser falls back to system sans-serif fonts (`system-ui, sans-serif`).
- **Release Gate:** Real font parity is strictly marked **BLOCKED** until approved WOFF2 font assets are placed in `public/fonts/`.
