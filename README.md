# Full-Stack Web Development Portfolio

Projects from a full-stack web development program, cleaned up and documented: core JavaScript, a browser app series, a food-ordering application built from static HTML up to a React client, two REST APIs and two database designs.

Everything here began as coursework (Great Learning assessments). I kept the original solutions and improved them: fixed bugs, removed security problems, added tests and wrote READMEs that say what each project does and what has and hasn't been verified.

## Contents

### [`food-order-app/`](food-order-app): one application in eight layers

| Project | What it shows |
| --- | --- |
| [`01-html-admin-pages`](food-order-app/01-html-admin-pages) | Semantic, accessible HTML pages and forms |
| [`02-css-admin-dashboard`](food-order-app/02-css-admin-dashboard) | Responsive layout with flexbox and grid |
| [`03-react-frontend`](food-order-app/03-react-frontend) | React components, state, role-based views |
| [`04-react-redux-frontend`](food-order-app/04-react-redux-frontend) | Redux (thunk, persist), routing, axios against a real API |
| [`05-node-http-api`](food-order-app/05-node-http-api) | A REST API with only Node's built-in modules, 44 tests |
| [`06-express-mongodb-api`](food-order-app/06-express-mongodb-api) | Express, MongoDB, JWT auth, bcrypt, role checks, API tests |
| [`07-sql-database`](food-order-app/07-sql-database) | MySQL schema (13 tables), seed data, queries, ER diagram |
| [`08-nosql-mongodb-database`](food-order-app/08-nosql-mongodb-database) | MongoDB document model, mongosh scripts, SQL comparison |

### [`javascript-practice/`](javascript-practice): eight smaller projects

Conditionals and loops, closures and `this`, stacks and queues, DOM manipulation, ES6 classes, a recipe book, a football-club browser, a video player and a client-side auth flow. [Details here.](javascript-practice)

## Skills demonstrated

| Area | Where |
| --- | --- |
| JavaScript (ES6+), async/await, closures, classes | `javascript-practice/` |
| DOM, forms, accessibility, responsive CSS | `javascript-practice/04-08`, `food-order-app/01-02` |
| React, Redux, React Router | `food-order-app/03-04` |
| REST API design, Node.js, Express | `food-order-app/05-06` |
| Authentication and security basics (JWT, password hashing, role checks, input handling) | `food-order-app/06`, `javascript-practice/08` |
| Relational and document database design, SQL, MongoDB | `food-order-app/07-08` |
| Automated testing (`node:test`, mocha, supertest, React Testing Library) | throughout |

## Verification status

Honest summary of how each part was checked when this repository was prepared (details are in each README):

| Project | Status |
| --- | --- |
| `javascript-practice/01`, `02`, `03` | Unit tests pass (Node 22) |
| `javascript-practice/05`, `08` | Unit tests pass (Node 22) and exercised in headless Chromium |
| `javascript-practice/04`, `06`, `07` | Exercised in headless Chromium; no automated tests |
| `food-order-app/01-02` | Loaded in headless Chromium; links checked |
| `food-order-app/05` | 44 tests pass (Node 22) |
| `food-order-app/03`, `04` | Source parsed and linted; **`npm install`, build and tests not yet run** (CI workflow included) |
| `food-order-app/06` | Source parsed and loaded with stubs; **never booted against MongoDB, tests not yet run** (CI workflow included) |
| `food-order-app/07` | Schema, seed and all queries run through a SQLite stand-in; **not yet run on real MySQL 8** |
| `food-order-app/08` | Scripts run against a mock of `mongosh`; **not yet run on real MongoDB** |

The GitHub Actions workflow in `.github/workflows/ci.yml` installs, builds and tests the Node and React projects (with a MongoDB service for `06`).

## Running things

Each project's README has exact commands. Requirements: Node.js 18+ (22 recommended). MongoDB for `06`, MySQL 8 for `07`, `mongosh` for `08`.

## License

[MIT](LICENSE). Sample data in this repository is fictional demo data.
