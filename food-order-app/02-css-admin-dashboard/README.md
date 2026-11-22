# Food Order App, Stage 2: CSS Admin Dashboard

The admin pages from stage 1 with a responsive, accessible stylesheet: flexbox navigation and dashboard, grid-based forms and scrollable data tables.

## Overview

The second stage of the Food Order App series, built up through a Great Learning full-stack course. The markup is the same as `../01-html-admin-pages`; this stage adds `css/style.css`. The pages are still static.

## Features

- Top navigation with the current page highlighted
- Dashboard of cards (flexbox) that wraps from 4 columns down to 1
- Data tables inside a scroll wrapper, so wide tables never break the page on phones
- Forms laid out with CSS Grid (label beside field on desktop, stacked on mobile)
- Visible keyboard focus and reduced-motion support

## Getting started

Open `index.html` in a browser. No build step.

## Project structure

```
index.html
pages/            8 list and add pages
css/style.css     one shared stylesheet, driven by custom properties
```

## What I practised

- Flexbox and Grid, and picking the right one
- CSS custom properties for a consistent colour palette
- Responsive design with `flex-wrap`, `minmax()` and a media query
- Accessible styling: contrast, `:focus-visible`, `prefers-reduced-motion`, a visually-hidden utility class

## Improvements over the original assessment version

- **Layout bug:** the original `.container` was `height: 100vh` with vertical centring, so tables taller than the screen overflowed and were clipped. Pages now size to their content.
- **Font:** the stylesheet asked for the "Afacad Flux" font but never loaded it, so it silently fell back. It now uses the system font stack (no external request).
- **Fragile background:** the full-page image was hotlinked from another company's website; replaced with a CSS gradient.
- **Selectors:** a lot of `id`s and one-off rules were consolidated into a few reusable classes. `margin: 0, auto` (invalid) is gone.
- **Responsiveness:** tables scroll in a wrapper; forms and dashboard adapt at small widths (checked at 375px wide, no horizontal page scroll).
- **Accessibility:** focus outlines, semantic landmarks, labelled controls, and text/background pairs that I measured at 4.7:1 or better (white on the purple button is 5.2:1; WCAG AA needs 4.5:1).

## Limitations

Static pages: forms don't save and Edit buttons do nothing (see the later stages in this series). Images are hotlinked from third-party sites.

## Status

Checked in headless Chromium at 1280px and 375px wide: all 9 pages load, internal links resolve, there is no horizontal page scroll on mobile, and I reviewed screenshots of the dashboard, a table page and a form. No automated tests; not run through a CSS validator.
