# JavaScript Basics: Conditionals, Loops and Arrays

Twenty small exercises covering JavaScript fundamentals, written as tested, reusable functions.

## Overview

This began as two "Basics of JS" assessments from a Great Learning full-stack course. Each exercise was a script that printed to the console. I turned them into pure functions (they return values rather than print), added edge-case handling, and wrote unit tests.

## What's covered

| File | Topics |
| --- | --- |
| `conditionals.js` | booleans, comparison, `if`/`switch`, ternaries, leap years, vowels, grading scale |
| `loops-and-arrays.js` | `for`, `for...of`, `while`, triangle types, discounts, factorial, Fibonacci, star patterns, string reversal |
| `basics.test.js` | 11 tests with Node's built-in test runner |

## Getting started

Requires Node.js 18 or newer. There are no dependencies.

```bash
node conditionals.js       # run the demo output
node loops-and-arrays.js
node --test                # run the tests
```

## What I practised

- Choosing the right control structure (`if` chain vs `switch` vs ternary)
- Writing functions that return values so they can be tested
- Handling edge cases and invalid input deliberately (`RangeError` instead of returning a string)
- Writing unit tests with `node:test` and `node:assert`

## Improvements over the original assessment version

- **Bug fix:** the original "largest of three numbers" returned the wrong answer when the two largest values tied (`10, 10, 8` returned `8`). It now uses `Math.max`, with a regression test.
- **Triangle types:** now rejects impossible triangles (zero/negative sides, or sides that violate the triangle inequality).
- **Vowel check:** non-letters are reported as "not a letter" rather than "consonant".
- **Factorial / Fibonacci / star pattern:** invalid input throws a `RangeError` instead of returning an error string mixed in with normal results.
- **Reverse string:** uses `Array.from`, so emoji and other surrogate pairs aren't split in half.
- **Grading:** rejects percentages outside 0-100.
- Output moved from scattered `console.log` calls into a demo block that only runs when the file is executed directly.

## Limitations

These are teaching exercises, not a library. `var` declarations and the exact console output of the original assessment were replaced with `const`/`let` and returned values.

## Status

All 11 tests pass on Node 22 (`node --test`). Both demo scripts run without errors.
