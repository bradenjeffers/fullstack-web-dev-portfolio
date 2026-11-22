# Food Order App: React + Redux client

A Create React App front end for the Food Order App domain: log in, browse cuisines, categories and restaurants, and (for admins) manage them from a dashboard. State lives in Redux (thunks for async work, redux-persist for storage).

> This project began as a Great Learning full-stack program coursework assessment (React, week 4). It has since been tidied and partly refactored. See [Improvements over the original assessment version](#improvements-over-the-original-assessment-version).

## Overview

This is the Redux version of the client in the Food Order App series. It talks to one of the sibling backends over HTTP:

- `05-node-http-api`: plain Node `http` server, `/v1/*` routes
- `06-express-mongodb-api`: Express + MongoDB, `/api/v1/*` routes, session tokens

The API address is configurable (see [Configuration](#configuration)). Which backend setups work, and how well that is verified, is listed in [Backend compatibility](#backend-compatibility).

## Features

- Login form with error and loading states; the signed-in user is kept for the browser tab (session storage)
- Route guards: `/`, `/profile` need a login; `/admin/*` needs a user with `isAdmin`
- Customer home page with cuisines, categories and restaurants fetched from the API (loading, error and empty states per section)
- Admin dashboard with list and add screens for categories, cuisines and restaurants (one shared form and one shared table, driven by `/admin/:entity` routes)
- Read-only profile page
- Four dashboard sections from the assessment brief (food items, orders, users, menu) are shown as "Not implemented yet"

## Tech stack

React 18, Redux 4 with `redux-thunk` and `redux-persist`, React Router 6, React Bootstrap with the Bootswatch "Flatly" theme, axios, Create React App 5 (Jest + React Testing Library).

## Getting started

Requires Node 18+ and a running backend.

```bash
npm install
cp .env.example .env     # optional; the defaults target 05-node-http-api
npm start                # http://localhost:3000
```

In another terminal, start the API (from the repository root):

```bash
cd food-order-app/05-node-http-api && npm start     # http://localhost:8080
```

Demo login for the 05 API: `john35@d` / `johnd` (see that project's README for the others).

Other scripts:

```bash
npm test         # Jest watch mode; use CI=true npm test for a single run
npm run build    # production bundle in build/
```

### Configuration

Create React App reads these at start/build time:

| Variable | Default | Meaning |
| --- | --- | --- |
| `REACT_APP_API_BASE_URL` | `http://localhost:8080/v1/` | API base URL including the version prefix |
| `REACT_APP_LOGIN_PATH` | `login` | Login endpoint relative to the base URL |

The original code hardcoded a third-party hosted API (`foodorder-api-elti.onrender.com`). That address is gone from the source; point `REACT_APP_API_BASE_URL` at it if it is still alive and you want to try it.

### Backend compatibility

| Backend | Settings | Status |
| --- | --- | --- |
| `05-node-http-api` (this repo) | defaults | Login, failed login and the three list endpoints were exercised against the running server through the real action creators (see Status). Its demo users have no `isAdmin` flag, so the admin screens cannot be reached with them. |
| `06-express-mongodb-api` (this repo) | `REACT_APP_API_BASE_URL=http://localhost:8080/api/v1/` and `REACT_APP_LOGIN_PATH=users/login` | Written against the source of that API (`{ message, data }` envelope, `sessionToken`, `_id`, `isAdmin`, `cors()` enabled), but **not run**: there is no MongoDB in the sandbox. To reach the admin screens, register a user with `isAdmin: true` via `POST /api/v1/users`. |
| Any other API | set the two variables | Works if it returns either a bare array/object or `{ data: ... }`, allows CORS from the client origin, and returns the user object (with `isAdmin` for admins) from the login call |

Both repo backends default to port 8080, so run only one at a time (or change `PORT` for one of them and the base URL here).

The client sends `Authorization: Bearer <sessionToken>` on list requests when the login response contained a `sessionToken` (or `token`). The plain-Node API ignores it.

## Project structure

```
04-react-redux-frontend/
├── public/                    # index.html, icons, manifest
├── .env.example
└── src/
    ├── index.js               # Provider + PersistGate + BrowserRouter
    ├── App.js                 # routes and layout
    ├── store.js               # reducers, redux-persist config, thunk middleware
    ├── api/client.js          # shared axios instance
    ├── constants/             # API config and Redux action types
    ├── actions/               # thunks: login/logout, list fetches, local admin additions
    ├── reducers/              # login, list reducers (factory), local catalogue
    ├── hooks/useCatalog.js    # fetched items + admin-added items for one collection
    ├── utils/apiHelpers.js    # response unwrapping, error messages, auth header
    ├── components/            # Header, Footer, ItemCard, CatalogSection, RequireAuth, AlertMessage
    ├── pages/                 # LoginPage, UserProfilePage, userview/HomePage, adminview/*
    └── styles/                # Bootswatch Flatly theme (vendored, see below)
```

Tests sit next to the code they cover (`*.test.js`); `src/test-utils.js` renders with a fresh store and an in-memory router.

## How state is stored

- `login.userInfo` is persisted with redux-persist in **sessionStorage**, so it ends with the tab. The password is never kept: the plain-Node API echoes stored user records, and the client strips the field before dispatching.
- Items added in the admin screens are persisted in **localStorage** (`localCatalog`) and merged into the lists the API returns. The API used here has no create endpoint, so these additions exist only in that browser. Locally added rows can be deleted; fetched rows are shown as read-only.
- Fetched lists (loading, error, data) are not persisted.

## What I practised

- Structuring a Redux app: constants, thunk action creators, reducers, and a store with middleware
- Making async code predictable: request/success/failure actions, one place for error messages, no unhandled rejections
- redux-persist: persisting selected slices to different storage engines (session vs local)
- React Router 6: protected routes, route params, redirecting from render instead of from effects
- Reducing duplication (six near-identical admin pages became one form and one table; three list reducers share a factory)
- Writing tests: pure reducer and helper tests, thunk tests with a mocked HTTP client, and component tests with React Testing Library

## Improvements over the original assessment version

- API base URL is configurable (`REACT_APP_API_BASE_URL`, `.env.example`) instead of hardcoded to a third-party host; login path is configurable too. The `package.json` `proxy` entry was removed as redundant.
- Response parsing accepts both a bare payload and a `{ message, data }` envelope; a non-array list response becomes an error message instead of crashing the UI
- Removed `useNavigate` imported in the action file (a hook outside a component); logout no longer does `window.location.replace`, it clears state and the route guards redirect
- Removed the Header effect that redirected once on mount; replaced with `RequireAuth` guards, which also stop non-admins from opening `/admin`
- Login: real `<form>` (Enter submits), controlled inputs, `type="text"` (was `"txt"`), password stripped from stored user, specific error messages instead of one generic string
- One store of truth for sessions: sessionStorage reads/writes by hand were replaced with redux-persist (it was a dependency but never used); `localStorage` is no longer read in thunks or in three places per entity
- Admin additions now show up on the customer home page (before, the API fetch overwrote them); ids no longer collide with API ids (`local-...` instead of `length + 1`); deleting now actually updates the stored data (before it only changed component state)
- Removed inert UI: the "Edit" buttons and the profile "Update Details" button did nothing; the profile page lost its password fields and is now read-only
- Fixed request headers: `Access-Control-Allow-*` are response headers and were being sent on requests, which only forced preflights
- Fixed `class` vs `className`, loose `==`/`!=`, `key={index}`, duplicate `controlId`s, `type="textarea"`, `import { React }`, missing `alt` text, icons wrapping label text
- Removed console logging, unused imports and state, the unused `restaurantDetails`/user-details reducers and action constants, the CRA template leftovers (`App.css`, `logo.svg`, `reportWebVitals`, "learn react" test), and `.DS_Store` files
- Dependencies: dropped the accidental `install` and `thunk` packages plus `bootstrap` (CSS comes from the Flatly theme), `react-router` (re-exported by `react-router-dom`), `redux-devtools-extension` (deprecated; the browser extension hook is used directly) and `web-vitals`; test libraries moved to `devDependencies`; real package name, license and `engines`
- `src/styles/bootswatch-flatly.min.css` is the Bootswatch 5.2.3 Flatly build (about 190 KB), kept because it is a theme, not a copy of the Bootstrap package

## Known limitations / next steps

- Admin create/delete does not call the API. The 06 backend has admin-only `POST`/`PUT`/`DELETE` endpoints for these collections; wiring the forms to them (with the session token) is the obvious next step.
- No edit screens, and no food items, orders, users or menu screens
- Profile editing is not implemented; no backend used here has a suitable call wired up
- Sessions are client-side only: logout does not call the 06 `PUT /users/logout` endpoint
- Admin routes are guarded in the UI only; real protection has to come from the API
- Images are loaded from whatever URL the data contains, with no fallback when one fails
- Bootstrap Icons are loaded from a CDN in `public/index.html`

## Status

What was verified, and how (Node 22, in the sandbox used to prepare this folder):

- **Not run: `npm install`, `npm run build`, `CI=true npm test`.** The sandbox blocks the npm registry (HTTP 403 from its egress proxy), so no dependencies could be installed. The build and the React Testing Library tests in `src/App.test.js` have therefore never been executed.
- There is no `package-lock.json` yet (the original was removed rather than hand-edited). The first `npm install` creates one; commit it.
- Syntax and import resolution of every source and test file were checked by bundling them with esbuild (packages external).
- The reducer, helper and thunk tests (`reducers.test.js`, `apiHelpers.test.js`, `actions.test.js`: 29 tests) were executed with a small Jest-compatible shim and all passed. Real Jest was not used, so Jest-specific behaviour (module mocking, matcher details) is unconfirmed.
- The real action creators and a real axios were run against the running `05-node-http-api` server: successful login (no password in the resulting user), failed login ("Invalid username or password"), and the categories (15), cuisines (10) and restaurants (10) lists. The UI itself was not rendered or clicked through, and the 06 API was not run.
