# DOM Manipulation: Portfolio Page

A portfolio page whose project cards are generated from a JavaScript array, with a form to add new projects.

## Overview

Originally the "DOM Manipulation in JavaScript" assessment from a Great Learning full-stack course. The assessment asked for three functions (`loadProjects`, `newProjectId`, `saveNewProject`); this version keeps that structure and hardens it.

## Features

- Renders project cards from the `projects` array
- "Add project" form with validation and an inline status message
- New projects appear immediately; the form resets and refocuses
- Broken remote images fall back to a local placeholder instead of a broken-image icon

## Tech stack

HTML, CSS (flexbox, `clamp()`), vanilla JavaScript. No build step, no dependencies.

## Getting started

Open `index.html` in a browser. (Or serve the folder: `python3 -m http.server 8000`.)

## Project structure

```
index.html
css/styles.css
js/projects.js     seed data
js/script.js       rendering + form handling
```

## What I practised

- Creating and inserting elements with `createElement`, `append` and `replaceChildren`
- Handling form `submit` events and validating input
- Keeping data (the array) separate from presentation (the DOM)
- Writing accessible forms (labels, `aria-live` status messages, visible focus)

## Improvements over the original assessment version

- **Safer rendering:** cards are built with `textContent`, never `innerHTML`, so a title such as `<img onerror=...>` is shown as text and cannot run code. Image URLs must be `http(s)`, which blocks `javascript:` URLs.
- **No `alert()`:** validation messages appear in an `aria-live` region.
- **Event handling:** inline `onclick`/`onload`/`onsubmit` attributes replaced with `addEventListener`, and scripts load with `defer`.
- **Ids:** `newProjectId()` uses the highest existing id + 1 instead of assuming the last item has the highest id.
- **Accessibility and layout:** a real `<label>` for every field (not a table layout), semantic `<main>`/`<section>`, a descriptive page title (it was "Document"), responsive spacing (the fixed 5rem margins squeezed mobile), `prefers-reduced-motion` support, and the distracting hover-zoom on whole sections removed.

## Limitations

Projects are held in memory only, so a page refresh resets the list. The background and seed images are hotlinked from third-party sites and could disappear.

## Status

Checked in headless Chromium (Playwright): initial render of 5 cards, adding a project, rejecting a `javascript:` URL, rejecting empty fields, an injected-HTML title rendered as plain text without executing, image fallback, and no horizontal scrolling at 375px wide. There are no automated tests in the repo.
