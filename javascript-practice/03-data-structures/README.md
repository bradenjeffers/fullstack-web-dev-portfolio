# Data Structures in JavaScript: Stack and Queue

A stack, a printer queue, a balanced-brackets checker and a queue-simulation puzzle.

## Overview

Originally the "Data Structures using JavaScript" assessment from a Great Learning full-stack course (four problem statements). Each data structure is its own module with a demo and unit tests.

## What's covered

| Problem | File | Idea |
| --- | --- | --- |
| `Stack` class | `stack.js` | LIFO, `push` / `pop` / `peek`, underflow handling |
| `isBalanced(expression)` | `stack.js` | checks `()`, `{}`, `[]` nesting using the stack, O(n) |
| `PrinterQueue` class | `queue.js` | FIFO, `enqueue` / `dequeue` / `peek` |
| `countStudentsUnableToEat` | `queue.js` | queue + stack simulation (LeetCode 1700) |

## Getting started

Requires Node.js 18 or newer. No dependencies.

```bash
node stack.js
node queue.js
node --test
```

## What I practised

- Implementing data structures from scratch with ES6 classes
- Using the right structure for the job (a stack makes bracket matching simple)
- Thinking about complexity: `Array#shift()` is O(n), so the queue uses a head index instead
- Writing tests for edge cases (empty structures, many operations in a row, inputs not being mutated)

## Improvements over the original assessment version

- **Queue performance:** `dequeue` was `Array#shift()`, which re-indexes the whole array on every call. It now advances a head index and compacts occasionally (amortised O(1)). A test runs 1,000 enqueue/dequeue cycles.
- **No hidden mutation:** `countStudentsUnableToEat` used to consume the arrays the caller passed in. It now works on copies (tested).
- `isBalanced` builds its bracket lookup once instead of on every call, and iterates with `for...of`.
- Added `size` getters and `toArray()` so state can be inspected without poking at internals.
- Classes are exported, and the demo code only runs when a file is executed directly.

## Limitations

`Stack.pop()` returns the string `"Underflow"` on an empty stack because the assessment specified it. That sentinel could collide with a real stored value; a production version would throw or return `undefined`.

## Status

All 6 tests pass on Node 22. Both demos run without errors.
