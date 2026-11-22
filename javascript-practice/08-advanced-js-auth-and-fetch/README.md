# Advanced JavaScript: Client-Side Auth and API Data

Registration, sign-in, a protected page and data loaded from a REST API, in plain JavaScript.

## Overview

Originally the "Advanced JavaScript" assessment from a Great Learning full-stack course: `localStorage`/`sessionStorage`, `async`/`await`, `fetch`, and error handling. After signing in, the home page loads cuisines, categories and restaurants from the Food Order API (the same API implemented in `food-order-app/05-node-http-api`).

> **This is a learning exercise, not real security.** Anything stored in the browser can be read or edited by the person using it. Real authentication belongs on a server (see `food-order-app/06-express-mongodb-api`).

## Features

- Register with validation; usernames are unique (case-insensitive)
- Sign in / log out; the home page redirects to sign-in when you aren't logged in
- Cuisines, categories and restaurants load independently, each with its own loading state, error message and **Retry** button
- Request timeout (10 s) and tolerant response parsing (bare array or `{ data: [...] }`)

## Getting started

1. Start the API (no dependencies needed):
   ```bash
   cd ../../food-order-app/05-node-http-api
   npm start            # http://localhost:8080
   ```
2. Serve this folder on port **3000** (the API's default allowed CORS origin):
   ```bash
   python3 -m http.server 3000
   ```
3. Open <http://localhost:3000/html/register.html>, create an account, sign in.

To point at a different API, edit `js/config.js`. If you serve this app on another port, start the API with `CORS_ORIGIN=http://localhost:<port>`. The original assessment used a free hosted API that may no longer be running.

Unit tests (Node 18+, no dependencies): `node --test`

## Project structure

```
html/index.html, signin.html, register.html
css/style.css
js/auth-core.js    registration, hashing, sign-in logic (no DOM; unit-tested)
js/catalog.js      fetch + render cuisines/categories/restaurants
js/config.js       API base URL
js/app.js          page wiring
test/              unit tests
```

## What I practised

- `async`/`await`, `fetch`, `AbortController` timeouts, `Promise`-based error handling
- Web Storage (`localStorage` vs `sessionStorage`) and when to use each
- The Web Crypto API (`PBKDF2`) and why passwords are salted and hashed
- Separating logic (testable in Node) from page wiring

## Improvements over the original assessment version

- **No plain-text passwords:** the original stored the whole user object, password included, as JSON in `localStorage` keyed by the username. Passwords are now salted and hashed with PBKDF2-SHA-256 (100,000 iterations) via the Web Crypto API, and the stored record has no `password` field (tested).
- **Safer storage:** users live in one namespaced list instead of one `localStorage` key per username, which could collide with other keys; usernames like `__proto__` are handled safely (tested).
- **Better validation:** unique usernames, email and phone format, an 8-character password minimum. Errors for unknown user and wrong password are identical, so the form doesn't reveal which usernames exist.
- **HTML fixes:** in the original register form every `<label>` pointed at `for="fullname"`, the full-name input had `type="Full name"`, and some page titles were "Document". All fixed, with proper `autocomplete` attributes.
- **Resilient data loading:** per-section loading and error states with Retry (the original wrote one generic message), a timeout, and cards for items without an image (the original silently dropped them).
- **Safe rendering:** DOM APIs and `textContent` throughout; no inline `onclick`/`onsubmit`.

## Limitations

Hashing needs a secure context (`https://` or `localhost`); on plain `http://` over a network the page reports that. Accounts exist only in one browser. There is no password reset. Images come from third-party sites.

## Status

- 8 unit tests pass on Node 22 (registration, hashing, generic errors, duplicate/`__proto__` usernames, corrupt storage, response parsing, HTTP errors).
- Walked through end to end in headless Chromium (Playwright) against the real `05-node-http-api` server: route guard redirect, validation, registration, wrong password, sign-in, loading 10 cuisines / 15 categories / 10 restaurants, logout, and the error + Retry flow with the API blocked. There are no automated browser tests in the repo.
