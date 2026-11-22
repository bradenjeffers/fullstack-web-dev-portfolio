# Food Order App - React Front End

A small React single-page front end for a food ordering app: mock login, a customer home page and an admin dashboard.

## Overview

This project began as a Great Learning full-stack programme coursework assessment and was later tidied up for this portfolio. It is the first React stage of the Food Order App series: everything runs in the browser against hard-coded mock data, with no back end, no router and no state library (no Redux).

The assessment asked for a login page, a home page that shows cuisines, categories and restaurants, and an admin landing page. Cart, orders, profile and the admin CRUD screens are not implemented; they appear only as disabled placeholders.

## Features

- Login form with validation and error messages, checked against mock credentials
- Session kept in `sessionStorage` (survives a refresh, cleared on sign out or when the tab closes)
- Role-based view: a regular user sees the home page, an admin sees the dashboard
- Home page with three sections (10 cuisines, 15 categories, 10 restaurants) rendered from `src/*.js` mock data
- Admin dashboard with cards for cuisines, categories, food items, restaurants, menus, orders and users (buttons are disabled placeholders)
- Responsive layout with a Bootswatch "Flatly" Bootstrap theme

## Tech stack

React 18, React Bootstrap 2, Create React App (react-scripts 5), Jest and React Testing Library. Bootstrap Icons load from a CDN.

## Getting started

Requires Node.js 18 or newer.

```bash
npm install
npm start          # development server on http://localhost:3000
npm test           # smoke tests (interactive watch mode)
CI=true npm test   # run the tests once
npm run build      # production build into build/
```

### Demo logins

These are made-up, front-end-only accounts defined in `src/credentials.js` and `src/users.js`. They are not real credentials and protect nothing.

| Role    | Username   | Password          |
| ------- | ---------- | ----------------- |
| Admin   | `harry1992` | `demo-admin-pass` |
| Regular | `ron1993`   | `demo-user-pass`  |

## Project structure

```
public/
  index.html
src/
  App.js                  session state and role-based page choice
  session.js              safe sessionStorage helpers
  credentials.js          DEMO-ONLY mock credentials
  users.js                DEMO-ONLY mock user profiles (no passwords)
  cuisines.js, categories.js, restaurants.js    mock data
  components/             Header, Footer, ItemCard, AlertMessage
  pages/
    LoginPage.js
    userview/HomePage.js
    adminview/AdminDashboard.js
  App.test.js             login-flow smoke tests
```

## What I practised

- Building a React app from function components and hooks (`useState`) without a state library
- Controlled form inputs, validation and user-facing error handling
- Lifting state up: session state lives in `App` and flows down as props and callbacks
- Role-based conditional rendering
- Laying out pages with React Bootstrap's grid and components
- Writing component tests with React Testing Library (queries by role and label, simulated user input)

## Improvements over the original assessment version

- Login and sign out update React state instead of calling `window.location.reload()`; the session is read once, safely (corrupt or unavailable storage no longer crashes the app)
- Only the user profile is stored in session storage; passwords were removed from `users.js` (they were duplicated there) and the demo credentials are labelled as demo-only
- Placeholder personal-looking email addresses and passwords replaced with obvious demo values
- Login form is a real `<form>` with associated labels, `autocomplete` hints, controlled inputs, and works with the Enter key; the input `type="txt"` typo is fixed
- Credential lookup uses `hasOwnProperty`, so keys such as `constructor` cannot match
- Fixed React warnings and bugs: `class` to `className`, stable `key`s from item ids instead of array indexes, `import { React }` in Footer, `==` comparisons, a stray `variant` prop on `<img>`
- Accessibility: meaningful `alt` text on images, decorative icons hidden from screen readers, section headings linked to their sections, disabled (not dead) placeholder links and buttons
- Removed `console.log` debugging, unused imports, a side-effecting `localStorage.setItem` in the restaurants data file, and the repeated card markup in the admin dashboard and home page (now data-driven)
- Removed Create React App boilerplate: the placeholder README, `logo.svg`, `App.css`, `reportWebVitals` and the `web-vitals` dependency, the unused `bootstrap` dependency, default logos and manifest; page title and description set
- `App.test.js` was a failing "learn react" template test; it now covers the login flow (see Status)
- Fixed a copy-pasted pizza description on the Italian cuisine card

## Known limitations / next steps

- Authentication is simulated in the browser. Credentials ship in the JavaScript bundle, so this must not be treated as real security; a real version needs a server, hashed passwords and tokens or session cookies.
- No routing, cart, orders, profile, registration or admin CRUD
- Images are hot-linked from third-party hosts (Unsplash, Pexels, Pixabay, Wikimedia, TheMealDB) and may disappear or load slowly
- `src/bootstrap.min.css` is a vendored copy of the Bootswatch Flatly 5.2.3 theme (about 190 KB)

## Status

Source changes were checked in a restricted sandbox where the npm registry was unreachable (HTTP 403 from the egress proxy), so `npm install`, `npm run build` and `CI=true npm test` have **not** been run on the final code. What was checked: every file in `src/` parses as valid JSX and passes ESLint with `no-unused-vars` and `no-undef`. There is no `package-lock.json` yet (the original was removed rather than hand-edited); `npm install` creates one, and it should be committed. Run the commands above to confirm the build and tests on your machine.
