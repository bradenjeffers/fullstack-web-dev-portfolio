# Food Order App: Express + MongoDB API

A REST API for a food ordering app, built with Express and MongoDB (Mongoose), with JWT-based sessions, role checks and an automated API test suite (mocha, chai, supertest).

> This project began as a Great Learning full-stack program coursework assessment (the Express/MongoDB backend and the unit-testing assessment on top of it). It has since been tidied, hardened and extended. See [Improvements over the original assessment version](#improvements-over-the-original-assessment-version).

## Overview

This is the database-backed backend of the Food Order App series. Its siblings in this repository:

- `05-node-http-api` is the simpler version of the same domain: Node's built-in `http` module, JSON files instead of a database, read-only endpoints, routes under `/v1`.
- `06-express-mongodb-api` (this project) uses Express and MongoDB, supports full create/read/update/delete for the catalogue, user accounts with login, and orders. All routes live under `/api/v1`.
- `04-react-redux-frontend` was written against the `05` API. It has not been wired to this one, and the response shapes differ (this API wraps results in `data` and uses `/api/v1`), so it would need a small adapter.

The code has three layers: `app/routes` (URL and middleware wiring), `app/services` (request validation and business rules), `app/database/repositories` (the only code that queries Mongoose models).

## Features

- Users: register, log in, log out, read/update own profile, admin list and soft-delete
- Catalogue CRUD for categories, cuisines, restaurants and food items (admin writes, public reads, soft delete)
- Menus per restaurant with per-item prices; items matching `?cuisine=` or `?category=` are moved to the top
- Restaurants filterable by cuisine or category name
- Orders: place an order, per-user history and detail, admin view of all orders and status changes
- Session tokens: JWT stored with a server-side session row, so logout and user deletion take effect immediately
- Passwords hashed with bcrypt (`bcryptjs`); hashes are never returned by any endpoint
- Consistent JSON errors (`{ "message": "..." }`) with proper status codes: 400, 401, 403, 404, 409, 500
- `GET /health` (readiness, reflects the database connection) and `GET /PING` (liveness)

## Tech stack

Node.js 18+, Express 4, Mongoose 7 (MongoDB), jsonwebtoken, bcryptjs, dotenv, cors. Tests: mocha, chai 4, supertest.

## Getting started

Requires Node.js 18 or newer and a MongoDB server.

1. Start MongoDB locally. The quickest way is Docker:

   ```bash
   docker run -d --name food-order-mongo -p 27017:27017 mongo:7
   ```

2. Install and configure:

   ```bash
   npm install
   cp .env.example .env
   ```

   Edit `.env` and set `JWT_SECRET_KEY`. The server refuses to start without it. Generate a value with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

3. Create an admin account (admin sign-up through the public endpoint is off by default):

   ```bash
   ADMIN_USERNAME=admin ADMIN_PASSWORD='choose-a-long-password' ADMIN_EMAIL=you@example.com npm run create-admin
   ```

4. Run the server:

   ```bash
   npm start
   curl http://localhost:8080/health
   ```

### Running the tests

The tests need a running MongoDB (step 1 above) but not a `.env` file. They use their own database, `food_order_app_test` on `127.0.0.1:27017` by default, and empty it before and after the run. Set `TEST_DATABASE_URI` to use another server; the database name must end in `_test` or the suite refuses to start.

```bash
npm test
```

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `JWT_SECRET_KEY` | Yes (not in tests) | none | Signs session tokens. The server exits with a clear message if it is missing. |
| `DATABASE_URI` | Only when `NODE_ENV=production` | `mongodb://127.0.0.1:27017/food_order_app` | MongoDB connection string for the app. It is never logged. |
| `TEST_DATABASE_URI` | No | `mongodb://127.0.0.1:27017/food_order_app_test` | Database used by `npm test`; name must end in `_test`. |
| `PORT` | No | `8080` | HTTP port. |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime (any `jsonwebtoken` `expiresIn` value). |
| `ALLOW_ADMIN_SIGNUP` | No | `false` | When `true`, `POST /api/v1/users` honours `isAdmin: true`. Development convenience only; the tests turn it on for themselves. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_FULLNAME` | For `npm run create-admin` | none | Account created or promoted by the script. |

## API

Base path `/api/v1`. Send the token from login as `Authorization: Bearer <sessionToken>`. "Self or admin" means the `:id` or `:userId` in the URL must be the caller's own id unless the caller is an admin.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/PING` (no prefix) | none | Liveness check, returns `{"message":"PONG"}` |
| GET | `/health` (no prefix) | none | Readiness: 200 when MongoDB is connected, 503 otherwise |
| POST | `/api/v1/users` | none | Register a user |
| POST | `/api/v1/users/login` | none | Log in, returns the session token |
| PUT | `/api/v1/users/logout` | user | End the current session |
| GET | `/api/v1/users` | admin | List active users |
| GET | `/api/v1/users/:id` | self or admin | Read one user |
| PUT | `/api/v1/users/:id` | self or admin | Update `fullname`, `email`, `password` (`isAdmin` only if the caller is admin) |
| DELETE | `/api/v1/users/:id` | admin | Deactivate a user and end their sessions |
| GET | `/api/v1/categories` | none | List categories |
| GET | `/api/v1/categories/:id` | none | Read one category |
| POST | `/api/v1/categories` | admin | Create (`name`, `description`, `image`) |
| PUT | `/api/v1/categories/:id` | admin | Partial update |
| DELETE | `/api/v1/categories/:id` | admin | Soft delete |
| GET, POST, PUT, DELETE | `/api/v1/cuisines[/:id]` | same as categories | Same shape as categories |
| GET | `/api/v1/restaurants` | none | List; optional `?cuisine=<name>` or `?category=<name>` |
| GET | `/api/v1/restaurants/:id` | none | Read one restaurant |
| POST, PUT, DELETE | `/api/v1/restaurants[/:id]` | admin | Create (`name`, `address`, `contact`, `image`), update, soft delete |
| GET | `/api/v1/fooditems`, `/api/v1/fooditems/:id` | none | List / read food items |
| POST, PUT, DELETE | `/api/v1/fooditems[/:id]` | admin | Create (`name`, `description`, `image`, `categoryId`, `cuisineId`, `isVeg`), update, soft delete |
| GET | `/api/v1/menus/:restaurantId` | none | A restaurant's menu; optional `?cuisine=` / `?category=` sorts matching items first |
| POST | `/api/v1/menus` | admin | Create a menu with its items |
| PUT | `/api/v1/menus/:menuId` | admin | Update the description and item prices |
| DELETE | `/api/v1/menus/:menuId` | admin | Delete a menu and its items |
| POST | `/api/v1/orders` | user | Place an order for the logged-in user |
| GET | `/api/v1/orders` | admin | List all orders |
| GET | `/api/v1/orders/:userId` | self or admin | A user's order history |
| GET | `/api/v1/orders/:userId/:orderId` | self or admin | One order |
| PUT | `/api/v1/orders/:orderId` | admin | Change status (`{"newStatus": "DELIVERED"}`) |

### Examples

Register and log in:

```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"username":"sam","fullname":"Sam Doe","email":"sam@example.com","password":"a-long-password"}'
# 201 {"message":"User is successfully registered","data":{"_id":"...","username":"sam",...}}

curl -X POST http://localhost:8080/api/v1/users/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"sam","password":"a-long-password"}'
# 200 {"message":"User logged in successfully","data":{"_id":"...","username":"sam",...,"sessionToken":"<jwt>"}}
```

Create a category as an admin, then read it publicly:

```bash
curl -X POST http://localhost:8080/api/v1/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Starters","description":"Small plates","image":"https://example.com/starters.jpg"}'
# 201 {"message":"Category created successfully","data":{"_id":"...","name":"Starters",...}}

curl http://localhost:8080/api/v1/categories
# 200 {"data":[{...}],"message":"Successfully fetched all categories."}
```

Create a menu (items as an array, or as a map keyed by food item id):

```bash
curl -X POST http://localhost:8080/api/v1/menus \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' \
  -d '{"restaurantId":"<id>","description":"Lunch","menuForRestaurant":[{"fooditemId":"<id>","fooditemName":"Margherita","fooditemImage":"https://example.com/m.jpg","fooditemPrice":9.5}]}'
```

Place an order (the user id comes from the token; any `userId` in the body is ignored):

```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"restaurantId":"<id>","orderTotalPrice":19,"fooditems":[{"fooditemId":"<id>","price":9.5,"units":2}],"shippingDetails":{"address":"1 Main St","phoneNo":5551112222,"emailId":"sam@example.com"}}'
# 201 {"message":"Order is successfully placed","data":{"orderId":"..."}}
```

Errors always look like `{"message": "..."}`, for example `404 {"message":"Category not found"}` or `400 {"message":"Missing required fields: name, image"}`.

## Project structure

```
server.js                     app setup; exports { app, start, stop }; auto-starts only when run directly
app/
  constants.js                configuration read from environment variables
  database/
    databaseInit.js           Mongoose connection
    repositories/             all database queries, one file per model
  helpers/                    HttpError, password hashing, tokens, validation helpers
  middleware/                 auth, isAdmin, selfOrAdmin; 404 and error handlers
  models/                     Mongoose schemas
  routes/                     URL to handler wiring with per-route auth
  services/                   request handlers: validation, rules, responses
scripts/createAdmin.js        creates or promotes an admin user
test/                         mocha suites (see below)
```

## What I practised

- Structuring an Express API into routes, services and repositories, and keeping Mongoose out of the request handlers
- JWT authentication backed by a session collection, plus role checks and per-user ownership checks
- Centralised error handling (a custom `HttpError`, correct middleware order, mapping Mongoose validation and cast errors to 400)
- Safe credential handling: bcrypt hashing, secrets from environment variables, never returning hashes, failing fast on missing configuration
- Writing API tests with mocha, chai and supertest against a separate database, including auth and permission cases
- Making a server testable by exporting `app`, `start` and `stop` and starting to listen only when run directly

## Improvements over the original assessment version

The source was two copies of the same project: a completed service layer without tests, and the unit-testing assessment with tests and a starter-style service layer. They were merged, then:

- Config: JWT secret, database URI and port moved out of `constants.js` into environment variables with `.env.example`; startup fails with a clear message if the secret is missing; the database URI is no longer logged; deprecated Mongoose connect options removed
- Passwords were stored and compared as plaintext. They are now hashed with bcrypt; user list and detail endpoints no longer return password fields
- Authorization gaps closed: public sign-up could create admins (now needs `ALLOW_ADMIN_SIGNUP` or `npm run create-admin`); any logged-in user could read or edit any user and any user's orders; orders took the user id from the request body; non-admins got 401 instead of 403
- `server.js`: error handler was registered before the routes (so it never ran) and bodies were parsed twice (`express.json` plus an undeclared `body-parser`). Fixed; `/health` added; `start`/`stop` now really listen, close the server and disconnect Mongoose, and cannot double-listen
- Error handling: every failure used to be flattened into a 500 (and "not found" tried to send a body with 204). Services now throw `HttpError`s, giving 400/404/409 where appropriate, and 500 responses no longer leak internal messages
- The completed `fooditemService` called its repository with the wrong signature; repositories were rewritten to take a data object and update only the fields sent
- Menu creation destructured `Object.entries` incorrectly and menu price updates did not wait for the database write; both fixed, and price updates are limited to the menu being edited
- Order model: `userId` is an `ObjectId` (the assessment copy used `String`)
- Timestamps defaulted to the time the server started (`new Date()` evaluated once); now `Date.now`
- Removed leftover template markers, debug logging (including a line that logged bearer tokens), dead code, an unused `chai-http` dependency and committed `.DS_Store` files
- Tests: replaced the four starter test files with a suite covering health, users, catalogue CRUD, menus and orders, including 401/403/404/400 cases and the password handling; the suite refuses to run against a database not named `*_test`

## Known limitations and next steps

- Passwords stored as plaintext by the original version are not migrated; such users cannot log in and must be re-created
- Logging in again returns the existing valid session token, so two devices share one session and logging out on one ends both
- No rate limiting, request logging, pagination or input sanitisation beyond type checks and Mongoose validation; `helmet` is not used
- Food items, menus and orders do not verify that the ids they reference exist
- Order status is a free string, and totals are taken from the client rather than computed from menu prices
- Soft-deleted records stay in the database and there is no restore endpoint
- Not connected to a front end (see Overview)

## Status

- Verified here: every file passes `node --check`; all application and test modules load with third-party packages stubbed (checks require paths and imported names); the error handler, validation helpers, `HttpError`, `selfOrAdmin`/`isAdmin` and the configuration rules (missing secret fails fast, test runs use a `_test` database) were exercised directly with plain Node.
- Not verified: `npm install` could not run in the environment where this was prepared (the package registry was blocked) and no MongoDB server was available, so the Express app was not booted and the mocha/supertest suite has not been run. Treat the tests as unrun until you run them: start MongoDB (step 1 above), `npm install`, then `npm test`. Fix any failure you see; there may be small mistakes in code and tests that only a real run exposes.
- There is no `package-lock.json` yet (the original was removed rather than hand-edited). The first `npm install` creates one; commit it.
- Not production-ready: see limitations above.
