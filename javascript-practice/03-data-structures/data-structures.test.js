'use strict';
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { Stack, isBalanced } = require('./stack');
const { PrinterQueue, countStudentsUnableToEat } = require('./queue');

// PrinterQueue logs as it works; keep test output readable.
let originalLog;
beforeEach(() => { originalLog = console.log; console.log = () => {}; });
afterEach(() => { console.log = originalLog; });

test('Stack is LIFO and reports underflow', () => {
  const s = new Stack();
  assert.equal(s.isEmpty(), true);
  assert.equal(s.pop(), 'Underflow');
  assert.equal(s.peek(), null);
  s.push(10); s.push(20); s.push(30);
  assert.equal(s.size, 3);
  assert.equal(s.printStack(), '10 20 30');
  assert.equal(s.pop(), 30);
  assert.equal(s.peek(), 20);
});

test('isBalanced', () => {
  assert.equal(isBalanced('{(a+b)-c}*[a-{b*c}]'), true);
  assert.equal(isBalanced('{(a+b-c}*[a-{b*c}]'), false);
  assert.equal(isBalanced(''), true);
  assert.equal(isBalanced('((('), false);
  assert.equal(isBalanced(')('), false);
  assert.equal(isBalanced('([)]'), false);
});

test('PrinterQueue is FIFO', () => {
  const q = new PrinterQueue();
  assert.equal(q.dequeue(), null);
  assert.equal(q.peek(), null);
  q.enqueue('A'); q.enqueue('B'); q.enqueue('C');
  assert.equal(q.peek(), 'Next document to print: A');
  assert.equal(q.dequeue(), 'A');
  assert.deepEqual(q.toArray(), ['B', 'C']);
  assert.equal(q.size, 2);
});

test('PrinterQueue survives many enqueue/dequeue cycles', () => {
  const q = new PrinterQueue();
  for (let i = 0; i < 1000; i++) q.enqueue(i);
  for (let i = 0; i < 1000; i++) assert.equal(q.dequeue(), i);
  assert.equal(q.isEmpty(), true);
});

test('countStudentsUnableToEat', () => {
  assert.equal(countStudentsUnableToEat([1, 0, 1, 0], [0, 1, 0, 1]), 0);
  assert.equal(countStudentsUnableToEat([1, 1, 0, 0], [0, 1, 0, 1]), 0);
  assert.equal(countStudentsUnableToEat([1, 1, 1, 0, 0, 1], [1, 0, 0, 0, 1, 1]), 3);
});

test('countStudentsUnableToEat does not mutate its inputs', () => {
  const students = [1, 1, 0, 0];
  const sandwiches = [0, 1, 0, 1];
  countStudentsUnableToEat(students, sandwiches);
  assert.deepEqual(students, [1, 1, 0, 0]);
  assert.deepEqual(sandwiches, [0, 1, 0, 1]);
});
