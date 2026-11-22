'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const f = require('./functions-and-objects');
const h = require('./higher-order-and-this');

test('square and greeting', () => {
  assert.equal(f.square(2), 4);
  assert.equal(f.greeting('Harry'), 'Hello Harry, Welcome to Great Learning!');
});

test('incrementAll mutates in place', () => {
  const nums = [1, 2, 3];
  const result = f.incrementAll(nums);
  assert.equal(result, nums);
  assert.deepEqual(nums, [3, 4, 5]);
});

test('updateArrayInPlace keeps the same array reference', () => {
  const nums = [1, 2, 3];
  const result = f.updateArrayInPlace(nums, f.doubleNumber);
  assert.equal(result, nums);
  assert.deepEqual(nums, [2, 4, 6]);
});

test('closure-based multiplyBy', () => {
  assert.equal(f.multiplyBy(5), 10);
  assert.equal(f.multiplyBy(10), 20);
});

test('findMaxInArray and valuesByKey', () => {
  assert.equal(f.findMaxInArray([10, 5, 8, 20, 3]), 20);
  assert.deepEqual(f.valuesByKey([{ a: 1 }, { a: 2 }], 'a'), [1, 2]);
});

test('filterBy returns a new array', () => {
  const nums = [1, 2, 3, 4, 5, 6];
  const evens = h.filterBy(nums, h.isEven);
  assert.deepEqual(evens, [2, 4, 6]);
  assert.notEqual(evens, nums);
});

test('IIFE results', () => {
  assert.equal(h.factorialOf5, 120);
  assert.equal(h.sum, 15);
});

test('call() changes this', () => {
  const product = { title: 'Sony TV', price: 100, category: 'Electronics' };
  assert.equal(h.describeProduct.call(product), 'Title: Sony TV Price: 100 Category: Electronics');
  assert.equal(h.printContext.call(product), product);
  assert.equal(h.introduce.call({ name: 'Alice', age: 30 }), 'Hi, my name is Alice and I am 30 years old.');
});

test('findOldestPerson, including the empty-list edge case', () => {
  const people = [{ name: 'Harry', age: 12 }, { name: 'Ron', age: 11 }, { name: 'Hermione', age: 13 }];
  assert.equal(h.findOldestPerson(people).name, 'Hermione');
  assert.equal(h.findOldestPerson([]), undefined);
});

test('bind and higher-order multiplier', () => {
  assert.equal(h.double(5), 10);
  assert.equal(h.createMultiplier(3)(5), 15);
});

test('functions can carry properties', () => {
  assert.equal(h.calculate(2, 3), 5);
  assert.equal(h.calculate.description, 'This function adds two numbers.');
});
