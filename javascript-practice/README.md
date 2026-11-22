# JavaScript Practice

Eight small JavaScript projects, from core language features to browser apps. Each folder has its own README.

| # | Project | Focus | Runs in |
| --- | --- | --- | --- |
| 1 | [`01-basics-conditionals-loops`](01-basics-conditionals-loops) | conditionals, loops, arrays, edge cases | Node (11 tests) |
| 2 | [`02-functions-closures-this`](02-functions-closures-this) | closures, IIFEs, `call`/`apply`/`bind`, higher-order functions | Node (11 tests) |
| 3 | [`03-data-structures`](03-data-structures) | stack, queue, bracket matching | Node (6 tests) |
| 4 | [`04-dom-portfolio-page`](04-dom-portfolio-page) | DOM manipulation, forms | Browser |
| 5 | [`05-es6-oop-recipe-book`](05-es6-oop-recipe-book) | ES6 classes, `localStorage` | Browser + Node (6 tests) |
| 6 | [`06-es6-oop-football-clubs`](06-es6-oop-football-clubs) | search, views, event delegation | Browser |
| 7 | [`07-built-in-functions-video-player`](07-built-in-functions-video-player) | array built-ins, media element API | Browser |
| 8 | [`08-advanced-js-auth-and-fetch`](08-advanced-js-auth-and-fetch) | async/await, fetch, Web Crypto, storage | Browser + Node (8 tests) |

## Running

Node.js 18 or newer is enough for everything here. There are no dependencies and no build step.

```bash
cd 01-basics-conditionals-loops && node --test    # same for 02, 03, 05, 08
```

The browser projects open straight from `index.html`; project 8 needs a local server and the API from `../food-order-app/05-node-http-api` (see its README).

## Notes

These began as coursework assessments from a Great Learning full-stack course. I kept the original solutions and improved them: tested pure functions instead of console scripts, no `innerHTML` with user input, accessible forms, and fixes for real bugs (for example the video player's search-then-click bug, and a tie bug in "largest of three"). Each README has the details.
