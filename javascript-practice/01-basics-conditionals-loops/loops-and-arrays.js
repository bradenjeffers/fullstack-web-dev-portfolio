'use strict';

/**
 * Loops, arrays and small algorithms (triangle types, discounts, factorial,
 * Fibonacci, star patterns, string reversal).
 * Functions return values instead of printing so they are easy to test.
 */

/** 'Equilateral' | 'Isosceles' | 'Scalene' | 'Not a triangle'. */
function triangleType(a, b, c) {
  const sides = [a, b, c].sort((x, y) => x - y);
  const valid = sides.every((s) => Number.isFinite(s) && s > 0) && sides[0] + sides[1] > sides[2];
  if (!valid) return 'Not a triangle';
  if (a === b && b === c) return 'Equilateral';
  if (a === b || b === c || a === c) return 'Isosceles';
  return 'Scalene';
}

/** Count occurrences of `target` in `arr` with a for...of loop. */
function countOccurrences(arr, target) {
  let count = 0;
  for (const element of arr) {
    if (element === target) count++;
  }
  return count;
}

function calculateTotalPrice(prices) {
  let total = 0;
  for (const price of prices) total += price;
  return total;
}

/** Apply a percentage discount to every price; returns a new array. */
function applyDiscount(prices, discountPercent) {
  const factor = 1 - discountPercent / 100;
  return prices.map((price) => price * factor);
}

/** Indices of products whose quantity is 0. */
function getOutOfStockProducts(quantities) {
  const indices = [];
  for (let i = 0; i < quantities.length; i++) {
    if (quantities[i] === 0) indices.push(i);
  }
  return indices;
}

/** ['7 * 1 = 7', ..., '7 * 10 = 70'] */
function multiplicationTable(n, upTo = 10) {
  const lines = [];
  let i = 1;
  while (i <= upTo) {
    lines.push(`${n} * ${i} = ${n * i}`);
    i++;
  }
  return lines;
}

/** n! for non-negative integers. Throws RangeError otherwise. */
function factorial(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError('Input must be a non-negative integer');
  }
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/** First `terms` Fibonacci numbers, starting 0, 1. */
function fibonacciSeries(terms) {
  if (!Number.isInteger(terms) || terms <= 0) {
    throw new RangeError('Input must be a positive integer');
  }
  const series = [];
  for (let i = 0; i < terms; i++) {
    series.push(i < 2 ? i : series[i - 1] + series[i - 2]);
  }
  return series;
}

/** Left-aligned star triangle as an array of lines: ['*', '* *', ...]. */
function starTriangle(rows) {
  if (!Number.isInteger(rows) || rows <= 0) {
    throw new RangeError('Input must be a positive integer');
  }
  return Array.from({ length: rows }, (_, i) => Array(i + 1).fill('*').join(' '));
}

/** Reverse a string; Array.from keeps emoji / surrogate pairs intact. */
function reverseString(input) {
  return Array.from(input).reverse().join('');
}

module.exports = {
  triangleType, countOccurrences, calculateTotalPrice, applyDiscount,
  getOutOfStockProducts, multiplicationTable, factorial, fibonacciSeries,
  starTriangle, reverseString,
};

if (require.main === module) {
  console.log('Triangle (5, 5, 8):', triangleType(5, 5, 8));
  console.log('Occurrences of 2:', countOccurrences([1, 2, 3, 2, 4, 2, 5], 2));
  console.log('Total price:', calculateTotalPrice([10, 20, 30, 40]));
  console.log('20% off:', applyDiscount([10, 20, 30, 40], 20));
  console.log('Out of stock at indices:', getOutOfStockProducts([2, 0, 4, 0, 3]));
  console.log(multiplicationTable(7).join('\n'));
  console.log('5! =', factorial(5), '| 0! =', factorial(0));
  try { factorial(-1); } catch (e) { console.log('factorial(-1) ->', e.message); }
  console.log('Fibonacci(10):', fibonacciSeries(10).join(' '));
  console.log(starTriangle(5).join('\n'));
  console.log(reverseString('Hello, World!'));
}
