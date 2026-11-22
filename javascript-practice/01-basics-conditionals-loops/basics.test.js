'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const c = require('./conditionals');
const l = require('./loops-and-arrays');

test('conditionals', () => {
  assert.equal(c.isHappy('Smile'), true);
  assert.equal(c.isHappy('Frown'), false);
  assert.equal(c.parity(7), 'odd');
  assert.equal(c.parity(0), 'even');
  assert.equal(c.signOf(-5), 'negative');
  assert.equal(c.signOf(0), 'zero');
  assert.equal(c.gradeFor(85), 'B');
  assert.equal(c.gradeFor(59), 'F');
  assert.throws(() => c.gradeFor(101), RangeError);
});

test('leap years follow the Gregorian rule', () => {
  assert.equal(c.isLeapYear(2000), true);
  assert.equal(c.isLeapYear(1900), false);
  assert.equal(c.isLeapYear(2024), true);
  assert.equal(c.isLeapYear(2022), false);
});

test('classifyLetter handles non-letters', () => {
  assert.equal(c.classifyLetter('A'), 'vowel');
  assert.equal(c.classifyLetter('z'), 'consonant');
  assert.equal(c.classifyLetter('7'), 'not a letter');
  assert.equal(c.classifyLetter('ab'), 'not a letter');
});

test('largestOfThree handles ties (regression for the original if/else chain)', () => {
  assert.equal(c.largestOfThree(10, 10, 8), 10);
  assert.equal(c.largestOfThree(1, 2, 3), 3);
  assert.equal(c.largestOfThree(-1, -5, -3), -1);
});

test('triangleType', () => {
  assert.equal(l.triangleType(3, 3, 3), 'Equilateral');
  assert.equal(l.triangleType(5, 5, 8), 'Isosceles');
  assert.equal(l.triangleType(3, 4, 5), 'Scalene');
  assert.equal(l.triangleType(1, 2, 10), 'Not a triangle');
  assert.equal(l.triangleType(0, 4, 4), 'Not a triangle');
});

test('array helpers', () => {
  assert.equal(l.countOccurrences([1, 2, 3, 2, 4, 2, 5], 2), 3);
  assert.equal(l.calculateTotalPrice([10, 20, 30, 40]), 100);
  assert.deepEqual(l.applyDiscount([10, 20, 30, 40], 20), [8, 16, 24, 32]);
  assert.deepEqual(l.getOutOfStockProducts([2, 0, 4, 0, 3]), [1, 3]);
});

test('multiplication table', () => {
  const table = l.multiplicationTable(7);
  assert.equal(table.length, 10);
  assert.equal(table[0], '7 * 1 = 7');
  assert.equal(table[9], '7 * 10 = 70');
});

test('factorial', () => {
  assert.equal(l.factorial(0), 1);
  assert.equal(l.factorial(5), 120);
  assert.equal(l.factorial(10), 3628800);
  assert.throws(() => l.factorial(-1), RangeError);
  assert.throws(() => l.factorial(2.5), RangeError);
});

test('fibonacci', () => {
  assert.deepEqual(l.fibonacciSeries(1), [0]);
  assert.deepEqual(l.fibonacciSeries(5), [0, 1, 1, 2, 3]);
  assert.deepEqual(l.fibonacciSeries(10), [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
  assert.throws(() => l.fibonacciSeries(0), RangeError);
});

test('star triangle', () => {
  assert.deepEqual(l.starTriangle(3), ['*', '* *', '* * *']);
  assert.throws(() => l.starTriangle(0), RangeError);
});

test('reverseString keeps emoji intact', () => {
  assert.equal(l.reverseString('Hello, World!'), '!dlroW ,olleH');
  assert.equal(l.reverseString(''), '');
  assert.equal(l.reverseString('a😀b'), 'b😀a');
});
