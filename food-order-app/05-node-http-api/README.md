# Food Order App: Node.js HTTP API

A REST API for the Food Order App domain (categories, cuisines, restaurants, food items, menus, users and login), written with Node's built-in `http` module only. Data comes from JSON files. There are **zero runtime dependencies** and no `node_modules`.

> This project began as a Great Learning full-stack program coursework assessment (Node.js module). It has since been tidied, hardened and tested. See [Improvements over the original assessment version](#improvements-over-the-original-assessment-version).

## Overview

This is the backend for the Food Order App series. The React/Redux client in the sibling folder `04-react-redux-frontend` calls it from `http://localhost:3000`, which is why CORS is enabled for that origin by default.

The code is split into three layers:

- `server.js`: routing, CORS, request logging, error-to-response mapping
- `app/handlers/`: one module per resource; parse the request, call a service, send the response
- `app/service/`: business logic over the data (lookups, filtering, joins); the only layer that touches `app/data/*.json`

## Features

- Read endpoints for categories, cuisines, restaurants, food items, menus, menu items and users, each with list and lookup-by-id (users: by username)
- Restaurants filtered by cuisine and/or category name
- A restaurant's menu as display rows, with dishes matching a category or cuisine moved to the front
- `POST /v1/login` against demo users; the password is never returned
- JSON error responses with proper status codes (400, 401, 404, 405, 413, 500)
- CORS headers plus `OPTIONS` preflight handling
- One-line request logging, e.g. `2026-11-03T01:23:06.559Z POST /v1/login 200 2.1ms`
- Configurable `PORT` and `CORS_ORIGIN`
- Runs from any working directory (data paths are resolved from the source file location)

## Tech stack

Node.js 18+ (developed and tested on Node 22), built-in modules only (`http`, `fs`, `path`, `crypto`), `node:test` for tests.

## Getting started

```bash
cd food-order-app/05-node-http-api
npm start            # node server.js, listens on http://localhost:8080
```

```bash
npm test             # node --test; starts the server on an ephemeral port, no setup needed
```

There is nothing to install.

Configuration is through environment variables (see `.env.example`):

| Variable      | Default                 | Meaning                                  |
| ------------- | ----------------------- | ---------------------------------------- |
| `PORT`        | `8080`                  | Port to listen on (`0` picks a free one) |
| `CORS_ORIGIN` | `http://localhost:3000` | Value of `Access-Control-Allow-Origin`   |

```bash
PORT=3001 npm start
# or, on Node 20.6+, from a .env file:
cp .env.example .env && node --env-file=.env server.js
```

## API

Base URL: `http://localhost:8080`. All responses are JSON. Errors have the shape `{ "message": "..." }`.

| Method  | Path              | Query parameters                                                   | Description                                      |
| ------- | ----------------- | ------------------------------------------------------------------ | ------------------------------------------------ |
| GET     | `/v1/categories`  | `id` (optional)                                                    | All categories, or one by id                     |
| GET     | `/v1/cuisines`    | `id` (optional)                                                    | All cuisines, or one by id                       |
| GET     | `/v1/restaurants` | `id`, or `cuisine` and/or `category` (names, case-insensitive)     | All restaurants, one by id, or filtered          |
| GET     | `/v1/fooditems`   | `id` (optional)                                                    | All food items, or one by id                     |
| GET     | `/v1/menus`       | `id` (optional)                                                    | All menus, or one by id                          |
| GET     | `/v1/menuitems`   | `id`, or `restaurantId` with optional `categoryId` and `cuisineId` | All menu items, one by id, or a restaurant menu  |
| GET     | `/v1/users`       | `username` (optional)                                              | All users, or one by username (no passwords)     |
| POST    | `/v1/login`       | JSON body `{ "username", "password" }`                             | Returns the matching user object (no password)   |
| OPTIONS | any route above   |                                                                    | CORS preflight, `204`                            |

Notes on the query parameters:

- `id` takes precedence over every other parameter. An empty `id=` is a `400`.
- `/v1/restaurants?cuisine=` / `?category=`: restaurants have no cuisine or category field of their own, so a restaurant matches when at least one dish on its menu has that cuisine/category. With both parameters, a single dish must match both. An unknown name is a `404`; a valid name with no matching restaurants is `200 []`.
- `/v1/menuitems?restaurantId=`: returns rows shaped `{ "Menuitem Id", "Fooditem Id", "Fooditem Name", "Fooditem Image", "Fooditem Price" }` (these key names are kept from the original assessment for client compatibility). `categoryId` / `cuisineId` reorder the menu so matching dishes come first; nothing is removed. `categoryId` or `cuisineId` without `restaurantId` is a `400`.
- A trailing slash on a path is accepted.

### Status codes

| Code | When                                                                                                                              |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- |
| 200  | Success                                                                                                                           |
| 204  | `OPTIONS` preflight                                                                                                               |
| 400  | Empty `id`, missing/invalid login fields, body that is empty or not a JSON object, `categoryId`/`cuisineId` without `restaurantId` |
| 401  | Login with unknown username or wrong password (same response for both)                                                            |
| 404  | Unknown route, unknown id/username/cuisine/category, or restaurant without a menu                                                 |
| 405  | Wrong method for a route; the `Allow` header lists the permitted ones                                                             |
| 413  | Request body larger than 64 KB                                                                                                    |
| 500  | Unexpected error (logged to stderr, generic message returned)                                                                     |

### Example requests

These were run against a local server started with `npm start`; response bodies are trimmed where long.

```bash
curl "localhost:8080/v1/categories?id=2"
# {"id":2,"name":"Pasta","description":"Deliciously sauced strands of pasta, ...","image":"https://..."}

curl "localhost:8080/v1/restaurants?cuisine=italian"
# [{"id":2,"name":"Tasty Haven",...},{"id":3,"name":"Gourmet Junction",...},{"id":7,...},{"id":8,...},{"id":9,...}]

curl "localhost:8080/v1/restaurants?cuisine=Italian&category=Pizza"
# [{"id":7,"name":"Flavor Symphony",...},{"id":8,"name":"Greenleaf Restaurant",...},{"id":9,"name":"Spice Junction",...}]

# Restaurant 1's menu with the Thai dish (cuisineId=5) moved to the front
curl "localhost:8080/v1/menuitems?restaurantId=1&cuisineId=5"
# [{"Menuitem Id":4,"Fooditem Id":11,"Fooditem Name":"Thai Green Curry",...,"Fooditem Price":12},{"Menuitem Id":1,...},...]

curl "localhost:8080/v1/users?username=john35@d"
# {"id":1,"email":"john@gmail.com","username":"john35@d","fullname":"John Doe"}

curl -X POST localhost:8080/v1/login -H "Content-Type: application/json" \
  -d '{"username":"john35@d","password":"johnd"}'
# {"id":1,"email":"john@gmail.com","username":"john35@d","fullname":"John Doe"}

curl -i -X POST localhost:8080/v1/login -H "Content-Type: application/json" \
  -d '{"username":"john35@d","password":"wrong"}'
# HTTP/1.1 401 Unauthorized ... {"message":"Invalid credentials"}

curl -X POST localhost:8080/v1/login -d '{oops'
# {"message":"Request body must be valid JSON"}

curl -i "localhost:8080/v1/restaurants?id=999"
# HTTP/1.1 404 Not Found ... {"message":"Restaurant with id 999 was not found"}

curl -i -X DELETE localhost:8080/v1/categories
# HTTP/1.1 405 Method Not Allowed ... Allow: GET, OPTIONS

curl -i -X OPTIONS localhost:8080/v1/login -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST"
# HTTP/1.1 204 No Content ... Access-Control-Allow-Origin: http://localhost:3000
```

### Demo data and login

`app/data/users.json` contains **demo accounts with plaintext passwords**, kept from the original assessment so the login flow can be exercised. They are fake and exist for demonstration only. Do not copy this approach for real data: passwords should be stored as salted hashes (scrypt, argon2 or bcrypt) and login should issue a session or token.

What the API does to limit the damage: the `password` field is stripped from every response (including `/v1/users`), password comparison uses `crypto.timingSafeEqual` over SHA-256 digests, and an unknown username and a wrong password return the identical `401`.

Demo logins for trying it out: `john35@d` / `johnd`, `mor_2314` / `morrd`, `kevinryan` / `kevinR`, `donero` / `donromer`.

## Project structure

```
05-node-http-api/
├── server.js                 # createServer(), route table, CORS, logging; listens only when run directly
├── package.json
├── .env.example
├── app/
│   ├── http.js               # sendJson, readJsonBody, HttpError (shared response helpers)
│   ├── handlers/             # category, cuisine, restaurant, fooditem, menu, menuitem, user
│   ├── service/              # data access + logic; dataLoader.js resolves paths from __dirname
│   └── data/                 # JSON "database" (demo data)
└── test/
    └── api.test.js           # node:test + fetch against an ephemeral-port server
```

## What I practised

- Building an HTTP server and a small router on Node's `http` module without a framework
- Layering code into handlers, services and a data store, and keeping HTTP concerns out of the service layer
- Designing consistent error handling: one `HttpError` type mapped to JSON responses in a single place
- Safe request-body handling (size limit, JSON parse errors surfaced as `400` instead of crashing)
- CORS and preflight requests, and why a browser client on another origin needs them
- Writing integration tests with `node:test` and `fetch` against a server on an ephemeral port

## Improvements over the original assessment version

- `npm start` was broken (`"start": "server.js"`); it is now `node server.js`, and `npm test` runs a real test suite
- Data files were read relative to the working directory (`./app/data/...`), so the server only worked when started from the project root; paths are now `__dirname`-based
- `menuItems.json` was read as `menuitems.json`, which fails on case-sensitive file systems (Linux); the file is renamed to match
- Invalid JSON in a login request threw inside an event callback and crashed the process; it is now a `400`
- Not-found ids returned `200` with an error message; they now return `404`. Wrong methods returned `404`; they now return `405` with `Allow`
- `?cuisine=` read a `cuisine` field that restaurants do not have, so it threw; cuisine filtering now follows restaurant, menu, menu item, food item, cuisine. The category filter uses the same lookup, and both match names case-insensitively
- `/v1/menuitems?restaurantId=<unknown>` crashed on an undefined menu; it is now a `404`
- Login no longer returns the `password` field, compares in a timing-safe way, validates its input, and returns `401` (was `403`) for bad credentials
- Removed the copy-pasted per-handler boilerplate (content type, status, method check, logging) in favour of the shared helpers in `app/http.js`
- Added CORS and `OPTIONS` preflight, `PORT` from the environment, and one-line request logging in place of scattered `console.log(new Date())` calls
- Renamed `restuarantHandlers.js` to `restaurantHandlers.js`; fixed the `Creadentials` typo; removed the "COMPLETE TASK" template comments
- `server.js` exports `createServer()` and listens only when run directly, which makes the server testable
- README rewritten as API documentation

Compatibility notes: response shapes for successful calls are unchanged (login returns the bare user object, menu rows keep their original keys). Behaviour that changed on purpose: error status codes, and passwords are no longer in user responses.

## Known limitations / next steps

- Read-only: there are no create/update/delete endpoints, and data is loaded into memory once at startup (edit a JSON file and restart to see changes)
- Login returns the user only; there is no session, token or authentication on other routes
- Demo passwords are plaintext (see above); real credential storage would need hashing and a proper database
- Username lookup is not constant-time (only the password comparison is), and there is no rate limiting
- No pagination; the dataset is tiny
- `Access-Control-Allow-Origin` is a single fixed origin rather than an allow-list

## Status

Verified in this repository on Node 22:

- `npm test`: 44 tests across 7 suites pass (collections, lookup by id, restaurant filters, restaurant menus, users/login including malformed and oversized bodies, routing/405/CORS/preflight/logging, and starting `server.js` from a different working directory with `PORT=0`).
- The `curl` examples above were run against a live server and the outputs are real (long response bodies are trimmed in this README).
- Starting with `node --env-file=<file>` was checked on Node 22.
- Not tested: Node 18/20 (declared in `engines`, but only Node 22 was available), the React client against this server (the `04-react-redux-frontend` folder was not present when this was written), and any production deployment (none exists).
