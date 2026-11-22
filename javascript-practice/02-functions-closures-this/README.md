# JavaScript Functions, Closures and `this`

Exercises on function expressions, IIFEs, closures, callbacks, higher-order functions, and `call` / `apply` / `bind`.

## Overview

Originally the "Basics of JS 2" assessment from a Great Learning full-stack course. I reorganised the solutions into two modules, made every function testable, and fixed a few sloppy-mode habits.

## What's covered

| File | Topics |
| --- | --- |
| `functions-and-objects.js` | anonymous functions, IIFEs, closures (`multiplyBy`), in-place array updates with callbacks, `apply`, objects |
| `higher-order-and-this.js` | `filter`/`reduce`, borrowing methods with `call`, partial application with `bind`, function factories, properties on functions |
| `functions.test.js` | 11 tests with Node's built-in test runner |

## Getting started

Requires Node.js 18 or newer. No dependencies.

```bash
node functions-and-objects.js
node higher-order-and-this.js
node --test
```

## What I practised

- How closures keep a private variable alive (`multiplyBy`, `createMultiplier`)
- How `this` is decided at call time, and how `call`, `apply` and `bind` change it
- Passing functions as arguments and returning them from other functions
- Choosing between mutating an array in place and returning a new one, and testing which one a function does

## Improvements over the original assessment version

- Removed an implicit global (`persons = [...]` with no declaration, which only worked in sloppy mode); everything runs under `'use strict'`.
- `findOldestPerson` no longer throws on an empty list (the original `reduce` had no initial value); it returns `undefined`.
- Functions return their results and the demo output lives in an `if (require.main === module)` block, so the modules can be imported and tested.
- Clearer names (`updateArrayInPlace` instead of `UpdateArray`), `const` instead of `var`, and a test that proves the in-place functions really keep the same array reference.

## Status

All 11 tests pass on Node 22. Both demo scripts run without errors.
